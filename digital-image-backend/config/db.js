const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon & cloud Postgres SSL handshakes
  },
});

// Test connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error:", err.stack);
  } else {
    console.log("✅ Database connected successfully at:", res.rows[0].now);
  }
});

module.exports = pool;
