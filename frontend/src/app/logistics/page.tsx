"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { ColdStorage, Order, Shipment, ShipmentStatus, Transporter } from "../../lib/types";

const NEXT_STATUS: Partial<Record<ShipmentStatus, { status: ShipmentStatus; label: string }>> = {
  scheduled: { status: "picked_up", label: "Mark picked up" },
  picked_up: { status: "in_transit", label: "Start transit" },
  in_transit: { status: "out_for_delivery", label: "Out for delivery" },
  out_for_delivery: { status: "delivered", label: "Mark delivered" },
};

export default function LogisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [storage, setStorage] = useState<ColdStorage[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedTransporter, setSelectedTransporter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isFarmer = user?.role === "farmer" || user?.role === "fpo";

  async function loadData() {
    try {
      const [allOrders, allShipments, storageResponse, transporterResponse] = await Promise.all([
        api.get<Order[]>("/orders"),
        api.get<Shipment[]>("/logistics/shipments"),
        api.get<{ facilities: ColdStorage[] }>("/logistics/cold-storages"),
        api.get<{ transporters: Transporter[] }>("/logistics/transporters"),
      ]);
      setOrders(allOrders);
      setShipments(allShipments);
      setStorage(storageResponse.facilities);
      setTransporters(transporterResponse.transporters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load logistics data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
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

  if (authLoading || loading) return <main className="container mx-auto p-6"><p className="text-zinc-500">Loading logistics…</p></main>;
  if (!user) return null;

  const schedulableOrders = orders.filter((order) => order.status === "confirmed" && !shipments.some((shipment) => shipment.orderId === order.id));

  return (
    <main className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-700">Phase 3 · Demo logistics</p>
        <h1 className="text-2xl font-bold text-zinc-900">Shipment coordination</h1>
        <p className="mt-1 text-sm text-zinc-600">Track an order from scheduled pickup through delivery.</p>
      </div>
      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {isFarmer && schedulableOrders.length > 0 && (
        <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="font-semibold text-emerald-900">Arrange transport for a confirmed order</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <select value={selectedOrder} onChange={(event) => setSelectedOrder(event.target.value)} className="rounded-md border bg-white p-2 text-sm">
              <option value="">Select order</option>
              {schedulableOrders.map((order) => <option key={order.id} value={order.id}>#{order.id.slice(0, 8)} · {order.quantity}kg · ₹{order.totalPrice}</option>)}
            </select>
            <select value={selectedTransporter} onChange={(event) => setSelectedTransporter(event.target.value)} className="rounded-md border bg-white p-2 text-sm">
              <option value="">Select transporter</option>
              {transporters.map((transporter) => <option key={transporter.id} value={transporter.id}>{transporter.name} · {transporter.vehicleType}</option>)}
            </select>
            <button onClick={scheduleShipment} disabled={!selectedOrder || !selectedTransporter} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Schedule pickup</button>
          </div>
        </section>
      )}

      <section className="mb-7">
        <h2 className="mb-3 text-lg font-semibold">Shipment tracking</h2>
        {shipments.length === 0 ? <p className="text-sm text-zinc-500">No shipments yet. Confirm an order, then arrange transport.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {shipments.map((shipment) => {
              const next = NEXT_STATUS[shipment.status];
              return <article key={shipment.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{shipment.transporterName}</h3><p className="text-xs text-zinc-500">Order #{shipment.orderId.slice(0, 8)} · {shipment.vehicleNumber}</p></div><span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">{shipment.status.replaceAll("_", " ")}</span></div>
                <p className="mt-3 text-sm text-zinc-600">Estimated delivery: {new Date(shipment.estimatedDeliveryAt).toLocaleString()}</p>
                <ol className="mt-3 space-y-2 border-l-2 border-emerald-200 pl-3">
                  {shipment.events.map((event, index) => <li key={`${event.occurredAt}-${index}`} className="text-xs text-zinc-600"><span className="font-semibold capitalize text-zinc-800">{event.status.replaceAll("_", " ")}</span> · {event.note}<br /><span className="text-zinc-400">{new Date(event.occurredAt).toLocaleString()}</span></li>)}
                </ol>
                {isFarmer && next && <button onClick={() => advanceShipment(shipment)} className="mt-4 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800">{next.label}</button>}
              </article>;
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">Nearby cold storage</h2><span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Mock catalogue</span></div>
        <p className="mb-3 text-sm text-zinc-600">Static facilities for the hackathon demo; availability is not live or bookable.</p>
        <div className="grid gap-3 md:grid-cols-3">{storage.map((facility) => <article key={facility.id} className="rounded-xl border border-zinc-200 p-4"><h3 className="font-semibold">{facility.name}</h3><p className="mt-1 text-sm text-zinc-600">{facility.location}</p><p className="mt-2 text-sm text-emerald-700">{facility.availableTonnes} t available / {facility.capacityTonnes} t</p><p className="mt-2 text-xs text-zinc-500">{facility.contact}</p></article>)}</div>
      </section>
    </main>
  );
}
