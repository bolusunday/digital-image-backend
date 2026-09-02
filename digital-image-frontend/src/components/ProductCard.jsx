// src/components/ProductCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Check } from "lucide-react";

// Helper to reliably retrieve rating stats or generate deterministic fallbacks
const getProductStats = (product) => {
  const rawRating =
    product.rating_average ??
    product.ratingAverage ??
    product.rating?.rate ??
    (typeof product.rating === "number" ? product.rating : null);

  const rawReviews =
    product.rating_count ??
    product.ratingCount ??
    product.rating?.count ??
    product.reviewsCount;

  const rawSales =
    product.sales_count ??
    product.salesCount ??
    product.sales ??
    product.purchases;

  if (rawRating !== null && rawRating !== undefined && rawSales !== undefined) {
    return {
      ratingAverage: Number(rawRating),
      ratingCount: Number(rawReviews || 0),
      salesCount: Number(rawSales),
    };
  }

  const seedKey = String(product.id || product.title || "pixelvault");
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = seedKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  const ratingAverage = 4.1 + (absHash % 10) / 10;
  const ratingCount = 5 + (absHash % 180);
  const salesCount = 14 + (absHash % 836);

  return { ratingAverage, ratingCount, salesCount };
};

export default function ProductCard({ product, onAddToCart }) {
  const [isAdded, setIsAdded] = useState(false);
  const { ratingAverage, ratingCount, salesCount } = getProductStats(product);

  const rawPrice = (Number(product.price || 0) / 100).toFixed(2);
  const priceInDollars = rawPrice > 500 ? rawPrice / 100 : rawPrice;
  const originalPriceInDollars = priceInDollars * 2;

  const formattedPrice = Number(priceInDollars).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const formattedOriginalPrice = Number(originalPriceInDollars).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  );

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const imageUrl =
    product.public_thumb_url ||
    product.imageUrl ||
    product.image ||
    "https://via.placeholder.com/400x300";

  return (
    <div className="group relative w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between h-full">
      {/* 1. IMAGE CONTAINER - USES OBJECT-CONTAIN TO PREVENT ANY CROPPING */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-full aspect-[4/3] bg-slate-100/60 p-2 sm:p-3 block shrink-0 overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Category Badge Overlay */}
        <span className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-slate-900/90 backdrop-blur-md text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-white shadow-md z-10 capitalize tracking-wide">
          {product.category || "Digital Asset"}
        </span>
      </Link>

      {/* 2. DETAILS SECTION */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Title */}
          <Link to={`/product/${product.id}`} className="no-underline block">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Ratings & Sales */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star
                size={13}
                className="fill-amber-400 text-amber-400 shrink-0"
              />
              <span className="font-bold text-slate-900">
                {ratingAverage.toFixed(1)}
              </span>
            </div>
            <span>({ratingCount.toLocaleString()})</span>
            <span>•</span>
            <span className="font-medium text-slate-600 truncate">
              {salesCount.toLocaleString()} sold
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base sm:text-lg font-black text-slate-900 truncate">
              {formattedPrice}
            </span>
            <span className="text-xs text-slate-400 line-through truncate">
              {formattedOriginalPrice}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`py-1.5 sm:py-2 px-3 sm:px-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-indigo-600 text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={14} className="shrink-0" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} className="shrink-0" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
