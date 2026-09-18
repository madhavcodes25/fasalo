"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("consumer@fasalo.com");
  const [password, setPassword] = useState("secret123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      // AuthContext.login now only persists; redirect happens here
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const DEMO_ACCOUNTS = [
    { role: "🌾 Farmer", email: "farmer@fasalo.com", badge: "bg-green-100 text-green-800" },
    { role: "🛒 Consumer", email: "consumer@fasalo.com", badge: "bg-blue-100 text-blue-800" },
    { role: "🏭 Bulk Buyer", email: "bulk@fasalo.com", badge: "bg-purple-100 text-purple-800" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between bg-emerald-800 text-white p-10 w-5/12">
          <div>
            <div className="text-2xl font-bold mb-2">🌾 Fasalo</div>
            <div className="text-emerald-300 text-sm">फसल सीधे आपके पास</div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-3">Direct from Farm to Table</h2>
            <p className="text-emerald-200 text-sm leading-relaxed">
              No middlemen. No hidden markups. Farmers earn more, consumers pay less — with AI-powered pricing and escrow-backed payments.
            </p>
            <div className="mt-8 space-y-3">
              {["✓ AI price suggestions for fair listing", "✓ Escrow-protected payments", "✓ Real-time shipment tracking", "✓ Live weather advisories"].map((item) => (
                <div key={item} className="text-sm text-emerald-200">{item}</div>
              ))}
            </div>
          </div>
          <div className="text-xs text-emerald-400">Smart India Hackathon 2026 • Problem 26033</div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
            <p className="text-zinc-500 mt-1 text-sm">Sign in to your Fasalo account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="you@example.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="••••••••" required
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={submitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:translate-y-0 text-sm"
            >
              {submitting ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New to Fasalo?{" "}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Create account
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Demo accounts — all use password: <code className="bg-zinc-100 px-1 py-0.5 rounded">secret123</code>
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setEmail(acc.email)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl border border-zinc-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer ${email === acc.email ? "border-emerald-400 bg-emerald-50" : ""}`}
                >
                  <span className="text-sm text-zinc-700">{acc.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${acc.badge}`}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
