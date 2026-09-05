"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Listing } from "../../lib/types";

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

  const refresh = () => {
    loadListings();
  };

  if (authLoading || loading) {
    return <main className="container mx-auto p-6"><p className="text-zinc-500">Loading produce…</p></main>;
  }
  if (!user) return null;

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Farm Fresh Marketplace</h1>
      <p className="mb-4 text-sm text-zinc-500">Direct from farmers, no middlemen.</p>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Crop name (e.g. Tomato)"
          value={filters.cropName}
          onChange={(e) => setFilters({ ...filters, cropName: e.target.value })}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
        />
        <select
          value={filters.qualityGrade}
          onChange={(e) => setFilters({ ...filters, qualityGrade: e.target.value })}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
        >
          <option value="">All quality grades</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
          <option value="D">Grade D</option>
        </select>
        <button
          onClick={refresh}
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Apply
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {listings.length === 0 ? (
        <p className="text-sm text-zinc-500">No produce found. Try adjusting filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="block">
              <div className="rounded-xl border border-zinc-200 p-4 hover:border-emerald-300 hover:shadow transition-shadow">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-lg text-zinc-800">{l.cropName}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    l.qualityGrade === "A" ? "bg-green-100 text-green-700" :
                    l.qualityGrade === "B" ? "bg-yellow-100 text-yellow-700" :
                    "bg-zinc-100 text-zinc-700"
                  }`}>Grade {l.qualityGrade}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  ₹{l.pricePerUnit}/kg · {l.quantity}kg available
                </p>
                <p className="mt-1 text-xs text-zinc-500">{l.location.address}</p>
                <p className="mt-2 text-xs text-zinc-500">Harvest: {l.harvestDate}</p>
                {l.fpoAggregation && <span className="mt-1 inline-block text-xs font-medium text-emerald-700">FPO aggregated</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
