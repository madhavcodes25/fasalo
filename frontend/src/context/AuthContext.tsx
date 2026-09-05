"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import type { Address, UserRole } from "../lib/types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  village?: string;
  farmSizeAcres?: number;
  kycVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  village?: string;
  farmSizeAcres?: number;
  defaultDeliveryAddress?: Address;
}

const TOKEN_KEY = "fasalo_token";
const USER_KEY = "fasalo_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy-init token/user from localStorage (avoids synchronous setState in an effect).
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  });
  const [loading] = useState(false);
  const router = useRouter();

  const persist = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    persist(data.token, data.user);
    router.push("/dashboard");
  };

  const signup = async (data: SignupData) => {
    const res = await api.post<{ token: string; user: User }>("/auth/signup", data);
    persist(res.token, res.user);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
