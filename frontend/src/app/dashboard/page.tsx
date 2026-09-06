"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../lib/api";
import type { Listing, Order, Shipment } from "../../lib/types";

type PriceTrend = { date: string; pricePerKg: number };

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-zinc-200 bg-white p-4"><p className="text-sm text-zinc-500">{label}</p><p className="mt-1 text-2xl font-bold text-emerald-700">{value}</p></article>;
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
      api.get<Order[]>("/orders"), api.get<Listing[]>("/listings"), api.get<Shipment[]>("/logistics/shipments"), api.get<{ trend: PriceTrend[] }>("/ecosystem/enam-prices/history"),
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
    return { revenue: orders.filter((order) => order.status !== "cancelled").reduce((total, order) => total + order.totalPrice, 0), delivered: orders.filter((order) => order.status === "delivered").length, active: shipments.filter((shipment) => !["delivered", "cancelled"].includes(shipment.status)).length, topCrops };
  }, [orders, listings, shipments]);

  if (authLoading || loading) return <main className="container mx-auto p-6"><p className="text-zinc-500">Loading dashboard…</p></main>;
  if (!user) return null;
  const farmer = user.role === "farmer" || user.role === "fpo";
  const title = language === "hi" ? (farmer ? "किसान डैशबोर्ड" : user.role === "admin" ? "संस्थान डैशबोर्ड" : "खरीदार डैशबोर्ड") : (farmer ? "Farmer dashboard" : user.role === "admin" ? "Institution dashboard" : "Buyer dashboard");
  const maxCrop = Math.max(...metrics.topCrops.map(([, value]) => value), 1);
  const maxTrend = Math.max(...trend.map((point) => point.pricePerKg), 1);

  return <main className="container mx-auto max-w-6xl p-6">
    <p className="text-sm font-medium text-emerald-700">Phase 6 · Demo control centre</p><h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
    {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label={language === "hi" ? "ऑर्डर" : "Orders"} value={String(orders.length)} /><Metric label={language === "hi" ? "कुल बिक्री" : "Order value"} value={`₹${metrics.revenue}`} /><Metric label={language === "hi" ? "डिलीवर" : "Delivered"} value={String(metrics.delivered)} /><Metric label={language === "hi" ? "चल रही डिलीवरी" : "Active shipments"} value={String(metrics.active)} /></section>
    <section className="mt-7 grid gap-6 lg:grid-cols-2">
      <article className="rounded-xl border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Top crops by ordered quantity</h2><div className="mt-4 space-y-3">{metrics.topCrops.length ? metrics.topCrops.map(([crop, quantity]) => <div key={crop}><div className="flex justify-between text-sm"><span>{crop}</span><span>{quantity} kg</span></div><div className="mt-1 h-3 rounded bg-zinc-100"><div className="h-3 rounded bg-emerald-600" style={{ width: `${(quantity / maxCrop) * 100}%` }} /></div></div>) : <p className="text-sm text-zinc-500">Orders will appear here after the first purchase.</p>}</div></article>
      <article className="rounded-xl border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Tomato market-price trend</h2><p className="text-xs text-amber-700">Mock eNAM-shaped sample data · ₹/kg</p><div className="mt-4 flex h-36 items-end gap-2">{trend.map((point) => <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-1"><span className="text-xs">₹{point.pricePerKg}</span><div className="w-full rounded-t bg-amber-500" style={{ height: `${(point.pricePerKg / maxTrend) * 100}%` }} /><span className="text-[10px] text-zinc-500">{point.date.slice(5)}</span></div>)}</div></article>
    </section>
    <section className="mt-7 rounded-xl border border-zinc-200 bg-zinc-50 p-5"><h2 className="font-semibold">Demo flow ready</h2><p className="mt-1 text-sm text-zinc-600">Farmer lists with AI price guidance → buyer orders → escrow is held → farmer schedules shipment → delivery updates the order → buyer leaves a review.</p></section>
  </main>;
}
