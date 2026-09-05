/**
 * Lightweight API client for the Fasalo frontend.
 *
 * Reads the backend base URL from NEXT_PUBLIC_BACKEND_URL (set in .env.local)
 * and the auth token from localStorage. Throws a normalized Error when the API
 * responds with a non-2xx status so callers can `catch` and surface messages.
 */
export const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:4000";

export type ApiOptions = RequestInit & { skipJson?: boolean };

export async function apiRequest<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("fasalo_token") : null;
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

/** Convenience wrappers */
export const api = {
  get: <T = unknown>(path: string) => apiRequest<T>(path),
  post: <T = unknown>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T = unknown>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
