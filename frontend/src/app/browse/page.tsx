"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Listing } from "../../lib/types";
import { MapPin, Calendar, Sprout, Filter, Search, Tag } from "lucide-react";

export default function BrowsePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ cropName: "", qualityGrade: "" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    loadListings();
  }, [user, authLoading]);

  async function loadListings() {
    setLoading(true);
    setError("");
    try {
      let url = "/listings?status=active";
      if (filters.cropName) url += `&cropName=${encodeURIComponent(filters.cropName)}`;
      if (filters.qualityGrade) url += `&qualityGrade=${encodeURIComponent(filters.qualityGrade)}`;
      const data = await api.get<Listing[]>(url);
      setListings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return <main className="container mx-auto p-8 max-w-6xl flex justify-center items-center min-h-[50vh]"><div className="animate-pulse flex flex-col items-center"><Sprout className="w-10 h-10 text-emerald-300 mb-4 animate-bounce" /><p className="text-zinc-500 font-medium tracking-wide">Loading fresh produce…</p></div></main>;
  }
  if (!user) return null;

  return (
    <main className="container mx-auto p-6 max-w-6xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
          Marketplace <Sprout className="text-emerald-500 w-8 h-8" />
        </h1>
        <p className="mt-2 text-zinc-500 font-medium">Direct from farmers, no middlemen. Fresh, fair, and transparent.</p>
      </div>

      {/* Filters */}
      <div className="mb-8 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-4 w-full">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search crop name (e.g. Tomato)"
              value={filters.cropName}
              onChange={(e) => setFilters({ ...filters, cropName: e.target.value })}
              className="w-full rounded-xl border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <select
              value={filters.qualityGrade}
              onChange={(e) => setFilters({ ...filters, qualityGrade: e.target.value })}
              className="w-full appearance-none rounded-xl border-zinc-200 bg-zinc-50 pl-10 pr-8 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
            >
              <option value="">All grades</option>
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Processing)</option>
              <option value="D">Grade D</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => loadListings()}
          className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-transform active:scale-95"
        >
          Apply Filters
        </button>
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100">{error}</div>}

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-zinc-300">
          <Tag className="w-12 h-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-700">No produce found</h3>
          <p className="text-sm text-zinc-500 mt-1 text-center max-w-sm">Try adjusting your filters or search terms. Farmers are constantly updating their listings.</p>
          {(filters.cropName || filters.qualityGrade) && (
            <button onClick={() => { setFilters({ cropName: "", qualityGrade: "" }); setTimeout(loadListings, 0); }} className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="group block">
              <div className="relative h-full flex flex-col bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 group-hover:text-emerald-700 transition-colors">{l.cropName}</h3>
                    {l.variety && <p className="text-xs text-zinc-500">{l.variety}</p>}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    l.qualityGrade === "A" ? "bg-green-100 text-green-700 border border-green-200" :
                    l.qualityGrade === "B" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                    "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}>Grade {l.qualityGrade}</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-zinc-900">₹{l.pricePerUnit}</span>
                    <span className="text-sm text-zinc-500 font-medium">/ kg</span>
                  </div>
                  <div className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded mt-1">
                    {l.quantity}kg available
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{l.location.address || "Nashik"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Harvest: {l.harvestDate}</span>
                  </div>
                </div>
                
                {l.fpoAggregation && (
                  <div className="absolute -top-3 -right-3 bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm shadow-indigo-100 transform rotate-12 group-hover:rotate-6 transition-transform">
                    FPO Hub
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
