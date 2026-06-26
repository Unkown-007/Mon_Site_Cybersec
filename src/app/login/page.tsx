"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HexLogo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { LoginTransition } from "@/components/LoginTransition";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePerf } from "@/lib/perf";

const LOGS = [
  { text: "establishing handshake to gatekeeper...", delay: 200 },
  { text: "connection secure. node-077 identified.", delay: 400 },
  { text: "fetching identity provider rulesets... ready.", delay: 300 },
  { text: "loading authentication interface...", delay: 200 },
];

export default function LoginPage() {
  const { user, ready, loginWithCredentials } = useAuth();
  const router = useRouter();
  const { push } = useToast();
  const { lite } = usePerf();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "github" | "google" | "credentials">(null);
  const [transition, setTransition] = useState<string | null>(null);

  // Animation and typing states
  const [reducedMotion, setReducedMotion] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [logIndex, setLogIndex] = useState(0);

  // Check reduced motion preference
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const isFastMode = lite || reducedMotion;

  // Auto-skip typing on fast mode (lite/reduced motion)
  useEffect(() => {
    if (isFastMode) {
      setTypingComplete(true);
    }
  }, [isFastMode]);

  // Handle typing sequence for terminal logs
  useEffect(() => {
    if (isFastMode || typingComplete) return;

    if (logIndex >= LOGS.length) {
      const t = setTimeout(() => setTypingComplete(true), 400);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setLogIndex((prev) => prev + 1);
    }, LOGS[logIndex].delay);

    return () => clearTimeout(t);
  }, [logIndex, isFastMode, typingComplete]);

  // Handle ESC or Enter key to skip typing animation
  useEffect(() => {
    if (isFastMode || typingComplete) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        setTypingComplete(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFastMode, typingComplete]);

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
    return (
      <LoginTransition
        username={transition}
        onComplete={() => router.replace("/")}
      />
    );
  }

  // Variants for Framer Motion entrance animations
  const pageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 },
    },
  };

  return (
    <motion.main
      className="relative min-h-screen overflow-hidden bg-base/40 bg-diagonal hud-scanlines flex flex-col items-center justify-center p-4"
      initial={isFastMode ? undefined : "hidden"}
      animate={isFastMode ? undefined : "visible"}
      variants={pageVariants}
    >
      {/* En-tête */}
      <motion.div
        className="flex flex-col items-center mb-8"
        variants={isFastMode ? undefined : cardVariants}
      >
        <div className="mb-3">
          <HexLogo size={48} />
        </div>
        <h1 className="font-display font-bold text-2xl tracking-[2px] text-ink">
          UnknownX<span className="text-primary">-077</span>
        </h1>
        <p className="label mt-3 text-secondary">IDENTIFICATION REQUISE</p>
      </motion.div>

      {/* Encart de connexion */}
      <motion.div
        className="card w-full max-w-sm p-7 relative"
        style={{ borderColor: "rgba(123,92,240,0.5)", boxShadow: "0 0 40px -18px #7b5cf0" }}
        variants={isFastMode ? undefined : cardVariants}
      >
        {/* coins HUD */}
        <span aria-hidden className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-secondary/70" />
        <span aria-hidden className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-secondary/70" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-secondary/70" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-secondary/70" />

        <AnimatePresence mode="wait">
          {!typingComplete ? (
            <motion.div
              key="terminal"
              className="font-mono text-xs text-success h-[260px] flex flex-col justify-between"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <div className="text-secondary flex items-center">
                  <span>root@unknownx:~$</span>
                  <span className="text-ink ml-2">ssh operator@gatekeeper</span>
                </div>
                {LOGS.slice(0, logIndex).map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-secondary">&gt;</span>
                    <span>{log.text}</span>
                  </div>
                ))}
                {logIndex < LOGS.length && (
                  <div className="flex gap-2 text-secondary animate-pulse">
                    <span>&gt;</span>
                    <span>{LOGS[logIndex].text}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-line-subtle text-[10px] text-muted">
                <div className="flex items-center">
                  <span>TTY1_INIT</span>
                  <span className="cursor ml-1" />
                </div>
                <button
                  type="button"
                  onClick={() => setTypingComplete(true)}
                  className="hover:text-secondary underline cursor-pointer"
                >
                  [ PASSER ]
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={isFastMode ? undefined : formVariants}
              initial={isFastMode ? undefined : "hidden"}
              animate={isFastMode ? undefined : "visible"}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p
        className="mt-6 max-w-sm text-center text-xs text-muted font-mono leading-relaxed"
        variants={isFastMode ? undefined : cardVariants}
      >
        Espace personnel — accès réservé à l&apos;opérateur.
      </motion.p>
    </motion.main>
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
