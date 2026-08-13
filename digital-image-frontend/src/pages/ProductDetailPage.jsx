// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Star,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ----------------------------------------------------------------------
// 1. GUEST REVIEW FORM COMPONENT
// ----------------------------------------------------------------------
function WriteGuestReviewSection({ productId, onReviewAdded }) {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(
        `${API_URL}/api/products/${productId}/guest-reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: String(orderId).trim(),
            email: String(email).toLowerCase().trim(),
            customer_email: String(email).toLowerCase().trim(),
            displayName,
            rating: Number(rating),
            comment,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Verified purchase! Your review has been added.");

        const stats =
          data.stats ||
          (data.product
            ? {
                rating_average: data.product.rating_average,
                rating_count: data.product.rating_count,
              }
            : null);

        const review = data.review || {
          id: Date.now(),
          user_name: displayName || "Verified Buyer",
          rating: Number(rating),
          comment,
          created_at: new Date().toISOString(),
        };

        if (onReviewAdded) onReviewAdded(review, stats);
      } else {
        setMessage(data.error || "Failed to verify review.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/80 p-5 sm:p-6 rounded-2xl text-center">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={22} />
        </div>
        <h3 className="text-sm font-bold text-emerald-900 mb-1">
          Review Published!
        </h3>
        <p className="text-xs text-emerald-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          Write a Review
        </h3>
        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck size={12} />
          Verified Order
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Order ID #
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 1042"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-white px-3 py-2.5 sm:py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Checkout Email
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white px-3 py-2.5 sm:py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Display Name (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Alex M."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-white px-3 py-2.5 sm:py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
              >
                <Star
                  size={22}
                  className={
                    star <= rating ? "fill-amber-400" : "text-slate-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Review Comment
          </label>
          <textarea
            rows="3"
            required
            placeholder="Share details of your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Verifying Order..." : "Verify Purchase & Post Review"}
        </button>

        {message && (
          <p className="text-xs font-semibold text-rose-600 text-center mt-2">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. READ-ONLY STAR DISPLAY
// ----------------------------------------------------------------------
function StarRating({ rating }) {
  const safeRating = Number(rating || 5);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          className={
            star <= safeRating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }
        />
      ))}
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "Just now" : date.toLocaleDateString();
}

// ----------------------------------------------------------------------
// 3. MAIN PRODUCT PAGE
// ----------------------------------------------------------------------
export default function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const reviewsRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    const fetchProduct = fetch(`${API_URL}/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const fetchReviews = fetch(`${API_URL}/api/products/${id}/reviews`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);

    Promise.all([fetchProduct, fetchReviews]).then(
      ([productData, reviewsData]) => {
        setProduct(productData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        setLoading(false);
      },
    );
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium text-xs sm:text-sm">
        Loading digital asset details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Product not found
        </h2>
        <p className="text-xs text-slate-500">
          The requested asset could not be found or has been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-xs font-bold uppercase tracking-wider no-underline"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>
      </div>
    );
  }

  const ratingAverage = Number(product.rating_average || 0);
  const ratingCount = Number(product.rating_count || 0);
  const priceInDollars = Number(product.price || 0);

  const validReviews = (Array.isArray(reviews) ? reviews : []).filter(
    (rev) => rev && (rev.id || rev.comment || rev.user_name),
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors no-underline"
          >
            <ArrowLeft size={14} />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 bg-white p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="md:col-span-1 lg:col-span-7">
            <div className="aspect-square sm:aspect-[4/3] bg-slate-100/80 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner flex items-center justify-center p-3 sm:p-4">
              <img
                src={
                  product.public_thumb_url ||
                  product.imageUrl ||
                  "https://via.placeholder.com/600x450"
                }
                alt={product.title}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-extrabold uppercase tracking-wider text-indigo-600 text-[10px] sm:text-[11px]">
                  PixelVault Studio
                </span>
                <button
                  onClick={() =>
                    reviewsRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-indigo-600 font-bold text-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{ratingAverage.toFixed(1)}</span>
                  <span className="text-slate-400">({ratingCount})</span>
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-4">
                {product.title}
              </h1>

              <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 sm:mb-6">
                ${priceInDollars.toFixed(2)}
              </div>

              <button
                onClick={() => onAddToCart && onAddToCart(product)}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 mb-6 cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <div className="border-t border-slate-100 pt-4 sm:pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Description
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                  {product.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={reviewsRef}
          className="bg-white p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs"
        >
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4 sm:mb-6">
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
            <div className="lg:col-span-5 h-fit">
              <WriteGuestReviewSection
                productId={id}
                onReviewAdded={(newReview, newStats) => {
                  if (newReview) {
                    setReviews((prev) => [newReview, ...prev]);
                  }

                  if (newStats) {
                    setProduct((prev) => ({
                      ...prev,
                      rating_average: newStats.rating_average,
                      rating_count: newStats.rating_count,
                    }));
                  }
                }}
              />
            </div>

            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              {validReviews.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-500">
                    No reviews yet. Be the first to leave one!
                  </p>
                </div>
              ) : (
                validReviews.map((rev, index) => (
                  <div
                    key={rev.id ?? index}
                    className="p-4 sm:p-5 border border-slate-200/70 rounded-2xl bg-slate-50/40 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {rev.user_name || rev.displayName || "Verified Buyer"}
                        </span>
                        <StarRating rating={rev.rating} />
                        <span className="text-[9px] sm:text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Verified
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                        {formatDate(rev.created_at)}
                      </span>
                    </div>

                    {rev.comment && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg z-50 flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
            Total Price
          </span>
          <span className="text-lg font-black text-slate-900">
            ${priceInDollars.toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => onAddToCart && onAddToCart(product)}
          className="flex-1 py-3 px-4 bg-slate-900 active:bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
