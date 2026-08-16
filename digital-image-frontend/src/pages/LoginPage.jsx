// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/admin");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl border border-slate-200 max-w-sm w-full space-y-4 shadow-sm"
      >
        <h2 className="text-xl font-extrabold text-slate-900">Admin Login</h2>
        {error && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-indigo-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
