import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ redirectPath = "/login" }) {
  // Check if token exists in localStorage
  const token = localStorage.getItem("token");

  // Optional: Check if token is expired (basic check)
  const isTokenValid = () => {
    if (!token) return false;

    try {
      // Decode JWT payload (middle section of token)
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Verify expiration time (exp is in seconds, Date.now() in ms)
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token"); // Clear expired token
        return false;
      }
      return true;
    } catch {
      return false; // Invalid token format
    }
  };

  // If token is missing or expired, redirect to login page
  if (!isTokenValid()) {
    return <Navigate to={redirectPath} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
}
