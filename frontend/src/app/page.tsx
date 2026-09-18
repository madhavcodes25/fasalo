"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

type HealthStatus = "checking" | "ok" | "error";

const FEATURES = [
  { icon: "🌾", title: "Direct Trading", desc: "Farmers list produce directly — no mandi agents, no commission layers.", color: "bg-green-50 border-green-200" },
  { icon: "🔒", title: "Escrow Payments", desc: "Funds held securely until delivery is confirmed, protecting both sides.", color: "bg-blue-50 border-blue-200" },
  { icon: "🚛", title: "Smart Logistics", desc: "Cold storage locators + real-time shipment tracking to reduce spoilage.", color: "bg-amber-50 border-amber-200" },
  { icon: "✨", title: "AI Pricing", desc: "Market-data-backed price suggestions so farmers always list at a fair price.", color: "bg-purple-50 border-purple-200" },
];

const STEPS = [
  { num: "1", title: "Farmer lists produce", desc: "Enter crop details, get an AI price suggestion, publish the listing." },
  { num: "2", title: "Buyer places order", desc: "Consumer buys direct; bulk buyer submits a bid for large volumes." },
  { num: "3", title: "Escrow + Delivery", desc: "Payment is held in escrow. Released to farmer only after confirmed delivery." },
];

export default function HomePage() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then((r) => { if (!r.ok) throw new Error(); setStatus("ok"); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative bg-emerald-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #6ee7b7 0%, transparent 50%), radial-gradient(circle at 75% 20%, #34d399 0%, transparent 40%)" }} />
        <div className="relative container mx-auto max-w-5xl px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-700/80 border border-emerald-600 text-emerald-200 text-xs font-semibold tracking-widest uppercase mb-8">
            Smart India Hackathon 2026 • Problem 26033
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            फसल सीधे <span className="text-emerald-300">आपके पास</span>
            <span className="block text-2xl sm:text-3xl font-medium text-emerald-200 mt-3">
              From Farm to Table — No Middlemen
            </span>
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Fasalo directly connects <strong className="text-white">farmers & FPOs</strong> with retail consumers and bulk buyers — with AI-powered pricing, escrow protection, and real-time logistics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/browse" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-800 font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-all hover:-translate-y-0.5 text-base">
              🛒 Browse Marketplace
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl border-2 border-emerald-500 hover:bg-emerald-500 transition-all hover:-translate-y-0.5 text-base">
              🌾 I&apos;m a Farmer / Buyer
            </Link>
          </div>

          {/* Backend status pill */}
          <div className="mt-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 text-xs text-emerald-300">
            <span className={`w-2 h-2 rounded-full ${status === "ok" ? "bg-emerald-400 animate-pulse" : status === "error" ? "bg-red-400" : "bg-zinc-400"}`} />
            {status === "ok" ? "Backend online" : status === "error" ? "Backend offline" : "Connecting…"}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-bold text-center text-zinc-800 mb-3">Built for India&apos;s Farmers</h2>
        <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">Every feature addresses a real pain point in the agricultural supply chain.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className={`rounded-2xl border p-6 ${f.color} hover:-translate-y-1 transition-transform`}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-zinc-900 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-zinc-200 py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center text-zinc-800 mb-3">How Fasalo Works</h2>
          <p className="text-zinc-500 text-center mb-12">A complete end-to-end transaction in 3 steps.</p>
          <div className="flex flex-col md:flex-row gap-0">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex-1 flex flex-col items-center text-center p-6 relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-11 w-full h-0.5 bg-emerald-200" style={{ left: "50%" }} />
                )}
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mb-4 relative z-10 shadow-md">
                  {step.num}
                </div>
                <h3 className="font-bold text-zinc-900 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="bg-emerald-800 rounded-3xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Demo?</h2>
          <p className="text-emerald-200 mb-8">Use the demo accounts below — no setup required.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-8">
            {[
              { role: "🌾 Farmer", email: "farmer@fasalo.com" },
              { role: "🛒 Consumer", email: "consumer@fasalo.com" },
              { role: "🏭 Bulk Buyer", email: "bulk@fasalo.com" },
            ].map((a) => (
              <div key={a.email} className="bg-emerald-700/60 rounded-xl p-4 text-left">
                <div className="font-semibold mb-1">{a.role}</div>
                <div className="text-emerald-200 text-xs">{a.email}</div>
                <div className="text-emerald-300 text-xs">password: secret123</div>
              </div>
            ))}
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-800 font-bold rounded-xl hover:bg-emerald-50 transition-all hover:-translate-y-0.5">
            Login to Demo →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="font-semibold text-zinc-700">🌾 Fasalo — Fasal Seedhe Aapke Paas</div>
          <div>Smart India Hackathon 2026 • Problem Statement 26033 • Ministry of Consumer Affairs</div>
        </div>
      </footer>
    </main>
  );
}
