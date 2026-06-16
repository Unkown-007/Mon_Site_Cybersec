"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HexLogo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { LoginTransition } from "@/components/LoginTransition";

export default function LoginPage() {
  const { user, ready, loginWithCredentials, loginWithProvider } = useAuth();
  const router = useRouter();
  const { push } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "github" | "google" | "credentials">(null);
  const [transition, setTransition] = useState<string | null>(null);

  useEffect(() => {
    // Si déjà connecté et qu'on n'est pas en pleine séquence, on file au dashboard.
    if (ready && user && !transition && !busy) router.replace("/");
  }, [ready, user, router, transition, busy]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("credentials");
    try {
      await loginWithCredentials(email, password);
      push("ok", "Accès autorisé — bienvenue.");
      setTransition("ADMIN");
    } catch (err) {
      push("err", err instanceof Error ? err.message : "Accès refusé.");
      setBusy(null);
    }
  };

  const handleProvider = async (provider: "github" | "google") => {
    setBusy(provider);
    try {
      await loginWithProvider(provider);
      push("ok", `Session ${provider} établie.`);
      setTransition(provider === "github" ? "GH_OPERATOR" : "GOOGLE_OPERATOR");
    } catch (err) {
      push("err", err instanceof Error ? err.message : "Fournisseur indisponible.");
      setBusy(null);
    }
  };

  if (transition) {
    return (
      <LoginTransition
        username={transition}
        onComplete={() => router.replace("/")}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-base/40 bg-diagonal hud-scanlines flex flex-col items-center justify-center p-4">
      {/* En-tête */}
      <div className="flex flex-col items-center mb-8 animate-fade-up">
        <div className="mb-3">
          <HexLogo size={48} />
        </div>
        <h1 className="font-display font-bold text-2xl tracking-[2px] text-ink">
          UnknownX<span className="text-primary">-077</span>
        </h1>
        <p className="label mt-3 text-secondary">IDENTIFICATION REQUISE</p>
      </div>

      {/* Encart de connexion */}
      <div
        className="card w-full max-w-sm p-7 animate-fade-up"
        style={{ borderColor: "rgba(123,92,240,0.5)", boxShadow: "0 0 40px -18px #7b5cf0" }}
      >
        {/* coins HUD */}
        <span aria-hidden className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-secondary/70" />
        <span aria-hidden className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-secondary/70" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-secondary/70" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-secondary/70" />

        {/* OAuth */}
        <div className="space-y-3">
          <button
            onClick={() => handleProvider("github")}
            disabled={busy !== null}
            className="btn btn-ghost w-full justify-center disabled:opacity-50"
          >
            <GithubIcon />
            {busy === "github" ? "Connexion…" : "Continuer avec GitHub"}
          </button>
          <button
            onClick={() => handleProvider("google")}
            disabled={busy !== null}
            className="btn btn-ghost w-full justify-center disabled:opacity-50"
          >
            <GoogleIcon />
            {busy === "google" ? "Connexion…" : "Continuer avec Google"}
          </button>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-6">
          <span className="h-px flex-1 bg-line-strong" />
          <span className="label !text-muted">ou</span>
          <span className="h-px flex-1 bg-line-strong" />
        </div>

        {/* Credentials admin */}
        <form onSubmit={handleCredentials} className="space-y-3">
          <div>
            <label htmlFor="email" className="label block mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="admin@unknownx.local"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label block mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy !== null}
            className="btn btn-primary w-full justify-center disabled:opacity-50"
          >
            {busy === "credentials" ? "Vérification…" : "Accéder"}
          </button>
        </form>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs text-muted font-mono leading-relaxed">
        Espace personnel — accès réservé à l&apos;opérateur.
      </p>
    </main>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3 0-5.6-2-6.5-4.8h-4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.5 14.4a7.2 7.2 0 0 1 0-4.6V6.7h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.5 6.7l4 3.1C6.4 6.8 9 4.8 12 4.8Z" />
    </svg>
  );
}
