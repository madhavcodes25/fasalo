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
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-emerald-700">
          Fasalo 🌾
        </Link>

        {loading ? null : user ? (
          <nav className="flex items-center gap-1">
            {user.role === "farmer" || user.role === "fpo" ? (
              <>
                <Link href="/farmer" className={linkClass("/farmer")}>
                  {t.listings}
                </Link>
                <Link href="/orders" className={linkClass("/orders")}>
                  {t.orders}
                </Link>
                <Link href="/logistics" className={linkClass("/logistics")}>
                  {t.logistics}
                </Link>
                <Link href="/advisories" className={linkClass("/advisories")}>
                  {t.advisories}
                </Link>
              </>
            ) : (
              <>
                <Link href="/browse" className={linkClass("/browse")}>
                  {t.browse}
                </Link>
                <Link href="/orders" className={linkClass("/orders")}>
                  {t.orders}
                </Link>
                <Link href="/logistics" className={linkClass("/logistics")}>
                  {t.logistics}
                </Link>
                <Link href="/advisories" className={linkClass("/advisories")}>
                  {t.advisories}
                </Link>
              </>
            )}
            <span className="mx-2 text-sm text-zinc-400">
              {t.greeting}, {user.name.split(" ")[0]}
            </span>
            <Link href="/dashboard" className={linkClass("/dashboard")}>{t.dashboard}</Link>
            <button onClick={toggleLanguage} className="px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-md" aria-label="Toggle English and Hindi">{t.language}</button>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md"
            >
              Logout
            </button>
          </nav>
        ) : (
          <nav className="flex gap-2">
            <Link href="/login" className={linkClass("/login")}>
              Login
            </Link>
            <Link href="/signup" className={linkClass("/signup")}>
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
