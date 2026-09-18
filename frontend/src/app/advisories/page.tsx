"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type MarketPrice = { cropName: string; market: string; modalPricePerKg: number; unit: string; observedOn: string };
type Weather = { source: string; live: boolean; location: string; observedAt: string; current: { temperature_2m: number; precipitation: number; wind_speed_10m: number }; today: { rainChance: number; maxTemp?: number; minTemp?: number }; advisory: string };

const CROP_IMAGES: Record<string, string> = {
  tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=75",
  onion: "https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG",
  potato: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg",
  default: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80",
};
function cropImg(name: string) { return CROP_IMAGES[name.toLowerCase()] ?? CROP_IMAGES.default; }

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
    const loc = user.village || "Nashik";
    Promise.allSettled([
      api.get<{ prices: MarketPrice[] }>("/ecosystem/enam-prices"),
      api.get<Weather>(`/ecosystem/weather?location=${encodeURIComponent(loc)}`),
    ]).then(([market, forecast]) => {
      if (market.status === "fulfilled") setPrices(market.value.prices);
      if (forecast.status === "fulfilled") setWeather(forecast.value);
      else setError("Live weather is temporarily unavailable. Market prices are still shown.");
    }).finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return (
    <main className="flex justify-center items-center min-h-screen" style={{ background: "#faf8f4" }}>
      <div className="text-center"><div className="spinner mx-auto mb-4"></div><p className="font-semibold" style={{ color: "#6d4d22" }}>Loading advisories…</p></div>
    </main>
  );
  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Header */}
      <div className="relative h-36 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80" alt="Farm advisories" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.75), rgba(30,66,24,0.9))" }} />
        <div className="relative container mx-auto max-w-6xl px-6 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-white animate-fade-up">Ecosystem Advisories</h1>
          <p className="text-sm mt-1 animate-fade-up delay-100" style={{ color: "#b8e3af" }}>Live weather and real-time mandi market prices</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-8">
        {error && <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weather Card */}
          {weather ? (
            <section className="lg:col-span-1 animate-slide-in-left">
              <div className="relative rounded-3xl overflow-hidden h-full shadow-xl text-white" style={{ minHeight: "320px" }}>
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80" alt="Weather" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.6), rgba(30,66,24,0.92))" }} />
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-bold text-sm" style={{ color: "#b8e3af" }}>Live Weather</h2>
                      <p className="font-extrabold text-lg">{weather.location}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(74,156,61,0.3)", border: "1px solid #4a9c3d", color: "#b8e3af" }}>LIVE</span>
                  </div>
                  <div>
                    <div className="text-6xl font-black tracking-tighter mb-3">{weather.current.temperature_2m}<span className="text-3xl font-medium" style={{ color: "#b8e3af" }}>°C</span></div>
                    <div className="flex gap-5 text-sm font-semibold mb-4" style={{ color: "#dff2da" }}>
                      <div>Rain: {weather.today.rainChance}%</div>
                      <div>Wind: {weather.current.wind_speed_10m} km/h</div>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#b8e3af" }}>Smart Advisory</p>
                      <p className="text-sm font-semibold leading-relaxed">{weather.advisory}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* eNAM Prices */}
          <section className={`lg:col-span-${weather ? "2" : "3"} animate-fade-up delay-200`}>
            <div className="bg-white rounded-3xl p-6 h-full shadow-sm" style={{ border: "1px solid #e8d0a3" }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold" style={{ color: "#1e4218" }}>Live Mandi Prices</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full" style={{ background: "#f5ead6", color: "#8b6330" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#a87c42" }}></span>
                  eNAM Network
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {prices.map((price) => (
                  <div key={`${price.cropName}-${price.market}`} className="flex items-center gap-4 p-4 rounded-2xl border hover:-translate-y-0.5 transition-all duration-200 cursor-default" style={{ border: "1px solid #e8d0a3" }}>
                    <img src={cropImg(price.cropName)} alt={price.cropName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate" style={{ color: "#1e4218" }}>{price.cropName}</h3>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#8b6330" }}>{price.market}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-extrabold" style={{ color: "#2d6324" }}>&#8377;{price.modalPricePerKg}</div>
                      <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#a87c42" }}>per {price.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
