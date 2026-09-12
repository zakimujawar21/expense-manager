const express = require("express");

const {
    registerUser,
    loginUser,
    deleteAccount,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Delete account
router.delete("/delete-account", protect, deleteAccount);


module.exports = router;