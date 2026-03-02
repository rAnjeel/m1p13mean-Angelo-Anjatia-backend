const express = require("express");
const { register, login, getMe, logout } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authenticateToken");

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me
router.get("/me", authenticateToken, getMe);

// POST /api/auth/logout
router.post("/logout", authenticateToken, logout);

module.exports = router;
