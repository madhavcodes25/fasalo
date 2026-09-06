"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const { t, toggleLanguage } = useLanguage();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      pathname === href
        ? "bg-emerald-100 text-emerald-800"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md shadow-sm transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-emerald-800 transition-transform hover:scale-105">
          <span className="text-2xl">🌾</span> Fasalo
        </Link>

        {loading ? null : user ? (
          <nav className="flex items-center gap-2 overflow-x-auto">
            <div className="flex bg-zinc-100/50 p-1 rounded-lg">
              {user.role === "farmer" || user.role === "fpo" ? (
                <>
                  <Link href="/farmer" className={linkClass("/farmer")}>{t.listings}</Link>
                  <Link href="/orders" className={linkClass("/orders")}>{t.orders}</Link>
                  <Link href="/logistics" className={linkClass("/logistics")}>{t.logistics}</Link>
                  <Link href="/advisories" className={linkClass("/advisories")}>{t.advisories}</Link>
                </>
              ) : (
                <>
                  <Link href="/browse" className={linkClass("/browse")}>{t.browse}</Link>
                  <Link href="/orders" className={linkClass("/orders")}>{t.orders}</Link>
                  <Link href="/logistics" className={linkClass("/logistics")}>{t.logistics}</Link>
                  <Link href="/advisories" className={linkClass("/advisories")}>{t.advisories}</Link>
                </>
              )}
            </div>
            
            <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block"></div>
            
            <Link href="/dashboard" className="hidden sm:flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 rounded-md transition-colors">{t.dashboard}</Link>
            
            <button onClick={toggleLanguage} className="hidden sm:block px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 border border-emerald-200 bg-white hover:bg-emerald-50 rounded-md transition-colors" aria-label="Toggle Language">{t.language}</button>
            
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer ml-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                <div className="p-3 border-b border-zinc-100">
                  <p className="text-sm font-medium text-zinc-900">{t.greeting}, {user.name.split(" ")[0]}</p>
                  <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
                </div>
                <div className="p-1">
                  <Link href="/dashboard" className="sm:hidden block w-full text-left px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-md">{t.dashboard}</Link>
                  <button onClick={toggleLanguage} className="sm:hidden block w-full text-left px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-md">{t.language === "hi" ? "Switch to English" : "हिंदी में बदलें"}</button>
                  <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium">Logout</button>
                </div>
              </div>
            </div>
          </nav>
        ) : (
          <nav className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-lg transition-all hover:-translate-y-0.5">
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
