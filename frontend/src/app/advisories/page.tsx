"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type MarketPrice = { cropName: string; market: string; modalPricePerKg: number; unit: string; observedOn: string };
type Weather = { source: string; live: boolean; location: string; observedAt: string; current: { temperature_2m: number; precipitation: number; wind_speed_10m: number }; today: { rainChance: number; maxTemp?: number; minTemp?: number }; advisory: string };

export default function AdvisoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.replace("/login");
    Promise.allSettled([api.get<{ prices: MarketPrice[] }>("/ecosystem/enam-prices"), api.get<Weather>("/ecosystem/weather?location=Nashik")])
      .then(([market, forecast]) => {
        if (market.status === "fulfilled") setPrices(market.value.prices);
        if (forecast.status === "fulfilled") setWeather(forecast.value);
        else setError("Live weather data is temporarily unavailable. Market prices are still available.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return <main className="container mx-auto p-6"><p className="text-zinc-500">Loading market and weather advisory…</p></main>;
  if (!user) return null;

  return <main className="container mx-auto max-w-5xl p-6">
    <p className="text-sm font-medium text-emerald-700">Phase 5 · Ecosystem integrations</p>
    <h1 className="text-2xl font-bold text-zinc-900">Market & weather advisories</h1>
    {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {weather && <section className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-5">
      <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-sky-950">Live weather · {weather.location}</h2><span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">LIVE</span></div>
      <p className="mt-2 text-2xl font-bold text-sky-950">{weather.current.temperature_2m}°C</p>
      <p className="text-sm text-sky-900">Rain chance: {weather.today.rainChance}% · Wind: {weather.current.wind_speed_10m} km/h</p>
      <p className="mt-3 rounded-md bg-white/70 p-3 text-sm font-medium text-sky-950">{weather.advisory}</p>
      <p className="mt-2 text-xs text-sky-700">Source: {weather.source}; updated {new Date(weather.observedAt).toLocaleString()}.</p>
    </section>}
    <section className="mt-7"><div className="flex items-center gap-2"><h2 className="text-lg font-semibold">eNAM-style market prices</h2><span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Mock data</span></div>
      <p className="mb-3 text-sm text-zinc-600">A stable demo feed shaped like market-price data; it is not a live eNAM connection.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{prices.map((price) => <article key={`${price.cropName}-${price.market}`} className="rounded-xl border border-zinc-200 p-4"><h3 className="font-semibold">{price.cropName}</h3><p className="mt-1 text-sm text-zinc-600">{price.market}</p><p className="mt-3 text-lg font-bold text-emerald-700">₹{price.modalPricePerKg}/{price.unit}</p><p className="text-xs text-zinc-500">Observed: {price.observedOn}</p></article>)}</div>
    </section>
  </main>;
}
