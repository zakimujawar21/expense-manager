import { useState } from "react";
import api from "../services/api";

function AddExpense() {
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/expenses", {
                ...formData,
                amount: Number(formData.amount),
            });

            console.log(response.data);

        } catch (error) {
            console.error(error.response?.data || error.message);
        }
    };

    return (
        <div>
            <h1>Add Expense</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
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

                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleChange}
                />

                <button type="submit">Add Expense</button>
            </form>
        </div>
    );
}

export default AddExpense;