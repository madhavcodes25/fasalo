"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../lib/api";
import type { Listing, Order, Shipment } from "../../lib/types";

type PriceTrend = { date: string; pricePerKg: number };

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden animate-fade-up" style={{ border: "1px solid #e8d0a3" }}>
      <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "#f2f9f0" }}>{icon}</div>
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#8b6330" }}>{label}</p>
      <p className="text-3xl font-extrabold" style={{ color: "#1e4218" }}>{value}</p>
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
    const names = new Map(listings.map((l) => [l.id, l.cropName]));
    const topCrops = Object.entries(orders.reduce<Record<string, number>>((total, o) => {
      const name = names.get(o.listingId) ?? "Other";
      total[name] = (total[name] ?? 0) + o.quantity;
      return total;
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const revenue = orders.filter((o) => o.status !== "cancelled").reduce((t, o) => t + o.totalPrice, 0);
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const active = shipments.filter((s) => !["delivered", "cancelled"].includes(s.status)).length;
    return { revenue, delivered, active, topCrops };
  }, [orders, listings, shipments]);

  if (authLoading || loading) return (
    <main className="flex justify-center items-center min-h-screen" style={{ background: "#faf8f4" }}>
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="font-semibold" style={{ color: "#6d4d22" }}>Loading dashboard…</p>
      </div>
    </main>
  );
  if (!user) return null;

  const isFarmer = user.role === "farmer" || user.role === "fpo";
  const title = isFarmer ? "Farmer Dashboard" : user.role === "admin" ? "Admin Dashboard" : "Buyer Dashboard";
  const maxCrop = Math.max(...metrics.topCrops.map(([, v]) => v), 1);
  const maxTrend = Math.max(...trend.map((p) => p.pricePerKg), 1);

  return (
    <main className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Header */}
      <div className="relative h-36 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" alt="Dashboard" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.75), rgba(30,66,24,0.9))" }} />
        <div className="relative container mx-auto max-w-6xl px-6 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-white animate-fade-up">{title}</h1>
          <p className="text-sm mt-1 animate-fade-up delay-100" style={{ color: "#b8e3af" }}>Overview of your activity on Fasalo</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-8">
        {error && <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>}

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard label="Total Orders" value={String(orders.length)} icon="📦" />
          <MetricCard label={isFarmer ? "Total Revenue" : "Total Spent"} value={`₹${metrics.revenue.toLocaleString()}`} icon="💰" />
          <MetricCard label="Delivered" value={String(metrics.delivered)} icon="✅" />
          <MetricCard label="Active Shipments" value={String(metrics.active)} icon="🚛" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Crops */}
          <div className="bg-white rounded-2xl p-6 shadow-sm animate-fade-up delay-200" style={{ border: "1px solid #e8d0a3" }}>
            <h2 className="text-lg font-extrabold mb-6" style={{ color: "#1e4218" }}>{isFarmer ? "Top Crops by Volume" : "My Most Ordered Crops"}</h2>
            <div className="space-y-4">
              {metrics.topCrops.length > 0 ? metrics.topCrops.map(([crop, qty]) => (
                <div key={crop}>
                  <div className="flex justify-between text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>
                    <span>{crop}</span>
                    <span>{qty} kg</span>
                  </div>
                  <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: "#f2f9f0" }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(qty / maxCrop) * 100}%`, background: "linear-gradient(to right, #4a9c3d, #2d6324)" }} />
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-sm" style={{ color: "#a87c42" }}>No transaction data yet</div>
              )}
            </div>
          </div>

          {/* eNAM Chart (Farmers only) */}
          {isFarmer ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm animate-fade-up delay-300" style={{ border: "1px solid #e8d0a3" }}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-extrabold" style={{ color: "#1e4218" }}>Tomato Market Trend</h2>
                  <p className="text-xs mt-1" style={{ color: "#8b6330" }}>Avg price (₹/kg) last 7 days</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: "#f5ead6", color: "#8b6330" }}>eNAM Data</span>
              </div>
              <div className="flex h-48 items-end gap-2 w-full pb-2" style={{ borderBottom: "1px solid #f5ead6" }}>
                {trend.map((point) => (
                  <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-1 group relative">
                    <div className="absolute -top-8 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none" style={{ background: "#1e4218" }}>
                      ₹{point.pricePerKg}
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#3a7d30" }}>₹{point.pricePerKg}</span>
                    <div className="w-full rounded-t-md transition-colors duration-300" style={{ height: `${Math.max((point.pricePerKg / maxTrend) * 100, 5)}%`, background: "#b8e3af" }} />
                    <span className="text-[10px]" style={{ color: "#a87c42" }}>{point.date.slice(8)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center animate-fade-up delay-300" style={{ border: "1px solid #e8d0a3" }}>
              <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=75" alt="Fresh produce" className="w-28 h-28 rounded-2xl object-cover mb-4" />
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "#1e4218" }}>Ready for your next order?</h2>
              <p className="text-sm mb-6 max-w-sm" style={{ color: "#8b6330" }}>Browse the marketplace for fresh, directly-sourced produce from local farmers.</p>
              <button onClick={() => router.push("/browse")} className="px-6 py-3 font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm" style={{ background: "#2d6324", color: "#fff" }}>
                Browse Marketplace
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
