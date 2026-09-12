const Expense = require("../models/Expense");

const createExpense = async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({
                message: "Title, amount and category are required",
            });
        }

        const expense = await Expense.create({
            title,
            amount,
            category,
            date,
            user: req.user,
        });

        res.status(201).json({
            message: "Expense created successfully",
            expense,
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            user: req.user,
        }).sort({ date: -1 });

        res.status(200).json({
            message: "Expenses fetched successfully",
            expenses,
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user,
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }

        expense.title = title || expense.title;
        expense.amount = amount || expense.amount;
        expense.category = category || expense.category;
        expense.date = date || expense.date;

        await expense.save();

        res.status(200).json({
            message: "Expense updated successfully",
            expense,
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            user: req.user,
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};
module.exports = {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
};