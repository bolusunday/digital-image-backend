// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { ShoppingBag, Search, X, Menu, ChevronRight } from "lucide-react";

export default function Navbar({ cartCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { name: "Sport Assets", slug: "sport" },
    { name: "Cartoon & Characters", slug: "cartoon" },
    { name: "Africana Art", slug: "africana" },
    { name: "Medieval Packs", slug: "medieval" },
    { name: "Home Decor", slug: "homedecor" },
    { name: "E-Books", slug: "ebook" },
  ];

  useEffect(() => {
    const currentQuery = searchParams.get("search") || "";
    setSearchTerm(currentQuery);
  }, [searchParams]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const trimmed = value.trim();

    if (location.pathname === "/") {
      if (trimmed) {
        navigate(`/?search=${encodeURIComponent(trimmed)}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/");
    }
    setIsMobileSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (location.pathname === "/") {
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      {/* Top Header Row */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-700 hover:text-indigo-600 p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            to="/"
            className="text-xl sm:text-2xl font-black tracking-tight shrink-0 flex items-center gap-2 no-underline group"
          >
            <span className="font-extrabold uppercase tracking-wider text-indigo-600 text-base sm:text-xl">
              Pegty
            </span>
          </Link>
        </div>

        {/* Central Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl relative items-center"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search digital assets, e-books, models..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 py-2.5 pl-4 pr-12 rounded-full border border-slate-200/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-200"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-11 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="submit"
            className="absolute right-1.5 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors cursor-pointer shadow-xs"
            aria-label="Search"
          >
            <Search size={15} />
          </button>
        </form>

        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Toggle search input"
          >
            <Search size={20} />
          </button>

          <Link
            to="/cart"
            className="relative p-2 sm:p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer flex items-center gap-2 no-underline"
            aria-label="View Cart"
          >
            <ShoppingBag size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-slate-800">
              Cart
            </span>

            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] sm:text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-white">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search assets..."
              autoFocus
              className="w-full bg-slate-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 py-2.5 pl-4 pr-12 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-11 text-slate-400 p-1"
              >
                <X size={15} />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-1.5 bg-indigo-600 text-white p-2 rounded-lg"
              aria-label="Submit search"
            >
              <Search size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Capsule Pill Category Nav - HIDDEN ON MOBILE (md:block added) */}
      <div className="hidden md:block border-t border-slate-100 bg-slate-50/50">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <nav className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Link
              to="/"
              className={`shrink-0 px-4 py-1.5 rounded-full transition-all duration-200 no-underline ${
                location.pathname === "/" && !searchParams.get("search")
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              All Products
            </Link>

            {categories.map((cat) => {
              const catPath = `/category/${cat.slug}`;
              const isActive = location.pathname === catPath;

              return (
                <Link
                  key={cat.slug}
                  to={catPath}
                  className={`shrink-0 px-4 py-1.5 rounded-full transition-all duration-200 no-underline ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Browse Categories
            </p>
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 transition-colors no-underline"
            >
              <span>All Products</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 transition-colors no-underline"
              >
                <span>{cat.name}</span>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Quick Links
            </p>
            <Link
              to="/cart"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 transition-colors no-underline"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-indigo-600" />
                <span>Shopping Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/admin"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 transition-colors no-underline"
            >
              <span>Admin Dashboard</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
