"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Listing } from "../../lib/types";

const CROP_EMOJIS: Record<string, string> = {
  tomato: "🍅", onion: "🧅", potato: "🥔", okra: "🥬", wheat: "🌾",
  corn: "🌽", mango: "🥭", garlic: "🧄", cauliflower: "🥦",
};
function cropEmoji(name: string) { return CROP_EMOJIS[name.toLowerCase()] ?? "🌱"; }

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-blue-100 text-blue-800 border-blue-200",
  C: "bg-amber-100 text-amber-700 border-amber-200",
  D: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function BrowsePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cropSearch, setCropSearch] = useState("");
  const [grade, setGrade] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    void loadListings();
  }, [user, authLoading]);

  async function loadListings(cropName = cropSearch, qualityGrade = grade) {
    setLoading(true); setError("");
    try {
      let url = "/listings?status=active";
      if (cropName) url += `&cropName=${encodeURIComponent(cropName)}`;
      if (qualityGrade) url += `&qualityGrade=${encodeURIComponent(qualityGrade)}`;
      setListings(await api.get<Listing[]>(url));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally { setLoading(false); }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    void loadListings();
  }

  if (authLoading) return null;
  if (!user) return null;

  return (
    <main className="container mx-auto max-w-6xl p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          🛒 Marketplace
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Fresh produce, direct from farmers. No middlemen.</p>
      </div>

      {/* Filter bar */}
      <form onSubmit={handleFilterSubmit} className="mb-8 bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search crop (e.g. Tomato, Onion…)"
            value={cropSearch}
            onChange={(e) => setCropSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
        <select value={grade} onChange={(e) => setGrade(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 transition-all bg-white min-w-[160px]">
          <option value="">All Grades</option>
          <option value="A">Grade A — Premium</option>
          <option value="B">Grade B — Standard</option>
          <option value="C">Grade C — Processing</option>
          <option value="D">Grade D</option>
        </select>
        <button type="submit"
          className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm whitespace-nowrap">
          Apply
        </button>
        {(cropSearch || grade) && (
          <button type="button" onClick={() => { setCropSearch(""); setGrade(""); void loadListings("", ""); }}
            className="px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-500 hover:bg-zinc-50 transition-all whitespace-nowrap">
            Clear
          </button>
        )}
      </form>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">🌱</div>
            <p className="text-zinc-500 font-medium">Loading fresh produce…</p>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-semibold text-zinc-700 mb-2">No produce found</h3>
          <p className="text-zinc-500 text-sm mb-4">Try adjusting your search filters.</p>
          {(cropSearch || grade) && (
            <button onClick={() => { setCropSearch(""); setGrade(""); void loadListings("", ""); }}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-500 mb-4">{listings.length} listing{listings.length !== 1 ? "s" : ""} available</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((l) => (
              <Link key={l.id} href={`/listings/${l.id}`} className="group block">
                <div className="h-full flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-5 relative">
                    <span className="text-4xl">{cropEmoji(l.cropName)}</span>
                    {l.fpoAggregation && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                        FPO
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">{l.cropName}</h3>
                        {l.variety && <p className="text-xs text-zinc-500">{l.variety}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${GRADE_COLORS[l.qualityGrade]}`}>
                        Grade {l.qualityGrade}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl font-extrabold text-zinc-900">₹{l.pricePerUnit}</span>
                        <span className="text-sm text-zinc-500 font-medium">/kg</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span className="font-medium text-emerald-600">{l.quantity}kg available</span>
                        <span>📍 {l.location.address?.split(",")[0] || "India"}</span>
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">🗓 Harvest: {l.harvestDate}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100">
                      <div className="text-xs font-semibold text-center text-emerald-600 group-hover:text-emerald-700 transition-colors">
                        View & Order →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
