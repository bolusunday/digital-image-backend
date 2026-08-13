// generateToken.js
require("dotenv").config();
const jwt = require("jsonwebtoken");

// Ensure JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing from .env!");
  process.exit(1);
}

// Generate token for admin user
const adminPayload = {
  id: 1,
  email: "admin@pixelvault.com",
  role: "admin",
};

const token = jwt.sign(adminPayload, process.env.JWT_SECRET, {
  expiresIn: "7d", // Valid for 7 days
});

console.log("\n==========================================");
console.log("🔑 YOUR REAL JWT ADMIN TOKEN:");
console.log("==========================================\n");
console.log(token);
console.log("\n==========================================\n");
