"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type SignupData } from "../../context/AuthContext";
import type { UserRole } from "../../lib/types";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "farmer", label: "Farmer / FPO", desc: "List produce for sale" },
  { value: "consumer", label: "Retail Consumer", desc: "Buy fresh produce directly" },
  { value: "bulk_buyer", label: "Bulk Buyer", desc: "Bid on large-volume orders" },
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow ring-1 ring-black/5"
      >
        <h1 className="text-2xl font-bold text-emerald-700">Fasalo — Sign Up</h1>
        <p className="mt-1 text-sm text-zinc-500">Create your account.</p>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Name</label>
              <input
                type="text"
                value={form.name ?? ""}
                onChange={(e) => update("name", e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Password</label>
            <input
              type="password"
              value={form.password ?? ""}
              onChange={(e) => update("password", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              required
              minLength={6}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-zinc-700">I am a…</legend>
            {ROLES.map((r) => (
              <label key={r.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={() => update("role", r.value)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm">
                  <span className="font-medium text-zinc-800">{r.label}</span>
                  <span className="text-xs text-zinc-500"> — {r.desc}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {form.role === "farmer" && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Village</label>
                <input
                  type="text"
                  value={form.village ?? ""}
                  onChange={(e) => update("village", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  placeholder="e.g. Ludhiana"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Farm size (acres)</label>
                <input
                  type="number"
                  min={0}
                  value={form.farmSizeAcres ?? ""}
                  onChange={(e) => update("farmSizeAcres", Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-emerald-700 hover:underline">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
