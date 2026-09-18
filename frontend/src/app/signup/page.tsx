"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, type SignupData } from "../../context/AuthContext";
import type { UserRole } from "../../lib/types";

const ROLES: { value: UserRole; label: string; desc: string; icon: string }[] = [
  { value: "farmer", label: "Farmer / FPO", desc: "List your produce for direct sale", icon: "🌾" },
  { value: "consumer", label: "Retail Consumer", desc: "Buy fresh produce directly", icon: "🛒" },
  { value: "bulk_buyer", label: "Bulk Buyer", desc: "Source large volumes via bidding", icon: "🏭" },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Partial<SignupData>>({ role: "consumer" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof SignupData, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.role) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await signup(form as SignupData);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header band */}
        <div className="bg-emerald-800 px-8 py-6 text-white">
          <div className="font-bold text-lg mb-1">🌾 Create Your Fasalo Account</div>
          <p className="text-emerald-300 text-sm">Join the direct farm-to-consumer marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Role selection */}
          <div>
            <p className="text-sm font-semibold text-zinc-700 mb-3">I am a…</p>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.role === r.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-zinc-200 hover:border-emerald-300 hover:bg-zinc-50"
                  }`}
                >
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                    onChange={() => update("role", r.value)} className="sr-only" />
                  <span className="text-2xl mb-1">{r.icon}</span>
                  <span className="text-xs font-semibold text-zinc-800">{r.label}</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name ?? ""} onChange={(e) => update("name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="Your name" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email</label>
              <input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="you@example.com" required />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Password</label>
            <input type="password" value={form.password ?? ""} onChange={(e) => update("password", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder="Min. 6 characters" required minLength={6} />
          </div>

          {/* Farmer extras */}
          {form.role === "farmer" && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Village / District</label>
                <input type="text" value={form.village ?? ""} onChange={(e) => update("village", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 transition-all bg-white"
                  placeholder="e.g. Nashik" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Farm size (acres)</label>
                <input type="number" min={0} value={form.farmSizeAcres ?? ""} onChange={(e) => update("farmSizeAcres", Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 transition-all bg-white" />
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-50 text-sm">
            {submitting ? "Creating account…" : "Create Account →"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
