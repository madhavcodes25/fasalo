"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
  db: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = () => {
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => {
        setHealth(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center gap-10 py-16 px-6 bg-zinc-50 font-sans">
      {/* Hero / Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-emerald-700 sm:text-5xl">
          Fasalo 🌾
        </h1>
        <p className="mt-2 text-lg text-zinc-600">
          <em>Fasal Seedhe Aapke Paas</em> — Direct farmer-to-consumer
          marketplace
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Smart India Hackathon • Problem Statement 26033 • Ministry of Consumer
          Affairs
        </p>
      </header>

      {/* Phase 0 — Backend Health Check demo */}
      <section className="w-full max-w-xl rounded-xl bg-white p-6 shadow ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-zinc-800">
          Phase 0 — Backend Connection
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          This page calls the backend health-check endpoint
          (<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">{BACKEND_URL}/api/health</code>).
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50 p-3">
          <span className="text-sm font-medium text-zinc-700">Status</span>
          {loading ? (
            <span className="text-sm text-zinc-500">Checking…</span>
          ) : error ? (
            <span className="text-sm font-medium text-red-600">Failed</span>
          ) : (
            <span
              className={
                health?.status === "ok"
                  ? "text-sm font-medium text-green-600"
                  : "text-sm font-medium text-yellow-600"
              }
            >
              {health?.status ?? "unknown"}
            </span>
          )}
        </div>

        {loading && (
          <div className="mt-3 text-center text-sm text-zinc-500">
            Connecting to backend…
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
            <br />
            Is the backend running on port 4000?
          </div>
        )}

        {health && (
          <pre className="mt-3 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-green-300">
            {JSON.stringify(health, null, 2)}
          </pre>
        )}

        <button
          type="button"
          onClick={fetchHealth}
          disabled={loading}
          className="mt-4 w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          Re-check connection
        </button>
      </section>

      {/* Phases placeholder */}
      <footer className="text-center text-xs text-zinc-400">
        <p>
          Phase 0 scaffold — subsequent phases will add marketplace, trust layer,
          logistics, and AI features.
        </p>
      </footer>
    </main>
  );
}
