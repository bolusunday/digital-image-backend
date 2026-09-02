import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  CheckCircle2,
  Download,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  FileText,
} from "lucide-react";

import { API_URL } from "../config";

export default function SuccessPage({ onClearCart }) {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // Safely attempt Context extraction if CartContext exists
  let clearCart;
  try {
    const context = useCart();
    clearCart = context?.clearCart;
  } catch (err) {
    clearCart = null;
  }

  const [files, setFiles] = useState([]);
  const [orderInfo, setOrderInfo] = useState({ orderId: null, email: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Guard against React 18 double-execution using sessionId tracking
  const fetchedSessionId = useRef(null);

  // Trigger secure file download
  const handleDownload = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Order ID to clipboard safely
  const handleCopyOrderId = async () => {
    if (!orderInfo.orderId) return;
    try {
      await navigator.clipboard.writeText(orderInfo.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard write failed:", err);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found.");
      setLoading(false);
      return;
    }

    if (fetchedSessionId.current === sessionId) return;
    fetchedSessionId.current = sessionId;

    // 1. Clear state via App.jsx prop handler if provided
    if (typeof onClearCart === "function") {
      onClearCart();
    }

    // 2. Clear cart state in Context API if present
    if (typeof clearCart === "function") {
      clearCart();
    }

    // 3. Forcefully remove cart keys from browser storage
    ["pegty_cart", "cart", "shopping_cart", "cartItems"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // 4. Dispatch global events so App.jsx or Header cart badges sync instantly
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cartUpdated"));

    // Fetch verified download links and Order Metadata from Express backend
    fetch(`${API_URL}/api/payments/verify-payment?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to verify purchase.");
        return res.json();
      })
      .then((data) => {
        setOrderInfo({
          orderId: data.orderId || data.id || sessionId,
          email: data.customerEmail || data.email || "",
        });

        if (data.files && data.files.length > 0) {
          setFiles(data.files);
        } else if (data.downloadUrl) {
          setFiles([
            {
              id: 1,
              title: "Your Digital Asset",
              downloadUrl: data.downloadUrl,
            },
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Verification error:", err);
        setError(
          "Could not retrieve download links. Please check your purchase history.",
        );
        setLoading(false);
      });
  }, [sessionId, clearCart, onClearCart]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glassmorphism Card Container */}
      <div className="max-w-xl w-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner ring-8 ring-emerald-500/5">
              <CheckCircle2 size={44} />
            </div>
            <div className="absolute -top-1 -right-1 bg-emerald-500 text-zinc-950 p-1 rounded-full shadow-lg">
              <Sparkles size={12} />
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight mb-2">
            Payment Successful!
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Thank you for your purchase. Your digital items are verified and
            ready to download.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 border border-zinc-800/80 bg-zinc-950/40 rounded-2xl mb-6">
            <Loader2 className="animate-spin text-indigo-400" size={28} />
            <span className="text-zinc-400 text-sm font-medium">
              Generating secure download links...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl mb-6 text-left">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Order Details & Receipt Badge */}
        {!loading && !error && orderInfo.orderId && (
          <div className="bg-gradient-to-b from-zinc-800/60 to-zinc-900/60 border border-orange-500/20 rounded-2xl p-5 mb-6 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-wider">
                <ShieldCheck size={15} />
                <span>Verified Receipt Details</span>
              </div>
              <button
                onClick={handleCopyOrderId}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">
                      Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-mono font-bold text-white bg-zinc-950/60 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
                  {orderInfo.orderId}
                </span>
              </div>

              {orderInfo.email && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-zinc-400">Checkout Email:</span>
                  <span className="font-medium text-zinc-200">
                    {orderInfo.email}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-400 mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5">
              <span>💡</span>
              <span>
                Keep this Order ID to submit verified customer reviews later!
              </span>
            </p>
          </div>
        )}

        {/* Downloadable Assets List */}
        {!loading && !error && files.length > 0 && (
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} /> Your Downloads ({files.length})
              </span>
              <span className="text-[11px] text-zinc-500">
                Links expire in 1 hr
              </span>
            </div>

            {files.map((file, index) => (
              <div
                key={file.id ?? index}
                className="flex items-center justify-between gap-4 p-4 bg-zinc-950/50 hover:bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all group"
              >
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {file.title || `Digital Item #${index + 1}`}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Ready for direct download
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(file.downloadUrl)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Navigation / Return to Shop Button */}
        <div className="pt-6 border-t border-zinc-800/80 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 px-5 py-2.5 rounded-xl transition-all group cursor-pointer"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
