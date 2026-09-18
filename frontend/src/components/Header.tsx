"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const { t, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive(href)
        ? "bg-emerald-700 text-white shadow-sm"
        : "text-emerald-100 hover:bg-emerald-700/60 hover:text-white"
    }`;

  const farmerLinks = (
    <>
      <Link href="/farmer" onClick={() => setMenuOpen(false)} className={linkClass("/farmer")}>{t.listings}</Link>
      <Link href="/orders" onClick={() => setMenuOpen(false)} className={linkClass("/orders")}>{t.orders}</Link>
      <Link href="/logistics" onClick={() => setMenuOpen(false)} className={linkClass("/logistics")}>{t.logistics}</Link>
      <Link href="/advisories" onClick={() => setMenuOpen(false)} className={linkClass("/advisories")}>{t.advisories}</Link>
    </>
  );

  const buyerLinks = (
    <>
      <Link href="/browse" onClick={() => setMenuOpen(false)} className={linkClass("/browse")}>{t.browse}</Link>
      <Link href="/orders" onClick={() => setMenuOpen(false)} className={linkClass("/orders")}>{t.orders}</Link>
      <Link href="/logistics" onClick={() => setMenuOpen(false)} className={linkClass("/logistics")}>{t.logistics}</Link>
      <Link href="/advisories" onClick={() => setMenuOpen(false)} className={linkClass("/advisories")}>{t.advisories}</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-emerald-800 shadow-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
          <span className="text-xl">🌾</span>
          <span>Fasalo</span>
          <span className="hidden sm:inline text-emerald-300 font-normal text-xs ml-1">फसल सीधे आपके पास</span>
        </Link>

        {!loading && (
          <>
            {/* Desktop Nav */}
            {user ? (
              <nav className="hidden md:flex items-center gap-1">
                {user.role === "farmer" || user.role === "fpo" ? farmerLinks : buyerLinks}
                <div className="w-px h-5 bg-emerald-600 mx-2" />
                <Link href="/dashboard" className={linkClass("/dashboard")}>{t.dashboard}</Link>
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-emerald-600 text-emerald-200 hover:bg-emerald-700 transition-colors ml-1"
                  aria-label="Toggle language"
                >
                  {t.language}
                </button>
                {/* Profile pill */}
                <div className="relative group ml-2">
                  <button className="flex items-center gap-2 pl-3 pr-4 py-1.5 bg-emerald-700/60 hover:bg-emerald-700 rounded-full transition-colors text-white text-sm font-medium">
                    <span className="w-6 h-6 rounded-full bg-emerald-400 text-emerald-900 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-zinc-100 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 origin-top-right scale-95 group-hover:scale-100">
                    <div className="p-3 border-b border-zinc-100">
                      <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 capitalize">{user.role.replace("_", " ")} • {user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </nav>
            ) : (
              <nav className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-semibold text-emerald-800 bg-white rounded-lg hover:bg-emerald-50 shadow-sm transition-all hover:-translate-y-0.5">
                  Get Started
                </Link>
              </nav>
            )}

            {/* Mobile menu toggle */}
            {user && (
              <button
                className="md:hidden p-2 text-emerald-100 hover:text-white"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Mobile dropdown */}
      {user && menuOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-700 px-4 pb-4 pt-2 flex flex-col gap-1">
          {user.role === "farmer" || user.role === "fpo" ? farmerLinks : buyerLinks}
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={linkClass("/dashboard")}>{t.dashboard}</Link>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={toggleLanguage} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-600 text-emerald-200 hover:bg-emerald-700">{t.language}</button>
            <button onClick={logout} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40">Sign out</button>
          </div>
        </div>
      )}
    </header>
  );
}
