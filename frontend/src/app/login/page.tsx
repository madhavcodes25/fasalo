"use client";

import { useState } from "react";
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
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow ring-1 ring-black/5"
      >
        <h1 className="text-2xl font-bold text-emerald-700">Fasalo — Login</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter your credentials to continue.</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-500">
          New to Fasalo?{" "}
          <a href="/signup" className="font-medium text-emerald-700 hover:underline">
            Create an account
          </a>
        </p>

        <div className="mt-5 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
          <p className="font-semibold text-zinc-700">Demo accounts (password: secret123)</p>
          <p>• Farmer: farmer@fasalo.com</p>
          <p>• Consumer: consumer@fasalo.com</p>
          <p>• Bulk buyer: bulk@fasalo.com</p>
        </div>
      </form>
    </main>
  );
}
