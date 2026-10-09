"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";

/*
 * Tutoriel d'accueil — affiché une seule fois aux nouveaux (persisté en
 * localStorage). Skippable à tout moment. Rejouable via l'évènement
 * window "ux077:show-onboarding".
 */

const KEY = "ux077:onboarded";

const STEPS: { glyph: string; title: string; body: string }[] = [
  { glyph: "◈", title: "Bienvenue, opérateur", body: "UnknownX-077 est ton QG cybersécurité : ressources, outils, veille, entraînement et un espace d'équipe. Voici l'essentiel en 30 secondes." },
  { glyph: "▤", title: "Ton tableau de bord", body: "La page d'accueil regroupe tes stats, tes comptes liés et l'accès rapide aux modules. Le bandeau du haut fait défiler les CVE et l'actu en direct." },
  { glyph: "⚔", title: "Arsenal & utilitaires", body: "Toolkit (outils offensifs), Playground (réseau/regex/conversions), Référence (ports, HTTP, hash) et Arsenal (annuaire d'outils). Tout tourne côté navigateur." },
  { glyph: "🎓", title: "Apprendre", body: "Plateformes d'entraînement (Web, IA/LLM, OSINT, reverse…), une roadmap de certifications et l'agenda des conférences dans la section Apprendre." },
  { glyph: "🔒", title: "Vault — zone classifiée", body: "Ton coffre chiffré (AES-256) côté client. Mots de passe, clés, notes sensibles — protégés par un mot de passe maître, jamais stockés en clair." },
  { glyph: "🛡", title: "Social & équipe", body: "Personnalise ton profil (photo, bio), enregistre tes unlocks, grimpe au leaderboard, ajoute des amis et crée une équipe pour bosser les CTF ensemble." },
  { glyph: "🤖", title: "Assistant IA", body: "Un chat multi-modèles (Claude / ChatGPT / Gemini) avec TA clé, spécialisé cybersécurité. Parfait pour décortiquer une commande ou une CVE." },
];

export function Onboarding() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!ready || !user) return;
    try {
      if (localStorage.getItem(KEY) !== "1") setOpen(true);
    } catch {
      /* ignore */
    }
  }, [ready, user]);

  useEffect(() => {
    const show = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener("ux077:show-onboarding", show);
    return () => window.removeEventListener("ux077:show-onboarding", show);
  }, []);

  const close = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!mounted || !open) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[95] grid place-items-center bg-black/65 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-7"
      >
        <button
          onClick={close}
          className="absolute right-4 top-4 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
        >
          Passer
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="icon-tile mb-5 h-14 w-14 rounded-2xl text-2xl">{s.glyph}</div>
            <span className="label">
              Étape {step + 1}/{STEPS.length}
            </span>
            <h2 className="mt-2 font-display text-h2 font-bold text-ink-strong">{s.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* points de progression */}
        <div className="mt-7 flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Étape ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-7 bg-gradient-to-r from-primary to-secondary" : "w-1.5 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={step === 0}
            className="btn btn-ghost !py-2"
          >
            ← Précédent
          </button>
          {last ? (
            <button onClick={close} className="btn btn-primary !py-2">
              Commencer
            </button>
          ) : (
            <button onClick={() => setStep((v) => v + 1)} className="btn btn-primary !py-2">
              Suivant →
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
