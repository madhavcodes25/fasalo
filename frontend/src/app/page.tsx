"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
type HealthStatus = "checking" | "ok" | "error";

const FEATURES = [
  {
    icon: "🌿",
    title: "Direct Trading",
    desc: "Farmers list produce directly — no mandi agents, no commission layers. You get more, consumers pay less.",
    img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
    color: "#2d6324",
  },
  {
    icon: "🔒",
    title: "Escrow Payments",
    desc: "Funds held securely until delivery is confirmed. Farmers are always paid, no exceptions.",
    img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
    color: "#3a7d30",
  },
  {
    icon: "🚛",
    title: "Smart Logistics",
    desc: "Cold storage locators and real-time shipment tracking to reduce spoilage and ensure freshness.",
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
    color: "#a87c42",
  },
  {
    icon: "✨",
    title: "AI Pricing",
    desc: "Market-data-backed price suggestions so farmers always list at a fair, competitive price.",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    color: "#8b6330",
  },
];

const STEPS = [
  { num: "01", title: "Farmer lists produce", desc: "Enter crop details, get an AI-powered price suggestion, and publish the listing in under 2 minutes." },
  { num: "02", title: "Buyer places order", desc: "Consumer buys direct. Bulk buyer submits a bid for large volumes through our negotiation flow." },
  { num: "03", title: "Escrow + Delivery", desc: "Payment is locked in escrow. Released to the farmer only after confirmed delivery." },
];

const STATS = [
  { value: "0", label: "Middlemen" },
  { value: "3x", label: "Farmer Earnings" },
  { value: "40%", label: "Cheaper for Buyers" },
  { value: "Live", label: "Weather + eNAM Data" },
];

