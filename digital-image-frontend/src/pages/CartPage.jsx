// src/pages/CartPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import CheckoutButton from "../components/CheckoutButton";

export default function CartPage({
  cart = [],
  onRemoveFromCart,
  mockUserToken,
}) {
  // ✅ FIX 1: Always returns a raw Number in dollars (e.g. 100 cents -> 1.00 dollar)
  const getItemPrice = (priceInCents) => {
    return Number(priceInCents || 0) / 100;
  };

  // ✅ FIX 2: Correctly calculates total dollars using the helper function and quantity
  const totalCartPriceDollars = cart.reduce(
    (sum, item) => sum + getItemPrice(item.price) * (item.quantity || 1),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page Title & Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-200/80">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors no-underline mb-2"
          >
            <ArrowLeft size={14} />
            Back to Marketplace
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Shopping Cart
          </h1>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full w-fit tracking-wider uppercase">
          {cart.length} {cart.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Empty Cart State */}
      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Explore our marketplace to find unique digital assets and project
            templates.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 no-underline"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        /* Grid Layout: Responsive 1-Column on Phone/Tablet -> 12-Column Split on Desktop */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Cart Items List (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            {cart.map((item, index) => {
              const itemPriceDollars = getItemPrice(item.price);
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center shadow-xs hover:border-slate-300 transition-all"
                >
                  {/* Item Image Thumbnail */}
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <img
                      src={
                        item.public_thumb_url ||
                        item.imageUrl ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-xl border border-slate-100 bg-slate-50"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="no-underline hover:text-indigo-600 transition-colors"
                    >
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 truncate">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium flex items-center gap-1">
                      <ShieldCheck
                        size={12}
                        className="text-indigo-600 shrink-0"
                      />
                      Instant Digital Download
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-1.5 sm:mt-2">
                      ${itemPriceDollars.toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  {onRemoveFromCart && (
                    <button
                      onClick={() => onRemoveFromCart(index)}
                      className="text-slate-400 hover:text-rose-600 p-2 sm:p-2.5 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary (4 cols on desktop) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 h-fit sticky top-24 shadow-xs">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Items ({cart.length})</span>
                  <span className="font-bold text-slate-900">
                    ${totalCartPriceDollars.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md text-[10px] sm:text-xs uppercase tracking-wider">
                    Free (Instant)
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-sm sm:text-base font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-600">
                    ${totalCartPriceDollars.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stripe Checkout Button Component */}
              <CheckoutButton token={mockUserToken} cart={cart} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
