"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { getPriceSuggestion, type PriceSuggestion } from "../../lib/ai";
import type { Bid, Listing } from "../../lib/types";

const GRADES = ["A", "B", "C", "D"] as const;

export default function FarmerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bidsByListing, setBidsByListing] = useState<Record<string, Bid[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const [suggestingPrice, setSuggestingPrice] = useState(false);
  const [form, setForm] = useState({
    cropName: "", variety: "", quantity: "", pricePerUnit: "",
    qualityGrade: "A" as (typeof GRADES)[number], harvestDate: "", address: "", fpoAggregation: false,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.replace("/login");
    if (user.role !== "farmer" && user.role !== "fpo") return router.replace("/browse");
    loadListings();
  }, [user, authLoading]);

  async function loadListings() {
    setLoading(true); setError("");
    try {
      const data = await api.get<Listing[]>("/listings?mine=true");
      setListings(data);
      // Fetch bids for each listing (bulk-buyer negotiation flow)
      const bidMap: Record<string, Bid[]> = {};
      await Promise.all(
        data.map(async (l) => {
          try { bidMap[l.id] = await api.get<Bid[]>(`/bids?listingId=${l.id}`); }
          catch { bidMap[l.id] = []; }
        }),
      );
      setBidsByListing(bidMap);
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to load listings"); }
    finally { setLoading(false); }
  }

  async function respondToBid(bidId: string, action: "accept" | "reject") {
    try {
      await api.patch(`/bids/${bidId}`, { action });
      await loadListings(); // refresh listings (stock changes) + bids
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update bid");
    }
  }

  const update = (f: keyof typeof form, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  async function suggestPrice() {
    if (!form.cropName || !form.quantity) return setError("Enter a crop name and quantity to get a price suggestion");
    setSuggestingPrice(true); setError("");
    try {
      setPriceSuggestion(await getPriceSuggestion({ cropName: form.cropName, qualityGrade: form.qualityGrade, quantityKg: Number(form.quantity), region: form.address || user?.village || "Nashik" }));
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Could not reach the AI service"); }
    finally { setSuggestingPrice(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cropName || !form.quantity || !form.pricePerUnit || !form.harvestDate) return setError("Fill all required fields");
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
      setError(""); loadListings();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to create listing"); }
  }

  if (authLoading || loading) return <main className="container mx-auto p-6"><p className="text-zinc-500">Loading your listings…</p></main>;
  if (!user) return null;

    return (
    <main className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-700">My Listings</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + List New Produce
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {showForm && (
        <div className="mb-6 rounded-xl border border-zinc-200 p-5">
          <h2 className="mb-3 text-lg font-semibold">New Produce Listing</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Crop name (e.g. Tomato)" value={form.cropName}
              onChange={(e) => update("cropName", e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
            <input type="text" placeholder="Variety (optional)" value={form.variety}
              onChange={(e) => update("variety", e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
            <input type="number" min={0} placeholder="Quantity (kg)" value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
            <input type="number" min={0} placeholder="Price per kg (₹)" value={form.pricePerUnit}
              onChange={(e) => update("pricePerUnit", e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3 rounded-lg bg-emerald-50 p-3 border border-emerald-100 shadow-sm">
              <button type="button" onClick={suggestPrice} disabled={suggestingPrice} className="rounded-md border border-emerald-700 bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition-colors shadow-sm">{suggestingPrice ? "Checking market signal…" : "✨ Get AI price suggestion"}</button>
              {priceSuggestion && <div className="text-sm text-emerald-900 flex-1 flex justify-between items-center bg-white p-2 rounded border border-emerald-200"><div><span className="font-semibold text-emerald-700">Suggested: ₹{priceSuggestion.suggestedPricePerKg}/kg</span> <span className="text-emerald-600 text-xs ml-1">(₹{priceSuggestion.recommendedRange.min}–₹{priceSuggestion.recommendedRange.max})</span><p className="text-[11px] text-emerald-600 mt-0.5">Demo heuristic based on sample market data — review before listing.</p></div><button type="button" onClick={() => update("pricePerUnit", String(priceSuggestion.suggestedPricePerKg))} className="ml-3 rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm whitespace-nowrap">Apply Price</button></div>}
            </div>
            <select value={form.qualityGrade} onChange={(e) => update("qualityGrade", e.target.value as (typeof GRADES)[number])}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
              {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
            <input type="date" value={form.harvestDate} onChange={(e) => update("harvestDate", e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
            <input type="text" placeholder="Location / address" value={form.address}
              onChange={(e) => update("address", e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.fpoAggregation}
                onChange={(e) => update("fpoAggregation", e.target.checked)} />
              FPO-aggregated (pooled from multiple farmers)
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Save Listing</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {listings.length === 0 ? (
        <p className="text-sm text-zinc-500">You have no listings yet. Create one above!</p>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const bids = bidsByListing[l.id] ?? [];
            return (
              <div key={l.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{l.cropName} — ₹{l.pricePerUnit}/kg</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 ${
                    l.status === "sold_out" ? "bg-red-100 text-red-700" : ""
                  }`}>{l.status}</span>
                </div>
                <p className="text-sm text-zinc-600">{l.quantity}kg · Grade {l.qualityGrade} · Harvest {l.harvestDate}</p>
                {l.fpoAggregation && <span className="text-xs text-emerald-700">FPO aggregated</span>}

                {/* Bulk-buyer bid management */}
                {bids.length > 0 && (
                  <div className="mt-3 rounded-lg bg-zinc-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Bulk-buyer bids</p>
                    <ul className="mt-2 space-y-2">
                      {bids.map((b) => (
                        <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <div>
                            <span className="font-medium">{b.quantity}kg</span> @ ₹{b.proposedPrice}/kg
                            <span className="ml-2 text-xs text-zinc-500">(total ₹{b.proposedPrice * b.quantity})</span>
                            {b.message && <span className="ml-1 text-xs text-zinc-400">— {b.message}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {b.status === "pending" ? (
                              <>
                                <button onClick={() => respondToBid(b.id, "accept")}
                                  className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700">Accept</button>
                                <button onClick={() => respondToBid(b.id, "reject")}
                                  className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100">Reject</button>
                              </>
                            ) : (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                b.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                              }`}>{b.status.toUpperCase()}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 text-[11px] text-zinc-400">Accepting a bid creates a confirmed order and reserves stock.</p>
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
