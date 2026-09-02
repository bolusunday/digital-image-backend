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
      {/* Thumbnail Container (Removed p-3 padding so image covers full container) */}
      <Link
        to={`/product/${product.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100/80 block shrink-0"
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
          /* Changed object-contain to object-cover and object-center */
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Favorite Button Overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-2.5 right-2.5 p-2.5 sm:p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md text-slate-600 hover:text-rose-500 active:scale-90 transition-all duration-200 cursor-pointer z-10"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={16}
            className={
              isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-600"
            }
          />
        </button>

        {/* Category Tag Overlay */}
        <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-white shadow-xs z-10 capitalize">
          {product.category || "Digital Asset"}
        </span>
      </Link>

      {/* Details Section */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Title */}
          <Link to={`/product/${product.id}`} className="no-underline block">
            <h3 className="text-[13px] sm:text-sm font-semibold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Dynamic Ratings & Sales */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-3 text-[11px] sm:text-xs text-slate-500">
            <div className="flex items-center gap-1 text-amber-500">
              <Star
                size={13}
                className="fill-amber-400 text-amber-400 shrink-0"
              />
              <span className="font-bold text-slate-900">
                {ratingAverage.toFixed(1)}
              </span>
            </div>
            <span>({ratingCount.toLocaleString()})</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-medium text-slate-600 w-full sm:w-auto mt-0.5 sm:mt-0">
              {salesCount.toLocaleString()} sold
            </span>
          </div>
        </div>

        {/* Pricing & Action */}
        <div className="pt-2 border-t border-slate-100/80 flex flex-col gap-2.5">
          {/* Price Badges */}
          <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              {formattedPrice}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 line-through">
              {formattedOriginalPrice}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto sm:ml-0">
              50% OFF
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-indigo-600 text-white group-hover:shadow-md"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={15} />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
