"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const DEMO_ACCOUNTS = [
  { role: "Farmer", email: "farmer@fasalo.com" },
  { role: "Consumer", email: "consumer@fasalo.com" },
  { role: "Bulk Buyer", email: "bulk@fasalo.com" },
];

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
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #f2f9f0 0%, #fdf9f3 50%, #f5ead6 100%)" }}>
      <div className="w-full max-w-4xl flex bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in" style={{ border: "1px solid #e8d0a3" }}>
        {/* Left panel — farm image */}
        <div className="hidden md:flex flex-col justify-between text-white p-10 w-5/12 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80" alt="Indian farmer" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.7) 0%, rgba(30,66,24,0.9) 100%)" }} />
          <div className="relative">
            <div className="text-2xl font-extrabold mb-1">Fasalo</div>
            <div className="text-sm" style={{ color: "#b8e3af" }}>फसल सीधे आपके पास</div>
          </div>
          <div className="relative">
            <h2 className="text-xl font-bold mb-3">Direct from Farm to Table</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#dff2da" }}>
              No middlemen. No hidden markups. Farmers earn more, consumers pay less — with AI-powered pricing and escrow-backed payments.
            </p>
            <div className="mt-6 space-y-2">
              {["AI price suggestions for fair listing", "Escrow-protected payments", "Real-time shipment tracking", "Live weather advisories"].map((item) => (
                <div key={item} className="text-sm flex items-center gap-2" style={{ color: "#b8e3af" }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#3a7d30" }}>&#10003;</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative text-xs" style={{ color: "#b8e3af" }}>Smart India Hackathon 2026 &bull; Problem 26033</div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-8 md:p-10">
          <div className="mb-8 animate-fade-up">
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#1e4218" }}>Welcome back</h1>
            <p className="text-sm" style={{ color: "#8b6330" }}>Sign in to your Fasalo account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-up delay-100">
              <label className="block text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>Email address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                style={{ borderColor: "#e8d0a3" }}
                onFocus={e => (e.target.style.borderColor = "#3a7d30")}
                onBlur={e => (e.target.style.borderColor = "#e8d0a3")}
                placeholder="you@example.com" required
              />
            </div>
            <div className="animate-fade-up delay-200">
              <label className="block text-sm font-bold mb-1.5" style={{ color: "#2d6324" }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                style={{ borderColor: "#e8d0a3" }}
                onFocus={e => (e.target.style.borderColor = "#3a7d30")}
                onBlur={e => (e.target.style.borderColor = "#e8d0a3")}
                placeholder="secret123" required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-3 px-4 font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:translate-y-0 text-sm animate-fade-up delay-300"
              style={{ background: "#2d6324", color: "#fff" }}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm animate-fade-up delay-400" style={{ color: "#8b6330" }}>
            New to Fasalo?{" "}
            <Link href="/signup" className="font-bold" style={{ color: "#2d6324" }}>Create account</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 animate-fade-up delay-500" style={{ borderTop: "1px solid #e8d0a3" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8b6330" }}>
              Demo accounts — all use password: <code className="px-1 py-0.5 rounded font-mono" style={{ background: "#f5ead6" }}>secret123</code>
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.email} type="button" onClick={() => setEmail(acc.email)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer`}
                  style={{
                    borderColor: email === acc.email ? "#3a7d30" : "#e8d0a3",
                    background: email === acc.email ? "#f2f9f0" : "#fff"
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: "#2d6324" }}>{acc.role}</span>
                  <span className="text-xs font-mono" style={{ color: "#8b6330" }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
