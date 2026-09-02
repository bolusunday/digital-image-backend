// src/components/ProductCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Check } from "lucide-react";

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
  const [isFavorite, setIsFavorite] = useState(false);
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

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between h-full">
      {/* 75% Height Image Container for Desktop */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-full h-52 sm:h-60 lg:h-72 shrink-0 bg-slate-100/80 flex items-center justify-center p-3.5 block overflow-hidden"
      >
        <img
          src={
            product.public_thumb_url ||
            product.imageUrl ||
            product.image ||
            "https://via.placeholder.com/400x300"
          }
          alt={product.title}
          loading="lazy"
          /* 100% full image file fits inside container without cropping */
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Favorite Button Overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-2.5 right-2.5 p-2 sm:p-2.5 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md text-slate-600 hover:text-rose-500 active:scale-90 transition-all duration-200 cursor-pointer z-10"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={16}
            className={
              isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-600"
            }
          />
        </button>

        {/* Category Badge Overlay */}
        <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded-md text-white shadow-xs z-10 capitalize">
          {product.category || "Digital Asset"}
        </span>
      </Link>

      {/* Compact 25% Bottom Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between gap-2">
        <div>
          {/* Title */}
          <Link to={`/product/${product.id}`} className="no-underline block">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Ratings & Sales (Etsy Style) */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star
                size={12}
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

        {/* Pricing & Add Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {formattedPrice}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
              {formattedOriginalPrice}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`py-1.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-indigo-600 text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
