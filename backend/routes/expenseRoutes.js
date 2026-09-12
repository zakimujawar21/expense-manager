const express = require("express");
const {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
} = require("../controllers/expenseController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);
module.exports = router;