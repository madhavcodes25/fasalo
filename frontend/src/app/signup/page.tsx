"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, type SignupData } from "../../context/AuthContext";
import type { UserRole } from "../../lib/types";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "farmer", label: "Farmer / FPO", desc: "List your produce for direct sale" },
  { value: "consumer", label: "Retail Consumer", desc: "Buy fresh produce directly" },
  { value: "bulk_buyer", label: "Bulk Buyer", desc: "Source large volumes via bidding" },
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
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #f2f9f0 0%, #fdf9f3 50%, #f5ead6 100%)" }}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in" style={{ border: "1px solid #e8d0a3" }}>
        {/* Header with farm image */}
        <div className="relative h-28 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80" alt="Fresh produce" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.6), rgba(30,66,24,0.9))" }} />
          <div className="relative h-full flex flex-col justify-center px-8 text-white">
            <div className="font-extrabold text-xl mb-0.5">Create Your Account</div>
            <p className="text-sm" style={{ color: "#b8e3af" }}>Join the direct farm-to-consumer marketplace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Role selection */}
          <div className="animate-fade-up">
            <p className="text-sm font-bold mb-3" style={{ color: "#2d6324" }}>I am a…</p>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <label key={r.value}
                  className="flex flex-col items-center text-center p-3 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: form.role === r.value ? "#3a7d30" : "#e8d0a3",
                    background: form.role === r.value ? "#f2f9f0" : "#fff"
                  }}
                >
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                    onChange={() => update("role", r.value)} className="sr-only" />
                  <span className="text-xs font-bold mb-0.5" style={{ color: form.role === r.value ? "#2d6324" : "#4f3618" }}>{r.label}</span>
                  <span className="text-[10px] leading-tight" style={{ color: "#8b6330" }}>{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4 animate-fade-up delay-100">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>Full Name</label>
              <input type="text" value={form.name ?? ""} onChange={(e) => update("name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all"
                style={{ borderColor: "#e8d0a3" }}
                onFocus={e => (e.target.style.borderColor = "#3a7d30")}
                onBlur={e => (e.target.style.borderColor = "#e8d0a3")}
                placeholder="Your name" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>Email</label>
              <input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all"
                style={{ borderColor: "#e8d0a3" }}
                onFocus={e => (e.target.style.borderColor = "#3a7d30")}
                onBlur={e => (e.target.style.borderColor = "#e8d0a3")}
                placeholder="you@example.com" required />
            </div>
          </div>

          {/* Password */}
          <div className="animate-fade-up delay-200">
            <label className="block text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>Password</label>
            <input type="password" value={form.password ?? ""} onChange={(e) => update("password", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all"
              style={{ borderColor: "#e8d0a3" }}
              onFocus={e => (e.target.style.borderColor = "#3a7d30")}
              onBlur={e => (e.target.style.borderColor = "#e8d0a3")}
              placeholder="Min. 6 characters" required minLength={6} />
          </div>

          {/* Farmer extras */}
          {form.role === "farmer" && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl animate-scale-in" style={{ background: "#f2f9f0", border: "1px solid #b8e3af" }}>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>Village / District</label>
                <input type="text" value={form.village ?? ""} onChange={(e) => update("village", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none bg-white transition-all"
                  style={{ borderColor: "#b8e3af" }}
                  placeholder="e.g. Nashik" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>Farm size (acres)</label>
                <input type="number" min={0} value={form.farmSizeAcres ?? ""} onChange={(e) => update("farmSizeAcres", Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none bg-white transition-all"
                  style={{ borderColor: "#b8e3af" }} />
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-3 px-4 font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-50 text-sm animate-fade-up delay-300"
            style={{ background: "#2d6324", color: "#fff" }}>
            {submitting ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-sm animate-fade-up delay-400" style={{ color: "#8b6330" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-bold" style={{ color: "#2d6324" }}>Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
