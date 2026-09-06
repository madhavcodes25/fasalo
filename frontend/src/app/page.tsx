"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Truck, Sparkles, Server } from "lucide-react";

type HealthResponse = { status: string; service: string; timestamp: string; db: string; };
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = () => {
    setLoading(true); setError(null);
    fetch(`${BACKEND_URL}/api/health`)
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { void runHealthCheck(); }, []);

  return (
    <main className="flex flex-1 flex-col min-h-screen bg-zinc-50 font-sans selection:bg-emerald-200">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-900 pt-20 pb-32 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-50 to-transparent"></div>
        
        <div className="container relative mx-auto max-w-5xl px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm backdrop-blur-md">
            <span>Smart India Hackathon</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
            <span>Problem 26033</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 leading-tight">
            Fasal Seedhe <span className="text-emerald-400">Aapke Paas</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-emerald-100/90 mb-10 leading-relaxed font-light">
            Eliminating intermediaries to ensure farmers earn more and consumers pay less. 
            A transparent, AI-driven digital marketplace for India's agricultural future.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/browse" className="group flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-900/40 hover:-translate-y-1 w-full sm:w-auto">
              Browse Marketplace
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/signup" className="flex items-center justify-center rounded-xl border-2 border-emerald-700/50 bg-emerald-800/30 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-emerald-800/50 hover:border-emerald-600 hover:-translate-y-1 w-full sm:w-auto">
              Register as Farmer / Buyer
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto max-w-6xl px-6 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5"><Leaf className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Direct Trading</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">Connect directly with bulk buyers and consumers. Set your own prices based on real market data without middleman cuts.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5"><ShieldCheck className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Escrow Trust</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">Payments are held securely in escrow until delivery is confirmed, protecting both farmers from default and buyers from fraud.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5"><Truck className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Smart Logistics</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">Integrated cold-storage locators and live shipment tracking to drastically reduce spoilage of perishable goods.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-5"><Sparkles className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">AI Intelligence</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">Leverage dynamic price suggestions, crop demand forecasting, and optimized routing algorithms.</p>
          </div>

        </div>
      </section>

      {/* System Status Section */}
      <section className="container mx-auto max-w-3xl px-6 pb-24">
        <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-zinc-900/20 border border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-3 text-zinc-300 font-medium">
              <Server className="w-5 h-5 text-emerald-500" />
              <span>System Health Check</span>
            </div>
            <button onClick={runHealthCheck} disabled={loading} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
              {loading ? "Pinging..." : "Refresh"}
            </button>
          </div>
          
          <div className="p-6 bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Endpoint: <code className="text-emerald-400 bg-zinc-950 px-2 py-1 rounded ml-1">{BACKEND_URL}/api/health</code></span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  {health?.status === "ok" ? (
                    <><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></>
                  ) : loading ? (
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-500"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  )}
                </span>
                <span className={`text-sm font-semibold ${health?.status === "ok" ? "text-emerald-500" : error ? "text-red-500" : "text-zinc-500"}`}>
                  {health?.status === "ok" ? "Online" : error ? "Offline" : "Checking..."}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-950/50 border border-red-900 text-sm text-red-400">
                <p className="font-semibold mb-1">Connection Failed</p>
                <p>{error}. Is the backend running on port 4000?</p>
              </div>
            )}

            {health && (
              <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10 mt-auto">
        <div className="container mx-auto px-6 text-center flex flex-col items-center">
          <div className="text-2xl font-bold text-emerald-800 mb-4">Fasalo 🌾</div>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Marketplace • Trust Layer • Logistics • AI Features
            <br/>Built for the Smart India Hackathon.
          </p>
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Ready for Demonstration
          </p>
        </div>
      </footer>
    </main>
  );
}
