"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { ColdStorage, Order, Shipment, ShipmentStatus, Transporter, Listing } from "../../lib/types";

const NEXT_STATUS: Partial<Record<ShipmentStatus, { status: ShipmentStatus; label: string }>> = {
  scheduled: { status: "picked_up", label: "Mark picked up" },
  picked_up: { status: "in_transit", label: "Start transit" },
  in_transit: { status: "out_for_delivery", label: "Out for delivery" },
  out_for_delivery: { status: "delivered", label: "Mark delivered" },
};

const STATUS_PROGRESS = ["scheduled", "picked_up", "in_transit", "out_for_delivery", "delivered"];

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
        api.get<Listing[]>("/listings")
      ]);
      setOrders(allOrders);
      setShipments(allShipments);
      setStorage(storageResponse.facilities);
      setTransporters(transporterResponse.transporters);
      
      const map: Record<string, string> = {};
      listingsData.forEach(l => { map[l.id] = l.cropName; });
      setListingsMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load logistics data");
    } finally {
      setLoading(false);
    }
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
        orderId: selectedOrder,
        transporterId: selectedTransporter,
        estimatedDeliveryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      setSelectedOrder("");
      setSelectedTransporter("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to schedule shipment");
    }
  }

  async function advanceShipment(shipment: Shipment) {
    const next = NEXT_STATUS[shipment.status];
    if (!next) return;
    try {
      await api.patch(`/logistics/shipments/${shipment.id}/status`, { status: next.status });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update shipment");
    }
  }

  if (authLoading || loading) return (
    <main className="container mx-auto p-8 flex justify-center"><div className="text-center"><div className="text-4xl animate-bounce mb-3">🚛</div><p className="text-zinc-500">Loading logistics…</p></div></main>
  );
  if (!user) return null;

  const schedulableOrders = orders.filter((order) => order.status === "confirmed" && !shipments.some((shipment) => shipment.orderId === order.id));

  return (
    <main className="container mx-auto max-w-5xl p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Shipment Logistics</h1>
        <p className="text-zinc-500 text-sm mt-1">Track orders from scheduled pickup through delivery, and find nearby cold storage.</p>
      </div>

      {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {/* Transport Scheduling */}
      {isFarmer && schedulableOrders.length > 0 && (
        <section className="mb-10 bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
            <h2 className="font-bold text-emerald-900">Arrange Transport</h2>
            <p className="text-sm text-emerald-700 mt-0.5">You have confirmed orders awaiting dispatch.</p>
          </div>
          <div className="p-6 flex flex-col md:flex-row gap-4">
            <select value={selectedOrder} onChange={(event) => setSelectedOrder(event.target.value)} 
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 bg-white">
              <option value="">Select order</option>
              {schedulableOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {listingsMap[order.listingId] || "Produce"} ({order.quantity}kg) — Order #{order.id.slice(0,8)}
                </option>
              ))}
            </select>
            <select value={selectedTransporter} onChange={(event) => setSelectedTransporter(event.target.value)} 
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 bg-white">
              <option value="">Select transporter</option>
              {transporters.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.vehicleType})</option>)}
            </select>
            <button onClick={scheduleShipment} disabled={!selectedOrder || !selectedTransporter} 
              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all whitespace-nowrap">
              Schedule Pickup
            </button>
          </div>
        </section>
      )}

      {/* Active Shipments */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">Active Shipments</h2>
        {shipments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-300">
            <div className="text-3xl mb-3">🚛</div>
            <p className="text-zinc-500 text-sm">No active shipments.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {shipments.map((shipment) => {
              const next = NEXT_STATUS[shipment.status];
              const currentIndex = STATUS_PROGRESS.indexOf(shipment.status);
              const cropName = listingsMap[orders.find(o => o.id === shipment.orderId)?.listingId || ""] || "Produce";
              
              return (
                <div key={shipment.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">{cropName} — {shipment.transporterName}</h3>
                      <p className="text-sm text-zinc-500 mt-1">Order #{shipment.orderId.slice(0, 8)} • Vehicle: {shipment.vehicleNumber}</p>
                    </div>
                    {isFarmer && next && (
                      <button onClick={() => advanceShipment(shipment)} 
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm">
                        {next.label} →
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative pt-6 pb-2">
                    <div className="absolute top-8 left-0 w-full h-1 bg-zinc-100 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${(currentIndex / (STATUS_PROGRESS.length - 1)) * 100}%` }} />
                    </div>
                    <div className="relative flex justify-between">
                      {STATUS_PROGRESS.map((status, i) => (
                        <div key={status} className="flex flex-col items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-colors ${i <= currentIndex ? "border-blue-500" : "border-zinc-300"}`}>
                            {i <= currentIndex && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                          </div>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${i <= currentIndex ? "text-blue-700" : "text-zinc-400"}`}>
                            {status.replaceAll("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Logs */}
                  <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Timeline</h4>
                    <div className="space-y-3">
                      {shipment.events.map((event, index) => (
                        <div key={`${event.occurredAt}-${index}`} className="flex gap-3 text-sm">
                          <div className="text-zinc-400 font-mono text-xs w-32 flex-shrink-0 pt-0.5">
                            {new Date(event.occurredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-700 capitalize mr-2">{event.status.replaceAll("_", " ")}</span>
                            <span className="text-zinc-500">{event.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cold Storage */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-zinc-900 inline-flex items-center gap-2">
            Nearby Cold Storage ❄️
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {storage.map((facility) => (
            <div key={facility.id} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-zinc-900">{facility.name}</h3>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">📍 {facility.location}</p>
              
              <div className="mt-4 mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-700">{facility.availableTonnes}t available</span>
                  <span className="text-zinc-500">{facility.capacityTonnes}t total</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(facility.availableTonnes / facility.capacityTonnes) * 100}%` }} />
                </div>
              </div>
              
              <div className="pt-3 border-t border-zinc-100 text-sm font-medium text-zinc-700">
                📞 {facility.contact}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
