// src/components/CheckoutButton.jsx
import React, { useState } from "react";
import { CreditCard, Loader2, Lock, AlertCircle } from "lucide-react";
import { API_URL } from "../config";

export default function CheckoutButton({ cart = [] }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!cart || cart.length === 0) return;

    setIsProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };

      if (token) {
        headers["Authorization"] = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
      }

      // Dynamic API base URL based on environment

      const response = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ productIds: cart.map((item) => item.id) }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid response from payment server.");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Error Message Display */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200/80 p-3 rounded-xl text-rose-700 text-[11px] sm:text-xs font-medium leading-relaxed">
          <AlertCircle size={15} className="shrink-0 text-rose-500 mt-0.5" />
          <span className="flex-1 break-words">{error}</span>
        </div>
      )}

      {/* Responsive CTA Button */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isProcessing || cart.length === 0}
        className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl tracking-wide shadow-md hover:shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Redirecting to Stripe...</span>
          </>
        ) : (
          <>
            <CreditCard size={18} />
            <span>Proceed to Checkout</span>
          </>
        )}
      </button>

      {/* Trust Micro-Copy */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">
        <Lock size={12} className="text-slate-400 shrink-0" />
        <span>256-bit Encrypted & Secure Checkout</span>
      </div>
    </div>
  );
}
