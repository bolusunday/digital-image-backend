const { Pool } = require("pg");
require("dotenv").config();

// Verify DATABASE_URL exists before initializing
if (!process.env.DATABASE_URL) {
  console.error(
    "❌ CRITICAL ERROR: DATABASE_URL environment variable is missing!",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon & cloud Postgres SSL handshakes
  },
  connectionTimeoutMillis: 5000, // Cancel connection attempt after 5 seconds instead of hanging
  idleTimeoutMillis: 30000,
});

// Test connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Database connected successfully at:", res.rows[0].now);
  }
});

module.exports = pool;