export default function HomePage() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then((r) => { if (!r.ok) throw new Error(); setStatus("ok"); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #122b0f 0%, #1e4218 40%, #2d6324 80%, #3a7d30 100%)" }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&q=80", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(18,43,15,0.92) 0%, rgba(46,99,36,0.85) 100%)" }} />

        <div className="relative container mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6" style={{ background: "rgba(168,124,66,0.25)", border: "1px solid #a87c42", color: "#e8d0a3" }}>
                Smart India Hackathon 2026 &bull; Problem 26033
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                फसल सीधे
                <span style={{ color: "#b8e3af" }}> आपके पास</span>
              </h1>
              <p className="text-lg font-medium mb-2" style={{ color: "#dff2da" }}>
                From Farm to Table — No Middlemen
              </p>
              <p className="mb-8 leading-relaxed" style={{ color: "#b8e3af" }}>
                Fasalo directly connects <strong className="text-white">farmers and FPOs</strong> with retail consumers and bulk buyers — with AI-powered pricing, escrow protection, and real-time logistics.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/browse" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 text-base" style={{ background: "#fff", color: "#1e4218" }}>
                  Browse Marketplace
                </Link>
                <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-bold rounded-xl border-2 transition-all hover:-translate-y-0.5 text-base" style={{ background: "rgba(168,124,66,0.2)", borderColor: "#a87c42", color: "#e8d0a3" }}>
                  Join as Farmer / Buyer
                </Link>
              </div>

              {/* Status */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(18,43,15,0.5)", color: "#b8e3af" }}>
                <span className={`w-2 h-2 rounded-full ${status === "ok" ? "animate-pulse" : ""}`} style={{ background: status === "ok" ? "#4a9c3d" : status === "error" ? "#ef4444" : "#6b7280" }} />
                {status === "ok" ? "Backend online and ready" : status === "error" ? "Backend offline — start backend server" : "Connecting to backend…"}
              </div>
            </div>

            {/* Hero image collage */}
            <div className="hidden md:grid grid-cols-2 gap-3 animate-fade-up delay-200">
              <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80" alt="Farmer in field" className="rounded-2xl object-cover h-48 w-full shadow-xl" />
              <img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80" alt="Fresh vegetables" className="rounded-2xl object-cover h-48 w-full shadow-xl mt-6" />
              <img src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80" alt="Market produce" className="rounded-2xl object-cover h-48 w-full shadow-xl -mt-6" />
              <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" alt="Logistics truck" className="rounded-2xl object-cover h-48 w-full shadow-xl" />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 64" preserveAspectRatio="none" fill="#faf8f4">
            <path d="M0,64 L1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8" style={{ background: "#fff", borderBottom: "1px solid #e8d0a3" }}>
        <div className="container mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <div key={s.label} className={`animate-fade-up delay-${(i + 1) * 100}`}>
                <div className="text-3xl font-extrabold" style={{ color: "#2d6324" }}>{s.value}</div>
                <div className="text-sm font-semibold mt-1" style={{ color: "#6d4d22" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14 animate-fade-up">
          <h2 className="text-3xl font-extrabold mb-3" style={{ color: "#1e4218" }}>Built for India&apos;s Farmers</h2>
          <p className="max-w-xl mx-auto" style={{ color: "#6d4d22" }}>Every feature addresses a real pain point in the agricultural supply chain.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`rounded-2xl overflow-hidden shadow-sm border hover:-translate-y-1 transition-all duration-300 animate-fade-up delay-${(i + 1) * 100}`} style={{ background: "#fff", borderColor: "#e8d0a3" }}>
              <img src={f.img} alt={f.title} className="w-full h-36 object-cover" />
              <div className="p-5">
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: f.color }}>{f.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: "#4f3618" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" style={{ background: "#fff", borderTop: "1px solid #dff2da", borderBottom: "1px solid #dff2da" }}>
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-14 animate-fade-up">
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: "#1e4218" }}>How Fasalo Works</h2>
            <p style={{ color: "#6d4d22" }}>A complete end-to-end transaction in 3 simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5" style={{ background: "linear-gradient(to right, #dff2da, #b8e3af, #dff2da)" }} />
            {STEPS.map((step, i) => (
              <div key={step.num} className={`flex flex-col items-center text-center animate-fade-up delay-${(i + 1) * 100}`}>
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-5 shadow-lg relative z-10" style={{ background: `linear-gradient(135deg, #1e4218, #3a7d30)` }}>
                  {step.num}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#1e4218" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6d4d22" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm image banner */}
      <section className="relative h-64 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&q=80" alt="Indian farmland" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(18,43,15,0.85), rgba(30,66,24,0.5))" }} />
        <div className="relative container mx-auto max-w-4xl px-6 h-full flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#b8e3af" }}>Our Mission</p>
          <p className="text-2xl font-extrabold text-white max-w-xl leading-snug">
            "Empowering 120 million Indian farmers with fair prices and direct market access."
          </p>
        </div>
      </section>

      {/* CTA / Demo accounts */}
      <section className="container mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl p-10 text-center shadow-xl animate-scale-in" style={{ background: "linear-gradient(135deg, #1e4218 0%, #2d6324 100%)" }}>
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to Demo?</h2>
          <p className="mb-8 text-sm" style={{ color: "#b8e3af" }}>Use the demo accounts below — all use password: <code className="px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.15)", color: "#e8d0a3" }}>secret123</code></p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-8">
            {[
              { role: "Farmer", email: "farmer@fasalo.com", color: "#4a9c3d" },
              { role: "Consumer", email: "consumer@fasalo.com", color: "#a87c42" },
              { role: "Bulk Buyer", email: "bulk@fasalo.com", color: "#8b6330" },
            ].map((a) => (
              <div key={a.email} className="rounded-xl p-4 text-left" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#b8e3af" }}>{a.role}</div>
                <div className="text-white font-semibold text-xs">{a.email}</div>
              </div>
            ))}
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg" style={{ background: "#a87c42", color: "#fdf9f3" }}>
            Login to Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ background: "#fff", borderColor: "#e8d0a3" }}>
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "#8b6330" }}>
          <div className="font-bold" style={{ color: "#2d6324" }}>Fasalo — Fasal Seedhe Aapke Paas</div>
          <div>Smart India Hackathon 2026 &bull; Problem Statement 26033 &bull; Ministry of Consumer Affairs</div>
        </div>
      </footer>
    </main>
  );
}
