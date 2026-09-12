import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {

    const [expenses, setExpenses] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        date: "",
    });

    const [editingId, setEditingId] = useState(null);

    // User name
    const userName = localStorage.getItem("userName");

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

    // Success / Error message
    const [message, setMessage] = useState({
        type: "",
        text: "",
    });

    // Search and filter
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");


    useEffect(() => {
        fetchExpenses();
    }, []);


    // Fetch expenses
    const fetchExpenses = async () => {
        try {
            setLoading(true);

            const response = await api.get("/expenses");

            setExpenses(response.data.expenses);

        } catch (error) {
            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to load expenses.",
            });

        } finally {
            setLoading(false);
        }
    };


    // Form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setMessage({
            type: "",
            text: "",
        });
    };


    // Add / Update expense
    const handleSubmit = async (e) => {
        e.preventDefault();

        const title = formData.title.trim();
        const amount = Number(formData.amount);

        if (!title || !formData.amount || !formData.category || !formData.date) {
            setMessage({
                type: "error",
                text: "Please fill all expense fields.",
            });

            return;
        }

        if (title.length < 2) {
            setMessage({
                type: "error",
                text: "Expense title must be at least 2 characters.",
            });

            return;
        }

        if (amount <= 0) {
            setMessage({
                type: "error",
                text: "Amount must be greater than 0.",
            });

            return;
        }

        if (amount > 100000000) {
            setMessage({
                type: "error",
                text: "Please enter a valid expense amount.",
            });

            return;
        }

        try {
            setActionLoading(true);

            setMessage({
                type: "",
                text: "",
            });

            if (editingId) {

                const response = await api.put(
                    `/expenses/${editingId}`,
                    {
                        ...formData,
                        title,
                        amount,
                    }
                );

                setExpenses((prevExpenses) =>
                    prevExpenses.map((expense) =>
                        expense._id === editingId
                            ? response.data.expense
                            : expense
                    )
                );

                setEditingId(null);

                setMessage({
                    type: "success",
                    text: "Expense updated successfully.",
                });

            } else {

                const response = await api.post(
                    "/expenses",
                    {
                        ...formData,
                        title,
                        amount,
                    }
                );

                setExpenses((prevExpenses) => [
                    response.data.expense,
                    ...prevExpenses,
                ]);

                setMessage({
                    type: "success",
                    text: "Expense added successfully.",
                });
            }

            setFormData({
                title: "",
                amount: "",
                category: "",
                date: "",
            });

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Something went wrong.",
            });

        } finally {
            setActionLoading(false);
        }
    };


    // Delete expense
    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);

            setMessage({
                type: "",
                text: "",
            });

            await api.delete(`/expenses/${id}`);

            setExpenses((prevExpenses) =>
                prevExpenses.filter(
                    (expense) => expense._id !== id
                )
            );

            setMessage({
                type: "success",
                text: "Expense deleted successfully.",
            });

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to delete expense.",
            });

        } finally {
            setActionLoading(false);
        }
    };


    // Delete account
    const handleDeleteAccount = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to delete your account?\n\n" +
            "This will permanently delete your account and all your expenses.\n\n" +
            "This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleteAccountLoading(true);

            setMessage({
                type: "",
                text: "",
            });

            await api.delete("/auth/delete-account");

            localStorage.removeItem("token");
            localStorage.removeItem("userName");

            window.location.href = "/register";

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to delete account.",
            });

            setDeleteAccountLoading(false);
        }
    };


    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        window.location.href = "/login";
    };


    // Edit expense
    const handleEdit = (expense) => {
        setEditingId(expense._id);

        setFormData({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date
                ? new Date(expense.date)
                    .toISOString()
                    .split("T")[0]
                : "",
        });

        setMessage({
            type: "",
            text: "",
        });
    };


    // Cancel editing
    const handleCancelEdit = () => {
        setEditingId(null);

        setFormData({
            title: "",
            amount: "",
            category: "",
            date: "",
        });
    };


    // Current month statistics
    const currentDate = new Date();

    const currentMonthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);

        return (
            expenseDate.getMonth() === currentDate.getMonth() &&
            expenseDate.getFullYear() === currentDate.getFullYear()
        );
    });

    const currentMonthAmount = currentMonthExpenses.reduce(
        (total, expense) =>
            total + Number(expense.amount),
        0
    );


    // Search + category filter
    const filteredExpenses = expenses.filter((expense) => {

        const matchesSearch = expense.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
            filterCategory === "" ||
            expense.category === filterCategory;

        return matchesSearch && matchesCategory;
    });


    return (
        <div className="dashboard">

            {/* Header */}
            <header className="dashboard-header">

                <div>
                    <h1>
                        {userName
                            ? `${userName}'s Expense List`
                            : "Expense Manager"}
                    </h1>

                    <p>
                        Track and manage your expenses
                    </p>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </header>


            {/* Success / Error Message */}
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}


            {/* Summary */}
            <section className="summary">

                <div className="summary-card">
                    <span>Total Expenses</span>
                    <h2>{expenses.length}</h2>
                </div>

                <div className="summary-card">
                    <span>Total Amount</span>

                    <h2>
                        ₹{expenses.reduce(
                            (total, expense) =>
                                total + Number(expense.amount),
                            0
                        )}
                    </h2>
                </div>

                <div className="summary-card">
                    <span>This Month's Expenses</span>
                    <h2>{currentMonthExpenses.length}</h2>
                </div>

                <div className="summary-card">
                    <span>This Month's Amount</span>

                    <h2>
                        ₹{currentMonthAmount}
                    </h2>
                </div>

            </section>


            {/* Add / Edit Expense */}
            <section className="expense-form-section">

                <h2>
                    {editingId
                        ? "Edit Expense"
                        : "Add New Expense"}
                </h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="title"
                        placeholder="Expense title"
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={formData.amount}
                        onChange={handleChange}
                    />

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">
                            Select category
                        </option>

                        <option value="Food">Food</option>
                        <option value="Travel">Travel</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Entertainment">
                            Entertainment
                        </option>
                        <option value="Health">Health</option>
                        <option value="Education">
                            Education
                        </option>
                        <option value="Other">Other</option>
                    </select>

                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        disabled={actionLoading || deleteAccountLoading}
                    >
                        {actionLoading
                            ? "Please wait..."
                            : editingId
                                ? "Update Expense"
                                : "Add Expense"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={actionLoading}
                        >
                            Cancel
                        </button>
                    )}

                </form>

            </section>


            {/* Expense List */}
            <section className="expense-list-section">

                <h2>Your Expenses</h2>

                {/* Search + Filter */}
                <div className="expense-filters">

                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                    <select
                        value={filterCategory}
                        onChange={(e) =>
                            setFilterCategory(e.target.value)
                        }
                    >
                        <option value="">
                            All Categories
                        </option>

                        <option value="Food">Food</option>
                        <option value="Travel">Travel</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Entertainment">
                            Entertainment
                        </option>
                        <option value="Health">Health</option>
                        <option value="Education">
                            Education
                        </option>
                        <option value="Other">Other</option>
                    </select>

                </div>


                {/* Loading / Empty State */}
                {loading ? (

                    <p>Loading expenses...</p>

                ) : filteredExpenses.length === 0 ? (

                    <p>
                        {expenses.length === 0
                            ? "No expenses found."
                            : "No matching expenses found."}
                    </p>

                ) : (

                    <div className="expense-list">

                        {filteredExpenses.map((expense) => (

                            <div
                                className="expense-card"
                                key={expense._id}
                            >

                                <div>

                                    <h3>
                                        {expense.title}
                                    </h3>

                                    <p>
                                        {expense.category}
                                    </p>

                                    <p>
                                        {expense.date
                                            ? new Date(
                                                expense.date
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )
                                            : "No date"}
                                    </p>

                                </div>

                                <div>

                                    <strong>
                                        ₹{expense.amount}
                                    </strong>

                                    <button
                                        onClick={() =>
                                            handleEdit(expense)
                                        }
                                        disabled={actionLoading}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                expense._id
                                            )
                                        }
                                        disabled={actionLoading}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* Account Settings */}
            <section className="account-section">

                <h2>Account</h2>

                <p>
                    Permanently delete your account and all
                    associated expenses.
                </p>

                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={
                        actionLoading ||
                        deleteAccountLoading
                    }
                >
                    {deleteAccountLoading
                        ? "Deleting Account..."
                        : "Delete Account"}
                </button>

            </section>

        </div>
    );
}

export default Dashboard;