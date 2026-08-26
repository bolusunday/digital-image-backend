// src/components/Footer.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Zap,
  Globe,
  Send,
  Mail,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const location = useLocation();

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800/80 pt-10 sm:pt-12 pb-8 mt-auto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pb-8 sm:pb-10 border-b border-zinc-800/60">
          <div className="flex items-center gap-3.5 bg-zinc-900/40 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none border border-zinc-800/60 sm:border-none">
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-indigo-400 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Instant Downloads
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-snug">
                Access your assets right after checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-zinc-900/40 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none border border-zinc-800/60 sm:border-none">
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-emerald-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Secure Payments
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-snug">
                Powered by Stripe with encrypted checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-zinc-900/40 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none border border-zinc-800/60 sm:border-none">
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-amber-400 shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Global License
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-snug">
                Use in personal & commercial projects
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="inline-flex items-center gap-2 text-white font-extrabold text-base sm:text-lg no-underline group cursor-pointer"
            >
              <span>Pegty</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Premium digital assets
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/category/sport"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  Sport Assets
                </Link>
              </li>
              <li>
                <Link
                  to="/category/cartoon"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  Cartoon & Characters
                </Link>
              </li>
              <li>
                <Link
                  to="/category/africana"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  Africana Art
                </Link>
              </li>
              <li>
                <Link
                  to="/category/medieval"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  Medieval Packs
                </Link>
              </li>
              <li>
                <Link
                  to="/category/homedecor"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  Home Decor
                </Link>
              </li>
              <li>
                <Link
                  to="/category/ebook"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  E-Books
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/library"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  My Purchases
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-zinc-400 hover:text-white transition-colors no-underline block py-0.5"
                >
                  Admin
                </Link>
              </li>
              <li>
                <a
                  href="https://stripe.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors no-underline inline-flex items-center gap-1 py-0.5"
                >
                  <span>Stripe</span>
                  <ArrowUpRight size={12} className="text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Stay Connected
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Get notified when new digital asset packs are released.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                title="Social Media"
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Send size={16} />
              </a>
              <a
                href="mailto:contact@pegty.com"
                title="Email Support"
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Pegty Digital Store. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
