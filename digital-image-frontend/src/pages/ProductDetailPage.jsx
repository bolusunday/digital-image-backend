// src/pages/ProductDetailPage.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ShoppingBag,
  ArrowLeft,
  Star,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
  Maximize2,
} from "lucide-react";

import { API_URL } from "../config";

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

        setOrderId("");
        setEmail("");
        setDisplayName("");
        setComment("");
        setRating(5);
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
        <p className="text-xs text-emerald-700 mb-4">{message}</p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-xs font-bold text-emerald-800 underline hover:text-emerald-900 cursor-pointer"
        >
          Write another review
        </button>
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
  const { identifier, id } = useParams();
  const productKey = identifier || id;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [touchStartX, setTouchStartX] = useState(null);

  const reviewsRef = useRef(null);
  const thumbnailRefs = useRef([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchProduct = fetch(`${API_URL}/api/products/${productKey}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const fetchReviews = fetch(`${API_URL}/api/products/${productKey}/reviews`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);

    Promise.all([fetchProduct, fetchReviews]).then(
      ([productData, reviewsData]) => {
        if (isMounted) {
          setProduct(productData);
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [productKey]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = [];

    if (product.public_thumb_url) images.push(product.public_thumb_url);
    if (product.imageUrl && !images.includes(product.imageUrl)) {
      images.push(product.imageUrl);
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !images.includes(img)) images.push(img);
      });
    }

    return images.length > 0 ? images : ["https://via.placeholder.com/600x450"];
  }, [product]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [productKey]);

  useEffect(() => {
    if (thumbnailRefs.current[selectedIndex]) {
      thumbnailRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedIndex]);

  const handlePrevImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setSelectedIndex((prev) =>
        prev === 0 ? galleryImages.length - 1 : prev - 1,
      );
    },
    [galleryImages.length],
  );

  const handleNextImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setSelectedIndex((prev) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1,
      );
    },
    [galleryImages.length],
  );

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrevImage, handleNextImage]);

  const ratingAverage = Number(product?.rating_average || 0);
  const ratingCount = Number(product?.rating_count || 0);
  const priceInDollars = Number(product?.price || 0) / 100;

  const rawCategory = String(product?.category || "")
    .toLowerCase()
    .trim();
  const formattedCategory = rawCategory
    ? rawCategory.replace(/-/g, " ")
    : "digital download";

  const isEbook =
    rawCategory === "ebook" ||
    rawCategory === "e-book" ||
    rawCategory === "e book" ||
    rawCategory === "e-books";

  const productTitle = product?.title || "Digital Download";
  const mainSeoAltText = `${productTitle} - ${formattedCategory} Printable Art`;

  // ----------------------------------------------------------------------
  // DYNAMIC SEO META TAGS FOR REACT-HELMET-ASYNC
  // ----------------------------------------------------------------------
  const canonicalUrl = `https://pegty.com/product/${product?.slug || productKey}`;
  const metaTitle = product
    ? `${product.title} | Pegty Studio`
    : "Pegty Studio";
  const metaDescription = product?.description
    ? product.description.replace(/<[^>]*>?/gm, "").slice(0, 155)
    : "Discover unique digital art, prints, and downloads at Pegty Studio.";
  const metaImage =
    product?.public_thumb_url ||
    product?.imageUrl ||
    "https://pegty.com/logo.png";

  const validReviews = useMemo(
    () =>
      (Array.isArray(reviews) ? reviews : []).filter(
        (rev) => rev && (rev.id || rev.comment || rev.user_name),
      ),
    [reviews],
  );

  // ----------------------------------------------------------------------
  // DIGITAL PRODUCT SCHEMA.ORG JSON-LD GENERATOR
  // ----------------------------------------------------------------------
  const jsonLd = useMemo(() => {
    if (!product) return null;

    const siteBaseUrl = process.env.REACT_APP_SITE_URL || "https://pegty.com";
    const schemaCanonical =
      typeof window !== "undefined" && window.location.origin
        ? `${window.location.origin}/product/${product.slug || productKey}`
        : `${siteBaseUrl}/product/${product.slug || productKey}`;

    const nextYear = new Date().getFullYear() + 1;

    const schemaType = isEbook
      ? ["Product", "EBook"]
      : ["Product", "DigitalDocument"];

    const schema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: productTitle,
      image: galleryImages,
      description: product.description || `${productTitle} digital download.`,
      category: formattedCategory || "Digital Goods",
      sku: String(product.sku || product.id || productKey),
      mpn: String(product.id || productKey),
      fileFormat:
        product.fileFormat || (isEbook ? "application/pdf" : "application/zip"),
      brand: {
        "@type": "Brand",
        name: isEbook ? "Pegty Library" : "Pegty Studio",
      },
      offers: {
        "@type": "Offer",
        price: priceInDollars.toFixed(2),
        priceCurrency: "USD",
        priceValidUntil: `${nextYear}-12-31`,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        url: schemaCanonical,
        seller: {
          "@type": "Organization",
          name: "Pegty Studio",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0.00",
            currency: "USD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "US",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        },
      },
    };

    if (ratingCount > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: ratingAverage.toFixed(1),
        reviewCount: ratingCount,
        bestRating: "5",
        worstRating: "1",
      };
    }

    if (validReviews.length > 0) {
      schema.review = validReviews.map((rev) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: rev.user_name || rev.displayName || "Verified Buyer",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: Number(rev.rating || 5).toString(),
          bestRating: "5",
          worstRating: "1",
        },
        ...(rev.comment ? { reviewBody: rev.comment } : {}),
        datePublished: rev.created_at
          ? new Date(rev.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));
    }

    return schema;
  }, [
    product,
    productKey,
    productTitle,
    galleryImages,
    formattedCategory,
    isEbook,
    priceInDollars,
    ratingAverage,
    ratingCount,
    validReviews,
  ]);

  // 1. Loading state: Neutral SEO directive while fetching data
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium text-xs sm:text-sm">
        <Helmet>
          <title>Loading... | Pegty Studio</title>
          <meta name="robots" content="index, follow" />
        </Helmet>
        Loading digital asset details...
      </div>
    );
  }

  // 2. Verified Missing Product State: Only noindex when loading is complete AND product is null
  if (!loading && !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Helmet>
          <title>Product Not Found | Pegty Studio</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
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

  const safeIndex = selectedIndex < galleryImages.length ? selectedIndex : 0;
  const activeImageSrc = galleryImages[safeIndex];

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      handleNextImage();
    } else if (diff < -50) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 pb-24 md:pb-8">
      {/* 3. Dynamic OpenGraph & Meta Tags for Valid Product */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Helmet>

      {/* Dynamic Digital Product JSON-LD Injection */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
          <div className="md:col-span-1 lg:col-span-7 flex flex-col-reverse md:flex-row gap-3">
            {galleryImages.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[520px] scrollbar-none py-1 md:py-0 md:pr-1 flex-shrink-0">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    ref={(el) => (thumbnailRefs.current[idx] = el)}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 p-1 bg-white transition-all cursor-pointer flex-shrink-0 ${
                      safeIndex === idx
                        ? "border-slate-900 ring-2 ring-slate-900/10 shadow-sm opacity-100"
                        : "border-slate-200/80 opacity-60 hover:opacity-100 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${productTitle} - ${formattedCategory} image preview ${idx + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsLightboxOpen(true)}
              className="relative flex-1 aspect-square sm:aspect-[4/3] bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm flex items-center justify-center p-4 group cursor-zoom-in"
            >
              <img
                src={activeImageSrc}
                alt={`${mainSeoAltText} - View ${safeIndex + 1}`}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />

              <button
                type="button"
                aria-label="Save to Favorites"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorited(!isFavorited);
                }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-slate-700 shadow-md flex items-center justify-center border border-slate-200/60 transition-all cursor-pointer hover:scale-110 active:scale-95 z-10"
              >
                <Heart
                  size={18}
                  className={
                    isFavorited
                      ? "fill-rose-500 text-rose-500"
                      : "text-slate-600"
                  }
                />
              </button>

              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/70 text-white p-2 rounded-xl backdrop-blur-xs text-xs font-medium flex items-center gap-1.5 pointer-events-none">
                <Maximize2 size={13} />
                <span>Zoom</span>
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous Image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center border border-slate-200/60 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next Image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center border border-slate-200/60 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {galleryImages.length > 1 && (
                <span className="absolute bottom-3 right-3 text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-200/80 shadow-xs tracking-wider">
                  {safeIndex + 1} / {galleryImages.length}
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-5 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs md:sticky md:top-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-extrabold uppercase tracking-wider text-indigo-600 text-[10px] sm:text-[11px]">
                {isEbook ? "Pegty Library" : "Pegty Studio"}
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
                productId={product.id || productKey}
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

      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50"
          >
            <X size={22} />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img
              src={activeImageSrc}
              alt={`${mainSeoAltText} - Full size view ${safeIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg z-40 flex items-center justify-between gap-3">
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
