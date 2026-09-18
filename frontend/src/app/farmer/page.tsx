"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Listing } from "../../lib/types";
import { getPriceSuggestion, type PriceSuggestion } from "../../lib/ai";

const GRADES = ["A", "B", "C", "D"] as const;
const GRADE_LABELS: Record<string, string> = { A: "Grade A — Premium", B: "Grade B — Standard", C: "Grade C — Processing", D: "Grade D" };

const CROP_EMOJIS: Record<string, string> = {
  tomato: "🍅", onion: "🧅", potato: "🥔", okra: "🥬", wheat: "🌾", rice: "🍚",
  corn: "🌽", mango: "🥭", banana: "🍌", garlic: "🧄", cauliflower: "🥦",
};
function cropEmoji(name: string): string {
  return CROP_EMOJIS[name.toLowerCase()] ?? "🌱";
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  sold_out: "bg-red-100 text-red-700",
  draft: "bg-zinc-100 text-zinc-600",
};

export default function FarmerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bids, setBids] = useState<Record<string, {id: string; quantity: number; proposedPrice: number; message?: string; status: string}[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const [suggestingPrice, setSuggestingPrice] = useState(false);
  const [form, setForm] = useState({
    cropName: "", variety: "", quantity: "", pricePerUnit: "",
    qualityGrade: "A" as typeof GRADES[number], harvestDate: "", address: "", fpoAggregation: false,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "farmer" && user.role !== "fpo") { router.replace("/browse"); return; }
    void loadListings();
  }, [user, authLoading]);

  async function loadListings() {
    setLoading(true); setError("");
    try {
      const data = await api.get<Listing[]>("/listings?mine=true");
      setListings(data);
      const bidMap: typeof bids = {};
      await Promise.all(data.map(async (l) => {
        try { bidMap[l.id] = await api.get<typeof bids[string]>(`/bids?listingId=${l.id}`); }
        catch { bidMap[l.id] = []; }
      }));
      setBids(bidMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally { setLoading(false); }
  }

  async function respondToBid(bidId: string, action: "accept" | "reject") {
    setError("");
    try {
      await api.patch(`/bids/${bidId}`, { action });
      await loadListings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update bid");
    }
  }

  const update = (f: keyof typeof form, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  async function suggestPrice() {
    if (!form.cropName) { setError("Enter a crop name first"); return; }
    setSuggestingPrice(true); setError("");
    try {
      const result = await getPriceSuggestion({
        cropName: form.cropName, qualityGrade: form.qualityGrade,
        quantityKg: Number(form.quantity) || 100, region: form.address || user?.village || "Nashik",
      });
      setPriceSuggestion(result);
    } catch {
      setError("AI service unavailable. Start ai-services on port 8000.");
    } finally { setSuggestingPrice(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cropName || !form.quantity || !form.pricePerUnit || !form.harvestDate) {
      setError("Please fill all required fields"); return;
    }
    setError("");
    try {
      await api.post<Listing>("/listings", {
        cropName: form.cropName, variety: form.variety, quantity: Number(form.quantity),
        pricePerUnit: Number(form.pricePerUnit), qualityGrade: form.qualityGrade,
        harvestDate: form.harvestDate,
        location: { lat: 0, lng: 0, address: form.address || user?.village || "Not specified" },
        fpoAggregation: form.fpoAggregation, status: "active",
      });
      setShowForm(false);
      setForm({ cropName: "", variety: "", quantity: "", pricePerUnit: "", qualityGrade: "A", harvestDate: "", address: "", fpoAggregation: false });
      setPriceSuggestion(null);
      await loadListings();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to create listing"); }
  }

  if (authLoading || loading) return (
    <main className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🌾</div>
        <p className="text-zinc-500 font-medium">Loading your listings…</p>
      </div>
    </main>
  );
  if (!user) return null;

  return (
    <main className="container mx-auto max-w-5xl p-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Listings</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Welcome, {user.name.split(" ")[0]} · {user.village && <span className="text-emerald-600">{user.village}</span>}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(""); setPriceSuggestion(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:-translate-y-0.5 text-sm"
        >
          + List New Produce
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Listing form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4">
            <h2 className="text-lg font-bold text-emerald-900">New Produce Listing</h2>
            <p className="text-sm text-emerald-700">Fill in the details below. Use AI to get a price suggestion.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Crop Name *</label>
                <input type="text" placeholder="e.g. Tomato" value={form.cropName}
                  onChange={(e) => update("cropName", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Variety</label>
                <input type="text" placeholder="e.g. Desi Red (optional)" value={form.variety}
                  onChange={(e) => update("variety", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Quantity (kg) *</label>
                <input type="number" min={0} placeholder="e.g. 500" value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Quality Grade</label>
                <select value={form.qualityGrade} onChange={(e) => update("qualityGrade", e.target.value as typeof GRADES[number])}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all">
                  {GRADES.map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
                </select>
              </div>
            </div>

            {/* AI Price Suggestion */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={suggestPrice} disabled={suggestingPrice}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm">
                  {suggestingPrice ? "⏳ Checking market…" : "✨ Get AI Price Suggestion"}
                </button>
                {priceSuggestion && (
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="bg-white rounded-lg border border-emerald-200 px-4 py-2 flex-1 min-w-[200px]">
                      <div className="text-lg font-bold text-emerald-700">₹{priceSuggestion.suggestedPricePerKg}/kg</div>
                      <div className="text-xs text-emerald-600">Range: ₹{priceSuggestion.recommendedRange.min} – ₹{priceSuggestion.recommendedRange.max}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Demo heuristic — review before listing</div>
                    </div>
                    <button type="button"
                      onClick={() => update("pricePerUnit", String(priceSuggestion.suggestedPricePerKg))}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap">
                      Apply Price
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Price per kg (₹) *</label>
                <input type="number" min={0} step={0.5} placeholder="e.g. 32" value={form.pricePerUnit}
                  onChange={(e) => update("pricePerUnit", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Harvest Date *</label>
                <input type="date" value={form.harvestDate} onChange={(e) => update("harvestDate", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Location</label>
                <input type="text" placeholder="Village / district (e.g. Nashik, Maharashtra)" value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors">
              <input type="checkbox" checked={form.fpoAggregation} onChange={(e) => update("fpoAggregation", e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600" />
              <div>
                <span className="text-sm font-semibold text-zinc-700">FPO Aggregated</span>
                <span className="text-xs text-zinc-500 block">Pooled produce from multiple small farmers</span>
              </div>
            </label>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm">
                Publish Listing
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(""); setPriceSuggestion(null); }}
                className="px-6 py-3 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-lg font-semibold text-zinc-700 mb-2">No listings yet</h3>
          <p className="text-zinc-500 text-sm mb-6">Create your first listing to start selling directly to consumers.</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm">
            + Create First Listing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => {
            const listingBids = bids[l.id] ?? [];
            const pendingBids = listingBids.filter((b) => b.status === "pending");
            return (
              <div key={l.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cropEmoji(l.cropName)}</span>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg">{l.cropName}</h3>
                        {l.variety && <p className="text-sm text-zinc-500">{l.variety}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {l.fpoAggregation && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">FPO</span>
                      )}
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[l.status]}`}>
                        {l.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-zinc-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-zinc-900">₹{l.pricePerUnit}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">per kg</div>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-zinc-900">{l.quantity}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">kg available</div>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-3 text-center">
                      <div className="text-sm font-bold text-zinc-900">Grade {l.qualityGrade}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Harvest {l.harvestDate}</div>
                    </div>
                  </div>

                  {l.location.address && (
                    <p className="mt-3 text-xs text-zinc-500 flex items-center gap-1">
                      📍 {l.location.address}
                    </p>
                  )}
                </div>

                {/* Bids panel */}
                {listingBids.length > 0 && (
                  <div className="border-t border-zinc-100 bg-amber-50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-amber-900">Bulk Buyer Bids</h4>
                      {pendingBids.length > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                          {pendingBids.length} pending
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {listingBids.map((b) => (
                        <div key={b.id} className="flex items-center justify-between bg-white rounded-xl border border-amber-100 p-3 gap-3">
                          <div className="text-sm">
                            <span className="font-semibold">{b.quantity}kg</span>
                            <span className="text-zinc-500"> @ </span>
                            <span className="font-semibold text-emerald-700">₹{b.proposedPrice}/kg</span>
                            <span className="text-zinc-500 text-xs ml-2">= ₹{(b.proposedPrice * b.quantity).toLocaleString()}</span>
                            {b.message && <span className="text-xs text-zinc-400 block mt-0.5">"{b.message}"</span>}
                          </div>
                          <div className="flex-shrink-0">
                            {b.status === "pending" ? (
                              <div className="flex gap-2">
                                <button onClick={() => respondToBid(b.id, "accept")}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                                  Accept
                                </button>
                                <button onClick={() => respondToBid(b.id, "reject")}
                                  className="px-3 py-1.5 border border-zinc-300 text-xs font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${b.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {b.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-amber-700">Accepting a bid creates a confirmed order and reserves stock.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
