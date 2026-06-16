"use client";

/*
 * Auth client — branchée sur le VRAI backend de session (routes /api/auth/*).
 * La vérification des identifiants et la session se font côté serveur ; ici on
 * ne fait qu'interroger /api/auth/me, /login et /logout. L'interface publique
 * (useAuth) reste identique pour ne rien casser dans les composants.
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
  since: number;
}

interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Exclude<Provider, "credentials">) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  // Récupère la session courante depuis le cookie httpOnly (côté serveur).
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user: SessionUser | null }) => {
        if (alive) setUser(d.user ?? null);
      })
      .catch(() => {
        if (alive) setUser(null);
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Accès refusé.");
    }
    const d = (await res.json()) as { user: SessionUser };
    setUser(d.user);
  }, []);

  // OAuth non configuré : on n'autorise plus de fausse connexion.
  const loginWithProvider = useCallback(async () => {
    throw new Error("Connexion OAuth non configurée — utilise email + mot de passe.");
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

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
