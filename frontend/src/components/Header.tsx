"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout, loading } = useAuth();
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
                  My Listings
                </Link>
                <Link href="/orders" className={linkClass("/orders")}>
                  My Orders
                </Link>
              </>
            ) : (
              <>
                <Link href="/browse" className={linkClass("/browse")}>
                  Browse
                </Link>
                <Link href="/orders" className={linkClass("/orders")}>
                  My Orders
                </Link>
              </>
            )}
            <span className="mx-2 text-sm text-zinc-400">
              Hi, {user.name.split(" ")[0]}
            </span>
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
