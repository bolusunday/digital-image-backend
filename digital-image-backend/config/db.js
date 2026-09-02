const { Pool } = require("pg");
require("dotenv").config();

// Verify DATABASE_URL exists and mask password for debugging
if (!process.env.DATABASE_URL) {
  console.error(
    "❌ CRITICAL ERROR: DATABASE_URL environment variable is missing in Hostinger!",
  );
} else {
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@");
  console.log("ℹ️ Target Database URL:", maskedUrl);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon SSL handshakes
  },
  connectionTimeoutMillis: 15000, // Increased to 15s to allow Neon cold-starts to wake up
  idleTimeoutMillis: 30000,
});

// Test connection on startup with detailed error reporting
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error details:", {
      message: err.message,
      code: err.code, // e.g., '28P01' (bad auth), 'ENOTFOUND' (bad host), 'ETIMEDOUT'
      detail: err.detail || "No additional detail provided",
    });
  } else {
    console.log("✅ Database connected successfully at:", res.rows[0].now);
  }
});

module.exports = pool;
