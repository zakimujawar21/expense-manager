const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const protect = require("./middleware/authMiddleware");
const expenseRoutes = require("./routes/expenseRoutes");
const cors = require("cors");

dotenv.config({ path: "./backend/.env" });

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/expenses", expenseRoutes);

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Expense Manager API is running");
});

app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route!",
        userId: req.user,
    });
});

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});