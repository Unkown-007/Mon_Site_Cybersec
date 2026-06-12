"use client";

/*
 * Mock d'authentification — phase actuelle (sans backend).
 * Stocke une session factice dans localStorage. À remplacer par NextAuth
 * (GitHub / Google / credentials) + Supabase quand les credentials seront dispo.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Provider = "github" | "google" | "credentials";

export interface SessionUser {
  email: string;
  name: string;
  role: "admin" | "operator";
  provider: Provider;
  since: number; // timestamp d'ouverture de session (pour `uptime`)
}

interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Exclude<Provider, "credentials">) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "ux077.session";

// Compte admin mock (dev uniquement) — surchargé par .env.local si présent.
const MOCK_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_MOCK_ADMIN_EMAIL ?? "admin@unknownx.local";
const MOCK_ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_MOCK_ADMIN_PASSWORD ?? "akira2077";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: SessionUser | null) => {
    setUser(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      // Simule une latence réseau.
      await new Promise((r) => setTimeout(r, 550));
      if (
        email.trim().toLowerCase() !== MOCK_ADMIN_EMAIL.toLowerCase() ||
        password !== MOCK_ADMIN_PASSWORD
      ) {
        throw new Error("Identifiants invalides.");
      }
      persist({
        email,
        name: "ADMIN",
        role: "admin",
        provider: "credentials",
        since: Date.now(),
      });
    },
    [persist]
  );

  const loginWithProvider = useCallback(
    async (provider: Exclude<Provider, "credentials">) => {
      await new Promise((r) => setTimeout(r, 700));
      persist({
        email: `${provider}.user@unknownx.local`,
        name: provider === "github" ? "GH_OPERATOR" : "GOOGLE_OPERATOR",
        role: "operator",
        provider,
        since: Date.now(),
      });
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <AuthContext.Provider
      value={{ user, ready, loginWithCredentials, loginWithProvider, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
