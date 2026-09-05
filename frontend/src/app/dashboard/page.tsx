"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * Role-aware landing page. Redirects farmers/FPOs to /farmer and
 * consumers/bulk buyers to /browse once authenticated.
 */
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user) {
      router.replace(user.role === "farmer" || user.role === "fpo" ? "/farmer" : "/browse");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading your dashboard…</p>
      </main>
    );
  }

  return null;
}
