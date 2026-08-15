// src/config.js
export const API_URL =
  import.meta.env.MODE === "production"
    ? "https://api.pegty.com"
    : import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
