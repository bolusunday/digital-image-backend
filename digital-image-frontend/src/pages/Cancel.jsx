import React from "react";
import { Link } from "react-router-dom";
import {
  XCircle,
  ShoppingBag,
  ArrowLeft,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

export default function Cancel() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glassmorphism Card Container */}
      <div className="max-w-xl w-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center">
        {/* Header Icon with Glowing Ring & Badge */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 shadow-inner ring-8 ring-rose-500/5">
              <XCircle size={44} />
            </div>
            <div className="absolute -top-1 -right-1 bg-rose-500 text-zinc-950 p-1 rounded-full shadow-lg">
              <ShieldAlert size={12} />
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight mb-2">
            Checkout Canceled
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Your transaction was canceled and you have not been charged.
          </p>
        </div>

        {/* Cart Preservation Info Box */}
        <div className="bg-gradient-to-b from-zinc-800/60 to-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-8 text-left relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0 mt-0.5">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Your Cart is Intact
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                All selected items remain saved in your shopping cart. You can
                review your cart or resume checkout whenever you are ready.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-zinc-800/80">
          <Link
            to="/cart"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw size={16} />
            <span>Return to Cart & Retry</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 px-5 py-2.5 rounded-xl transition-all group cursor-pointer"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Continue Browsing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
