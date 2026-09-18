"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../lib/api";
import type { Listing, Order, Shipment } from "../../lib/types";

type PriceTrend = { date: string; pricePerKg: number };

function MetricCard({ label, value, trend, icon }: { label: string; value: string; trend?: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm relative overflow-hidden">
      <div className="text-3xl absolute top-5 right-5 opacity-20">{icon}</div>
      <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-zinc-900">{value}</p>
      {trend && <p className="text-xs font-semibold text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">↑ {trend}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trend, setTrend] = useState<PriceTrend[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.replace("/login");
    Promise.all([
      api.get<Order[]>("/orders"), 
      api.get<Listing[]>("/listings"), 
      api.get<Shipment[]>("/logistics/shipments"), 
      api.get<{ trend: PriceTrend[] }>("/ecosystem/enam-prices/history"),
    ]).then(([orderData, listingData, shipmentData, trendData]) => {
      setOrders(orderData); setListings(listingData); setShipments(shipmentData); setTrend(trendData.trend);
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load dashboard")).finally(() => setLoading(false));
  }, [authLoading, user, router]);

  const metrics = useMemo(() => {
    const names = new Map(listings.map((listing) => [listing.id, listing.cropName]));
    const topCrops = Object.entries(orders.reduce<Record<string, number>>((total, order) => {
      const name = names.get(order.listingId) ?? "Other";
      total[name] = (total[name] ?? 0) + order.quantity;
      return total;
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 4);
    
    const revenue = orders.filter((order) => order.status !== "cancelled").reduce((total, order) => total + order.totalPrice, 0);
    const delivered = orders.filter((order) => order.status === "delivered").length;
    const active = shipments.filter((shipment) => !["delivered", "cancelled"].includes(shipment.status)).length;
    
    return { revenue, delivered, active, topCrops };
  }, [orders, listings, shipments]);

  if (authLoading || loading) return <main className="container mx-auto p-8 flex justify-center"><div className="text-center"><div className="text-4xl animate-bounce mb-3">📊</div><p className="text-zinc-500">Loading dashboard…</p></div></main>;
  if (!user) return null;
  
  const isFarmer = user.role === "farmer" || user.role === "fpo";
  const title = language === "hi" ? (isFarmer ? "किसान डैशबोर्ड" : user.role === "admin" ? "संस्थान डैशबोर्ड" : "खरीदार डैशबोर्ड") : (isFarmer ? "Farmer Dashboard" : user.role === "admin" ? "Admin Dashboard" : "Buyer Dashboard");
  const maxCrop = Math.max(...metrics.topCrops.map(([, value]) => value), 1);
  const maxTrend = Math.max(...trend.map((point) => point.pricePerKg), 1);

  return (
    <main className="container mx-auto max-w-6xl p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="text-zinc-500 text-sm mt-1">Overview of your activity and market trends.</p>
      </div>
      
      {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      
      {/* Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard label={language === "hi" ? "ऑर्डर" : "Total Orders"} value={String(orders.length)} icon="📦" />
        <MetricCard label={language === "hi" ? "कुल बिक्री" : (isFarmer ? "Total Revenue" : "Total Spent")} value={`₹${metrics.revenue.toLocaleString()}`} icon="💸" />
        <MetricCard label={language === "hi" ? "डिलीवर" : "Completed Deliveries"} value={String(metrics.delivered)} icon="✅" />
        <MetricCard label={language === "hi" ? "चल रही डिलीवरी" : "Active Shipments"} value={String(metrics.active)} icon="🚚" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Top Crops Chart */}
        <article className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">{isFarmer ? "Top Crops by Volume" : "My Most Ordered Crops"}</h2>
          <div className="space-y-5">
            {metrics.topCrops.length > 0 ? metrics.topCrops.map(([crop, quantity]) => (
              <div key={crop}>
                <div className="flex justify-between text-sm font-semibold text-zinc-700 mb-2">
                  <span>{crop}</span>
                  <span>{quantity} kg</span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(quantity / maxCrop) * 100}%` }} />
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-zinc-500 text-sm">No transaction data yet.</div>
            )}
          </div>
        </article>

        {/* Price Trend Chart (Farmers Only) */}
        {isFarmer ? (
          <article className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Tomato Market Trend</h2>
                <p className="text-xs text-zinc-500 mt-1">Average price (₹/kg) last 7 days</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase">eNAM Data</span>
            </div>
            
            <div className="mt-4 flex h-48 items-end gap-3 w-full border-b border-zinc-100 pb-2">
              {trend.map((point, i) => (
                <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    ₹{point.pricePerKg} on {point.date.slice(5)}
                  </div>
                  
                  <span className="text-xs font-semibold text-emerald-700">₹{point.pricePerKg}</span>
                  <div 
                    className="w-full rounded-t-md bg-emerald-100 group-hover:bg-emerald-300 transition-colors duration-300" 
                    style={{ height: `${Math.max((point.pricePerKg / maxTrend) * 100, 5)}%` }} 
                  />
                  <span className="text-[10px] text-zinc-400 absolute -bottom-6">{point.date.slice(8)}</span>
                </div>
              ))}
            </div>
          </article>
        ) : (
          <article className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="text-5xl mb-4">🛒</div>
             <h2 className="text-xl font-bold text-zinc-900 mb-2">Ready for your next order?</h2>
             <p className="text-sm text-zinc-500 mb-6 max-w-sm">Browse the marketplace for fresh, directly-sourced produce from local farmers.</p>
             <button onClick={() => router.push("/browse")} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
               Browse Marketplace
             </button>
          </article>
        )}
      </section>
    </main>
  );
}
