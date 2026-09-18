"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Listing } from "../../lib/types";

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "#f2f9f0", text: "#2d6324", border: "#b8e3af" },
  B: { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  C: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  D: { bg: "#f5f5f5", text: "#6b7280", border: "#d1d5db" },
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

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Page hero */}
      <div className="relative h-40 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80" alt="Marketplace" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.75), rgba(30,66,24,0.9))" }} />
        <div className="relative container mx-auto max-w-6xl px-6 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-white animate-fade-up">Marketplace</h1>
          <p className="text-sm mt-1 animate-fade-up delay-100" style={{ color: "#b8e3af" }}>Fresh produce, direct from Indian farmers. Zero middlemen.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-8">
        {/* Filter bar */}
        <form onSubmit={handleFilterSubmit} className="mb-8 bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-fade-up" style={{ border: "1px solid #e8d0a3" }}>
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="#a87c42" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            <input
              ref={searchRef} type="text"
              placeholder="Search crop (e.g. Tomato, Onion…)"
              value={cropSearch} onChange={(e) => setCropSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all"
              style={{ borderColor: "#e8d0a3" }}
              onFocus={e => (e.target.style.borderColor = "#3a7d30")}
              onBlur={e => (e.target.style.borderColor = "#e8d0a3")}
            />
          </div>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none bg-white min-w-[160px]"
            style={{ borderColor: "#e8d0a3", color: "#4f3618" }}>
            <option value="">All Grades</option>
            <option value="A">Grade A — Premium</option>
            <option value="B">Grade B — Standard</option>
            <option value="C">Grade C — Processing</option>
            <option value="D">Grade D</option>
          </select>
          <button type="submit"
            className="px-6 py-2.5 font-bold rounded-xl transition-all shadow-sm text-sm whitespace-nowrap hover:-translate-y-0.5"
            style={{ background: "#2d6324", color: "#fff" }}>
            Search
          </button>
          {(cropSearch || grade) && (
            <button type="button" onClick={() => { setCropSearch(""); setGrade(""); void loadListings("", ""); }}
              className="px-4 py-2.5 rounded-xl text-sm whitespace-nowrap"
              style={{ border: "1px solid #e8d0a3", color: "#8b6330" }}>
              Clear
            </button>
          )}
        </form>

        {error && <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="font-semibold" style={{ color: "#6d4d22" }}>Loading fresh produce…</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl" style={{ border: "2px dashed #e8d0a3" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "#f2f9f0" }}>
              <svg className="w-8 h-8" fill="none" stroke="#3a7d30" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#1e4218" }}>No produce found</h3>
            <p className="text-sm mb-4" style={{ color: "#8b6330" }}>Try adjusting your search filters.</p>
            {(cropSearch || grade) && (
              <button onClick={() => { setCropSearch(""); setGrade(""); void loadListings("", ""); }}
                className="text-sm font-bold" style={{ color: "#2d6324" }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm mb-4 animate-fade-in" style={{ color: "#8b6330" }}>
              {listings.length} listing{listings.length !== 1 ? "s" : ""} available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((l, i) => {
                const gc = GRADE_COLORS[l.qualityGrade] || GRADE_COLORS.D;
                return (
                  <Link key={l.id} href={`/listings/${l.id}`} className="group block">
                    <div className={`h-full flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-up delay-${Math.min(i * 50, 500)}`} style={{ border: "1px solid #e8d0a3" }}>
                      {/* Card image */}
                      <div className="relative h-36 overflow-hidden" style={{ background: "#f2f9f0" }}>
                        <img
                          src={
                            l.cropName.toLowerCase() === "tomato" ? "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=75" :
                            l.cropName.toLowerCase() === "onion" ? "https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG" :
                            l.cropName.toLowerCase() === "potato" ? "https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg" :
                            "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=75"
                          }
                          alt={l.cropName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {l.fpoAggregation && (
                          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#2d6324", color: "#fff" }}>FPO</span>
                        )}
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: gc.bg, color: gc.text, border: `1px solid ${gc.border}` }}>
                          Grade {l.qualityGrade}
                        </span>
                      </div>

                      {/* Card body */}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="mb-3">
                          <h3 className="font-bold text-base group-hover:transition-colors" style={{ color: "#1e4218" }}>{l.cropName}</h3>
                          {l.variety && <p className="text-xs mt-0.5" style={{ color: "#8b6330" }}>{l.variety}</p>}
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-2xl font-extrabold" style={{ color: "#1e4218" }}>&#8377;{l.pricePerUnit}</span>
                            <span className="text-sm font-semibold" style={{ color: "#8b6330" }}>/kg</span>
                          </div>
                          <div className="flex items-center justify-between text-xs" style={{ color: "#8b6330" }}>
                            <span className="font-semibold" style={{ color: "#3a7d30" }}>{l.quantity}kg available</span>
                            <span>{l.location.address?.split(",")[0] || "India"}</span>
                          </div>
                          <div className="mt-2 text-xs" style={{ color: "#a87c42" }}>Harvest: {l.harvestDate}</div>
                        </div>

                        <div className="mt-4 pt-3" style={{ borderTop: "1px solid #f5ead6" }}>
                          <div className="text-xs font-bold text-center transition-colors" style={{ color: "#2d6324" }}>
                            View &amp; Order
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
