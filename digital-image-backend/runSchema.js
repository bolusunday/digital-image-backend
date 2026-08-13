const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

async function setup() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(sql);
    console.log("✅ Tables created successfully!");
  } catch (e) {
    console.error("❌ Schema error:", e.message);
  } finally {
    process.exit();
  }
}
setup();
