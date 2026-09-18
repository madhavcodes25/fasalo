"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

// Wheat SVG icon for the logo
function WheatIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main stalk */}
      <line x1="24" y1="44" x2="24" y2="8" stroke="#e8d0a3" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Wheat grains left */}
      <ellipse cx="18" cy="36" rx="6" ry="3.5" transform="rotate(-35 18 36)" fill="#b8e3af" stroke="#4a9c3d" strokeWidth="1"/>
      <ellipse cx="16" cy="28" rx="6" ry="3.5" transform="rotate(-35 16 28)" fill="#b8e3af" stroke="#4a9c3d" strokeWidth="1"/>
      <ellipse cx="16" cy="20" rx="6" ry="3.5" transform="rotate(-40 16 20)" fill="#b8e3af" stroke="#4a9c3d" strokeWidth="1"/>
      {/* Wheat grains right */}
      <ellipse cx="30" cy="36" rx="6" ry="3.5" transform="rotate(35 30 36)" fill="#b8e3af" stroke="#4a9c3d" strokeWidth="1"/>
      <ellipse cx="32" cy="28" rx="6" ry="3.5" transform="rotate(35 32 28)" fill="#b8e3af" stroke="#4a9c3d" strokeWidth="1"/>
      <ellipse cx="32" cy="20" rx="6" ry="3.5" transform="rotate(40 32 20)" fill="#b8e3af" stroke="#4a9c3d" strokeWidth="1"/>
      {/* Top grain */}
      <ellipse cx="24" cy="11" rx="4" ry="6" fill="#b8e3af" stroke="#4a9c3d" strokeWidth="1"/>
      {/* Leaves */}
      <path d="M24 38 Q16 34 14 28" stroke="#4a9c3d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M24 38 Q32 34 34 28" stroke="#4a9c3d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export default function Header() {
  const { user, logout, loading } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    `px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
      isActive(href)
        ? "text-white shadow-sm"
        : "text-[#dff2da] hover:text-white"
    }`;
  const linkStyle = (href: string): React.CSSProperties =>
    isActive(href) ? { background: "rgba(255,255,255,0.15)" } : {};

  const farmerLinks = (
    <>
      <Link href="/farmer" onClick={() => setMenuOpen(false)} className={linkClass("/farmer")} style={linkStyle("/farmer")}>{t.listings}</Link>
      <Link href="/orders" onClick={() => setMenuOpen(false)} className={linkClass("/orders")} style={linkStyle("/orders")}>{t.orders}</Link>
      <Link href="/logistics" onClick={() => setMenuOpen(false)} className={linkClass("/logistics")} style={linkStyle("/logistics")}>{t.logistics}</Link>
      <Link href="/advisories" onClick={() => setMenuOpen(false)} className={linkClass("/advisories")} style={linkStyle("/advisories")}>{t.advisories}</Link>
    </>
  );

  const buyerLinks = (
    <>
      <Link href="/browse" onClick={() => setMenuOpen(false)} className={linkClass("/browse")} style={linkStyle("/browse")}>{t.browse}</Link>
      <Link href="/orders" onClick={() => setMenuOpen(false)} className={linkClass("/orders")} style={linkStyle("/orders")}>{t.orders}</Link>
      <Link href="/logistics" onClick={() => setMenuOpen(false)} className={linkClass("/logistics")} style={linkStyle("/logistics")}>{t.logistics}</Link>
      <Link href="/advisories" onClick={() => setMenuOpen(false)} className={linkClass("/advisories")} style={linkStyle("/advisories")}>{t.advisories}</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* SIH Banner */}
      <div className="text-center py-1 text-xs font-semibold" style={{ background: "#a87c42", color: "#fdf9f3", letterSpacing: "0.04em" }}>
        Smart India Hackathon 2026 &nbsp;&bull;&nbsp; Problem Statement 26033 &nbsp;&bull;&nbsp; Ministry of Consumer Affairs
      </div>

      {/* Main nav */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-8" style={{ background: "linear-gradient(135deg, #122b0f 0%, #1e4218 50%, #2d6324 100%)" }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <WheatIcon size={32} />
          <div>
            <div className="text-white font-extrabold text-lg leading-none tracking-tight" style={{ fontFamily: "serif" }}>Fasalo</div>
            <div className="text-xs leading-none tracking-wide" style={{ color: "#b8e3af" }}>फसल सीधे आपके पास</div>
          </div>
        </Link>

        {!loading && (
          <>
            {/* Desktop Nav */}
            {user ? (
              <nav className="hidden md:flex items-center gap-0.5">
                {user.role === "farmer" || user.role === "fpo" ? farmerLinks : buyerLinks}
                <div className="w-px h-5 mx-2" style={{ background: "#4a9c3d" }} />
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={linkClass("/dashboard")} style={linkStyle("/dashboard")}>{t.dashboard}</Link>

                <button
                  onClick={toggleLanguage}
                  className="ml-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all duration-200 hover:bg-white/10"
                  style={{ borderColor: "#4a9c3d", color: "#dff2da" }}
                  aria-label="Toggle language"
                >
                  {language === "en" ? "हिंदी" : "EN"}
                </button>

                {/* Profile */}
                <div className="relative group ml-2">
                  <button className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full transition-colors text-white text-sm font-semibold hover:bg-white/10">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs" style={{ background: "#a87c42", color: "#fdf9f3" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
                    <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 origin-top-right scale-95 group-hover:scale-100" style={{ borderColor: "#e8d0a3" }}>
                    <div className="p-3" style={{ borderBottom: "1px solid #f5ead6" }}>
                      <p className="text-sm font-bold" style={{ color: "#1e4218" }}>{user.name}</p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: "#8b6330" }}>{user.role.replace("_", " ")} &bull; {user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button onClick={logout} className="w-full text-left px-3 py-2 text-sm font-semibold rounded-xl transition-colors hover:bg-red-50" style={{ color: "#dc2626" }}>
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </nav>
            ) : (
              <nav className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold transition-colors" style={{ color: "#dff2da" }}>Login</Link>
                <Link href="/signup" className="px-5 py-2 text-sm font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5" style={{ background: "#a87c42", color: "#fdf9f3" }}>
                  Get Started
                </Link>
              </nav>
            )}

            {user && (
              <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                }
              </button>
            )}
          </>
        )}
      </div>

      {/* Mobile dropdown */}
      {user && menuOpen && (
        <div className="md:hidden border-t px-4 pb-4 pt-2 flex flex-col gap-1" style={{ background: "#122b0f", borderColor: "#3a7d30" }}>
          {user.role === "farmer" || user.role === "fpo" ? farmerLinks : buyerLinks}
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={linkClass("/dashboard")}>{t.dashboard}</Link>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={toggleLanguage} className="px-3 py-1.5 text-xs font-bold rounded-lg border" style={{ borderColor: "#4a9c3d", color: "#dff2da" }}>
              {language === "en" ? "हिंदी" : "EN"}
            </button>
            <button onClick={logout} className="px-3 py-1.5 text-xs font-bold rounded-lg" style={{ background: "rgba(220,38,38,0.2)", color: "#fca5a5" }}>Sign out</button>
          </div>
        </div>
      )}
    </header>
  );
}
