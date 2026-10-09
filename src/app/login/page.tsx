"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { XLogo } from "@/components/XLogo";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { LoginTransition } from "@/components/LoginTransition";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { usePerf } from "@/lib/perf";

const FEATURES = [
  { k: "RES", t: "Ressources & arsenal", d: "Cheatsheets, outils et scripts classés par phase." },
  { k: "INT", t: "Veille temps réel", d: "Flux CVE NVD, actu cyber et carte des attaques." },
  { k: "VLT", t: "Coffre chiffré", d: "AES-256-GCM côté client, rien en clair sur le serveur." },
];

export default function LoginPage() {
  const { user, ready, loginWithCredentials } = useAuth();
  const router = useRouter();
  const { push } = useToast();
  const { lite } = usePerf();
  const reduce = useReducedMotion();
  // Mode rapide (lite / prefers-reduced-motion) : aucune animation d'entrée.
  // Le formulaire s'affiche tout de suite : plus de fausse séquence « ssh »
  // qui imposait ~1,5 s d'attente avant de pouvoir se connecter.
  const isFastMode = lite || Boolean(reduce);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "github" | "google" | "credentials">(null);
  const [transition, setTransition] = useState<string | null>(null);

  useEffect(() => {
    // Si déjà connecté et qu'on n'est pas en pleine séquence, on file au dashboard.
    if (ready && user && !transition && !busy) router.replace("/");
  }, [ready, user, router, transition, busy]);

  // Affiche les erreurs OAuth renvoyées par le callback (?error=…).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (!err) return;
    const provider = params.get("provider") ?? "";
    const messages: Record<string, string> = {
      oauth_not_configured: `Connexion ${provider || "OAuth"} pas encore configurée (identifiants manquants côté serveur).`,
      bad_state: "Échec de sécurité OAuth (state invalide). Réessaie.",
      oauth_denied: "Connexion annulée.",
      oauth_failed: "Impossible de récupérer ton profil. Réessaie.",
      not_allowed: "Ce compte n'est pas autorisé à se connecter.",
    };
    push("err", messages[err] ?? "Échec de la connexion.");
    window.history.replaceState({}, "", "/login");
  }, [push]);

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

  const handleProvider = (provider: "github" | "google") => {
    // Redirection plein écran vers le flux OAuth serveur (/api/auth/oauth/…).
    setBusy(provider);
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  if (transition) {
    return <LoginTransition username={transition} onComplete={() => router.replace("/")} />;
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: isFastMode ? 0 : 0.07 } },
  };
  const rise: Variants = {
    hidden: isFastMode ? { opacity: 1 } : { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: isFastMode ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <main className="relative grid min-h-screen place-items-center p-4 sm:p-8">
      <motion.div
        className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Présentation (desktop) */}
        <div className="hidden lg:block">
          <motion.div variants={rise} className="mb-8 flex items-center gap-3">
            <XLogo size={52} />
            <div>
              <div className="font-display text-xl font-bold text-ink-strong">
                UnknownX<span className="text-gradient-primary">-077</span>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Secure vault</div>
            </div>
          </motion.div>
          <motion.h1 variants={rise} className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
            <span className="text-gradient-soft">Ton QG</span>{" "}
            <span className="text-gradient-primary">cybersécurité</span>
            <span className="text-gradient-soft">, au même endroit.</span>
          </motion.h1>
          <motion.p variants={rise} className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
            Ressources, outils offensifs, veille et coffre chiffré — un espace privé, rapide et pensé pour le terrain.
          </motion.p>
          <motion.ul variants={container} className="mt-9 space-y-3">
            {FEATURES.map((f) => (
              <motion.li key={f.k} variants={rise} className="flex items-start gap-4">
                <span className="icon-tile h-10 w-10 shrink-0 font-mono text-[10px] font-semibold">{f.k}</span>
                <span>
                  <span className="block text-sm font-semibold text-ink-strong">{f.t}</span>
                  <span className="block text-sm text-muted">{f.d}</span>
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Carte de connexion */}
        <motion.div variants={rise} className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <XLogo size={56} />
            <div className="mt-3 font-display text-2xl font-bold text-ink-strong">
              UnknownX<span className="text-gradient-primary">-077</span>
            </div>
          </div>

          <div className="glass relative overflow-hidden rounded-3xl p-7">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
            <h2 className="font-display text-2xl font-bold text-ink-strong">Connexion</h2>
            <p className="mt-1 text-sm text-muted">Identification requise pour accéder au coffre.</p>

            {/* OAuth */}
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button onClick={() => handleProvider("github")} disabled={busy !== null} className="btn btn-ghost w-full">
                <GithubIcon />
                {busy === "github" ? "…" : "GitHub"}
              </button>
              <button onClick={() => handleProvider("google")} disabled={busy !== null} className="btn btn-ghost w-full">
                <GoogleIcon />
                {busy === "google" ? "…" : "Google"}
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-white/[0.08]" />
              ou par email
              <span className="h-px flex-1 bg-white/[0.08]" />
            </div>

            {/* Credentials admin */}
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field !font-sans"
                  placeholder="operateur@exemple.fr"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field !font-sans"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" disabled={busy !== null} className="btn btn-primary w-full !py-3">
                {busy === "credentials" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Vérification…
                  </>
                ) : (
                  <>Accéder au coffre →</>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted">Espace personnel — accès réservé à l&apos;opérateur.</p>
        </motion.div>
      </motion.div>
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
