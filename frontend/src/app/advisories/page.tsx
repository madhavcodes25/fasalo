"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type MarketPrice = { cropName: string; market: string; modalPricePerKg: number; unit: string; observedOn: string };
type Weather = { source: string; live: boolean; location: string; observedAt: string; current: { temperature_2m: number; precipitation: number; wind_speed_10m: number }; today: { rainChance: number; maxTemp?: number; minTemp?: number }; advisory: string };

const CROP_EMOJIS: Record<string, string> = {
  tomato: "🍅", onion: "🧅", potato: "🥔", okra: "🥬", wheat: "🌾",
  corn: "🌽", mango: "🥭", garlic: "🧄", cauliflower: "🥦",
};
function cropEmoji(name: string) { return CROP_EMOJIS[name.toLowerCase()] ?? "🌱"; }

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
    
    // Auto-detect location for weather if available, otherwise default to Nashik
    const loc = user.village || "Nashik";
    
    Promise.allSettled([
      api.get<{ prices: MarketPrice[] }>("/ecosystem/enam-prices"), 
      api.get<Weather>(`/ecosystem/weather?location=${encodeURIComponent(loc)}`)
    ])
      .then(([market, forecast]) => {
        if (market.status === "fulfilled") setPrices(market.value.prices);
        if (forecast.status === "fulfilled") setWeather(forecast.value);
        else setError("Live weather data is temporarily unavailable. Market prices are still available.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  if (authLoading || loading) return <main className="container mx-auto p-8 flex justify-center"><div className="text-center"><div className="text-4xl animate-bounce mb-3">🌤</div><p className="text-zinc-500">Loading advisories…</p></div></main>;
  if (!user) return null;

  return (
    <main className="container mx-auto max-w-6xl p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Ecosystem Advisories</h1>
        <p className="text-zinc-500 text-sm mt-1">Live weather updates and real-time mandi prices.</p>
      </div>

      {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weather Hero Card (Spans 1 col on large screens) */}
        {weather && (
          <section className="lg:col-span-1">
            <div className="bg-gradient-to-b from-sky-400 to-sky-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-20 text-8xl">
                {weather.today.rainChance > 50 ? "🌧" : "☀️"}
              </div>
              
              <div className="flex justify-between items-start relative z-10 mb-8">
                <div>
                  <h2 className="font-bold text-sky-100 flex items-center gap-1">📍 {weather.location}</h2>
                  <p className="text-xs text-sky-200 mt-1">{new Date(weather.observedAt).toLocaleDateString()}</p>
                </div>
                <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">Live Sync</span>
              </div>
              
              <div className="relative z-10 mb-8">
                <div className="text-6xl font-extrabold tracking-tighter">
                  {weather.current.temperature_2m}°<span className="text-4xl text-sky-200 font-medium">C</span>
                </div>
                <div className="flex gap-4 mt-3 text-sm font-medium text-sky-100">
                  <div className="flex items-center gap-1"><span>💧</span> {weather.today.rainChance}% Rain</div>
                  <div className="flex items-center gap-1"><span>💨</span> {weather.current.wind_speed_10m} km/h</div>
                </div>
              </div>
              
              <div className="mt-auto relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-xs font-bold text-sky-200 uppercase tracking-wider mb-2">Smart Advisory</div>
                <p className="text-sm font-medium leading-relaxed">
                  {weather.advisory}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* eNAM Prices (Spans 2 cols on large screens) */}
        <section className={`lg:col-span-${weather ? '2' : '3'}`}>
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-zinc-900">Live Mandi Prices</h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                eNAM Network
              </span>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {prices.map((price) => (
                <div key={`${price.cropName}-${price.market}`} className="flex items-center p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors group">
                  <div className="text-4xl mr-4">{cropEmoji(price.cropName)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-zinc-900 group-hover:text-emerald-800 transition-colors">{price.cropName}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">📍 {price.market}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-emerald-700">₹{price.modalPricePerKg}</div>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">per {price.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
