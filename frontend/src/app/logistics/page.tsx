"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { ColdStorage, Order, Shipment, ShipmentStatus, Transporter, Listing } from "../../lib/types";

const NEXT_STATUS: Partial<Record<ShipmentStatus, { status: ShipmentStatus; label: string }>> = {
  scheduled: { status: "picked_up", label: "Mark Picked Up" },
  picked_up: { status: "in_transit", label: "Start Transit" },
  in_transit: { status: "out_for_delivery", label: "Out for Delivery" },
  out_for_delivery: { status: "delivered", label: "Mark Delivered" },
};
const STATUS_STEPS = ["scheduled", "picked_up", "in_transit", "out_for_delivery", "delivered"];

export default function LogisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [storage, setStorage] = useState<ColdStorage[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [listingsMap, setListingsMap] = useState<Record<string, string>>({});
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedTransporter, setSelectedTransporter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isFarmer = user?.role === "farmer" || user?.role === "fpo";

  async function loadData() {
    try {
      const [allOrders, allShipments, storageResponse, transporterResponse, listingsData] = await Promise.all([
        api.get<Order[]>("/orders"),
        api.get<Shipment[]>("/logistics/shipments"),
        api.get<{ facilities: ColdStorage[] }>("/logistics/cold-storages"),
        api.get<{ transporters: Transporter[] }>("/logistics/transporters"),
        api.get<Listing[]>("/listings"),
      ]);
      setOrders(allOrders);
      setShipments(allShipments);
      setStorage(storageResponse.facilities);
      setTransporters(transporterResponse.transporters);
      const map: Record<string, string> = {};
      listingsData.forEach((l) => { map[l.id] = l.cropName; });
      setListingsMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load logistics data");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    void loadData();
  }, [authLoading, user]);

  async function scheduleShipment() {
    if (!selectedOrder || !selectedTransporter) return;
    try {
      await api.post("/logistics/shipments", {
        orderId: selectedOrder, transporterId: selectedTransporter,
        estimatedDeliveryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      setSelectedOrder(""); setSelectedTransporter("");
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to schedule shipment"); }
  }

  async function advanceShipment(shipment: Shipment) {
    const next = NEXT_STATUS[shipment.status];
    if (!next) return;
    try {
      await api.patch(`/logistics/shipments/${shipment.id}/status`, { status: next.status });
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update shipment"); }
  }

  if (authLoading || loading) return (
    <main className="flex justify-center items-center min-h-screen" style={{ background: "#faf8f4" }}>
      <div className="text-center"><div className="spinner mx-auto mb-4"></div><p className="font-semibold" style={{ color: "#6d4d22" }}>Loading logistics…</p></div>
    </main>
  );
  if (!user) return null;

  const schedulableOrders = orders.filter((o) => o.status === "confirmed" && !shipments.some((s) => s.orderId === o.id));

  return (
    <main className="min-h-screen" style={{ background: "#faf8f4" }}>
      <div className="relative h-36 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" alt="Logistics" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.75), rgba(30,66,24,0.9))" }} />
        <div className="relative container mx-auto max-w-5xl px-6 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-white animate-fade-up">Shipment Logistics</h1>
          <p className="text-sm mt-1 animate-fade-up delay-100" style={{ color: "#b8e3af" }}>Schedule transport, track shipments, and find cold storage</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-8">
        {error && <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>}

        {/* Transport scheduling */}
        {isFarmer && schedulableOrders.length > 0 && (
          <section className="mb-8 bg-white rounded-2xl shadow-sm overflow-hidden animate-scale-in" style={{ border: "1px solid #b8e3af" }}>
            <div className="px-6 py-4" style={{ background: "#f2f9f0", borderBottom: "1px solid #b8e3af" }}>
              <h2 className="font-extrabold" style={{ color: "#1e4218" }}>Arrange Transport</h2>
              <p className="text-sm mt-0.5" style={{ color: "#3a7d30" }}>You have confirmed orders awaiting dispatch</p>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-4">
              <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none bg-white"
                style={{ borderColor: "#b8e3af", color: "#1e4218" }}>
                <option value="">Select order</option>
                {schedulableOrders.map((o) => (
                  <option key={o.id} value={o.id}>{listingsMap[o.listingId] || "Produce"} ({o.quantity}kg) — #{o.id.slice(0, 8)}</option>
                ))}
              </select>
              <select value={selectedTransporter} onChange={(e) => setSelectedTransporter(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none bg-white"
                style={{ borderColor: "#b8e3af", color: "#1e4218" }}>
                <option value="">Select transporter</option>
                {transporters.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.vehicleType})</option>)}
              </select>
              <button onClick={scheduleShipment} disabled={!selectedOrder || !selectedTransporter}
                className="px-6 py-2.5 font-bold rounded-xl text-sm shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 whitespace-nowrap"
                style={{ background: "#2d6324", color: "#fff" }}>
                Schedule Pickup
              </button>
            </div>
          </section>
        )}

        {/* Shipments */}
        <section className="mb-8">
          <h2 className="text-xl font-extrabold mb-4 animate-fade-up" style={{ color: "#1e4218" }}>Active Shipments</h2>
          {shipments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl" style={{ border: "2px dashed #e8d0a3" }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "#f2f9f0" }}>
                <svg className="w-6 h-6" fill="none" stroke="#3a7d30" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12h12l1-12" /></svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#8b6330" }}>No active shipments</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {shipments.map((shipment, i) => {
                const next = NEXT_STATUS[shipment.status];
                const currentIdx = STATUS_STEPS.indexOf(shipment.status);
                const cropName = listingsMap[orders.find((o) => o.id === shipment.orderId)?.listingId || ""] || "Produce";
                return (
                  <div key={shipment.id} className={`bg-white rounded-2xl shadow-sm p-6 animate-fade-up delay-${i * 100}`} style={{ border: "1px solid #e8d0a3" }}>
                    <div className="flex justify-between items-start gap-4 mb-5">
                      <div>
                        <h3 className="font-extrabold text-lg" style={{ color: "#1e4218" }}>{cropName} — {shipment.transporterName}</h3>
                        <p className="text-sm mt-0.5" style={{ color: "#a87c42" }}>Order #{shipment.orderId.slice(0, 8)} &bull; {shipment.vehicleNumber}</p>
                      </div>
                      {isFarmer && next && (
                        <button onClick={() => advanceShipment(shipment)}
                          className="px-4 py-2 font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm whitespace-nowrap"
                          style={{ background: "#2d6324", color: "#fff" }}>
                          {next.label}
                        </button>
                      )}
                    </div>

                    {/* Progress stepper */}
                    <div className="relative pt-5 pb-6">
                      <div className="absolute top-[30px] left-0 w-full h-1 rounded-full" style={{ background: "#f5ead6" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%`, background: "linear-gradient(to right, #4a9c3d, #2d6324)" }} />
                      </div>
                      <div className="relative flex justify-between">
                        {STATUS_STEPS.map((s, idx) => (
                          <div key={s} className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 bg-white z-10 flex items-center justify-center transition-all duration-500"
                              style={{ borderColor: idx <= currentIdx ? "#2d6324" : "#e8d0a3" }}>
                              {idx <= currentIdx && <div className="w-2 h-2 rounded-full" style={{ background: "#2d6324" }} />}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-center" style={{ color: idx <= currentIdx ? "#2d6324" : "#a87c42" }}>
                              {s.replaceAll("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Events log */}
                    {shipment.events.length > 0 && (
                      <div className="rounded-xl p-4 mt-2" style={{ background: "#faf8f4", border: "1px solid #e8d0a3" }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8b6330" }}>Timeline</p>
                        <div className="space-y-2">
                          {shipment.events.map((event, idx) => (
                            <div key={`${event.occurredAt}-${idx}`} className="flex gap-3 text-sm">
                              <div className="text-xs font-mono w-28 flex-shrink-0 pt-0.5" style={{ color: "#a87c42" }}>
                                {new Date(event.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                              <div>
                                <span className="font-bold capitalize" style={{ color: "#1e4218" }}>{event.status.replaceAll("_", " ")}</span>
                                <span className="ml-2" style={{ color: "#6d4d22" }}>{event.note}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Cold Storage */}
        <section>
          <h2 className="text-xl font-extrabold mb-4 animate-fade-up" style={{ color: "#1e4218" }}>Nearby Cold Storage</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {storage.map((facility, i) => (
              <div key={facility.id} className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-up delay-${i * 100}`} style={{ border: "1px solid #e8d0a3" }}>
                <h3 className="font-extrabold" style={{ color: "#1e4218" }}>{facility.name}</h3>
                <p className="text-xs mt-1" style={{ color: "#a87c42" }}>{facility.location}</p>
                <div className="mt-4 mb-3">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span style={{ color: "#2d6324" }}>{facility.availableTonnes}t available</span>
                    <span style={{ color: "#8b6330" }}>{facility.capacityTonnes}t total</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#f5ead6" }}>
                    <div className="h-full rounded-full" style={{ width: `${(facility.availableTonnes / facility.capacityTonnes) * 100}%`, background: "linear-gradient(to right, #4a9c3d, #2d6324)" }} />
                  </div>
                </div>
                <div className="pt-3 text-sm font-semibold" style={{ borderTop: "1px solid #f5ead6", color: "#6d4d22" }}>
                  {facility.contact}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
