// src/components/ProductCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Check, Heart, Download } from "lucide-react";

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
  const [isFavorited, setIsFavorited] = useState(false);
  const { ratingAverage, ratingCount } = getProductStats(product);

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited((prev) => !prev);
  };

  const imageUrl =
    product.public_thumb_url ||
    product.imageUrl ||
    product.image ||
    "https://via.placeholder.com/400x500";

  // Dynamic Shop Name logic based on category
  const rawCategory = String(product.category || "")
    .toLowerCase()
    .trim();
  const isEBook =
    rawCategory === "ebook" ||
    rawCategory === "e-book" ||
    rawCategory === "e book" ||
    rawCategory === "e-books";

  const shopName =
    product.shop_name ||
    product.shopName ||
    product.vendor ||
    (isEBook ? "Pegty Library" : "Pegty Studio");

  return (
    <div className="group relative w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden p-3">
      {/* 1. MEDIA CONTAINER */}
      <div className="relative w-full aspect-[4/5] bg-slate-100/80 rounded-xl overflow-hidden shrink-0">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Favorite Heart Toggle */}
        <button
          onClick={toggleFavorite}
          type="button"
          aria-label={
            isFavorited ? "Remove from Favorites" : "Add to Favorites"
          }
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-sm hover:scale-110 hover:bg-white hover:text-rose-500 transition-all duration-200 cursor-pointer"
        >
          <Heart
            size={15}
            className={
              isFavorited
                ? "fill-rose-500 text-rose-500"
                : "text-slate-600 stroke-[2.2]"
            }
          />
        </button>
      </div>

      {/* 2. DETAILS SECTION */}
      <div className="mt-3 flex flex-col justify-between flex-1 gap-2">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700 tracking-wide uppercase mb-1.5">
            <Download size={11} className="shrink-0 stroke-[2.5]" />
            <span>Digital Download</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`} className="no-underline block">
            <h3
              title={product.title}
              className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors"
            >
              {product.title}
            </h3>
          </Link>

          {/* Ratings & Shop Metadata */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Star
                size={12}
                className="fill-amber-400 text-amber-400 shrink-0"
              />
              <span className="font-bold text-slate-900 text-xs">
                {ratingAverage.toFixed(1)}
              </span>
              <span className="text-slate-400">
                ({ratingCount.toLocaleString()})
              </span>
            </div>

            <span className="text-slate-300">•</span>

            <span className="truncate">
              By{" "}
              <span className="font-semibold text-slate-700">{shopName}</span>
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-2 pt-2.5 border-t border-slate-100 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-slate-900 truncate">
              {formattedPrice}
            </span>
            <span className="text-xs text-slate-400 line-through truncate">
              {formattedOriginalPrice}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
              50% OFF
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs ${
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
