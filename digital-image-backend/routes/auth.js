const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

// Helper to enforce JWT_SECRET in production environments
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("⚠️ CRITICAL: JWT_SECRET environment variable is missing!");
    }
    return "fallback_jwt_secret_key_123";
  }
  return secret;
};

// 1. SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter all fields." });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userCheck = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [cleanEmail],
    );
    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);

    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [cleanEmail, passwordHash],
    );

    const secret = getJwtSecret();
    const token = jwt.sign({ id: newUser.rows[0].id }, secret, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// 2. LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter all fields." });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userResult = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [cleanEmail],
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password.trim(), user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const secret = getJwtSecret();
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, email: user.email, created_at: user.created_at },
    });
  } catch (err) {
    console.error("❌ Login server error:", err.message);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;
