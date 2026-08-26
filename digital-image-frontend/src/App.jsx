// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import { API_URL } from "./config";

// ✅ Helper component that resets scroll position on navigation
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname, search]);

  return null;
}

function Home({ products, isLoading, onAddToCart }) {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();

  const currentCategory = categorySlug || searchParams.get("category") || "";
  const searchQuery = searchParams.get("search")?.trim().toLowerCase() || "";

  // Map slugs to proper category display names
  const categoryNames = {
    sport: "Sport Assets",
    cartoon: "Cartoon & Characters",
    africana: "Africana Art",
    medieval: "Medieval Packs",
    homedecor: "Home Decor",
    ebook: "E-Books",
  };

  let displayedProducts = currentCategory
    ? products.filter(
        (p) => p.category?.toLowerCase() === currentCategory.toLowerCase(),
      )
    : products;

  if (searchQuery) {
    displayedProducts = displayedProducts.filter((p) => {
      const titleMatch = p.title?.toLowerCase().includes(searchQuery);
      const descMatch = p.description?.toLowerCase().includes(searchQuery);
      const catMatch = p.category?.toLowerCase().includes(searchQuery);
      return titleMatch || descMatch || catMatch;
    });
  }

  const getHeaderTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (currentCategory) {
      const lowerCategory = currentCategory.toLowerCase();
      const categoryName =
        categoryNames[lowerCategory] ||
        currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);

      return `${categoryName} Collection`;
    }
    return "Explore Our Digital Products";
  };

  return (
    <main className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex-1 flex flex-col">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-5 sm:pb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 tracking-tight">
            {getHeaderTitle()}
          </h1>

          {!currentCategory && !searchQuery && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
              Discover our high-quality, unique and ready-to-use images in
              categories of Sport, Cartoon, Africana and Medieval. We also have
              in stock, collection of highly informative E-books
            </p>
          )}
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full w-fit tracking-wider uppercase shrink-0">
          {displayedProducts.length}{" "}
          {displayedProducts.length === 1 ? "Product" : "Products"}
        </span>
      </div>

      {/* Grid State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 w-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse flex flex-col gap-4 min-h-[320px]"
            >
              <div className="aspect-[4/3] bg-slate-200 rounded-xl w-full" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              <div className="mt-auto h-10 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20 text-center bg-white border border-dashed border-slate-300 rounded-2xl sm:rounded-3xl my-4 px-4 w-full">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 stroke-current fill-none"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No products found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Try checking your spelling or selecting a different category from
            the navigation bar above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 w-full">
          {displayedProducts.map((product, idx) => (
            <ProductCard
              key={product.id ?? idx}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on initial render
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("pegty_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Save cart to localStorage whenever cart state changes
  useEffect(() => {
    try {
      localStorage.setItem("pegty_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const handleRemoveFromCart = (indexToRemove) => {
    setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <BrowserRouter>
      {/* Resets viewport scroll to top on page or category changes */}
      <ScrollToTop />

      <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        <Navbar cartCount={cart.length} />

        <div className="flex-1 w-full flex flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  products={products}
                  isLoading={isLoading}
                  onAddToCart={handleAddToCart}
                />
              }
            />
            <Route
              path="/category/:categorySlug"
              element={
                <Home
                  products={products}
                  isLoading={isLoading}
                  onAddToCart={handleAddToCart}
                />
              }
            />
            <Route
              path="/product/:id"
              element={<ProductDetailPage onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  cart={cart}
                  products={products}
                  onRemoveFromCart={handleRemoveFromCart}
                />
              }
            />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
