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
  { glyph: "◈", title: "Bienvenue, opérateur", body: "UnknownX-077 est ton QG cybersécurité : ressources, outils, veille, entraînement et un coffre chiffré. Voici l'essentiel en 30 secondes." },
  { glyph: "▦", title: "Ton tableau de bord", body: "L'accueil regroupe tes épingles, tes pages récentes, les CVE de la semaine et les prochains CTF en direct, puis le plan complet du site." },
  { glyph: "☰", title: "Cinq rubriques", body: "Apprendre (plateformes, ressources, mémento), Outils (toolkit, playground, scripts), Pratique (lab, write-ups, progression), Veille (CVE, actu, agenda) et Communauté." },
  { glyph: "★", title: "Épingle ce que tu utilises", body: "Une étoile apparaît à côté du titre des pages, des ressources, des outils et des plateformes. Tout ce que tu épingles remonte sur le dashboard et dans la recherche." },
  { glyph: "⌨", title: "Va plus vite au clavier", body: "Ctrl+K ou / pour chercher, g puis une lettre pour changer de page (g k = Toolkit, g v = Veille…), et ? pour afficher tous les raccourcis." },
  { glyph: "🔒", title: "Vault — zone classifiée", body: "Ton coffre chiffré (AES-256) côté client. Mots de passe, clés, notes sensibles — protégés par un mot de passe maître, jamais stockés en clair." },
  { glyph: "◐", title: "Règle l'affichage", body: "Le bouton Affichage de la barre du haut permet de changer de fond d'écran ou de passer en mode léger si ta machine rame." },
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
        className="menu-surface relative w-full max-w-md overflow-hidden rounded-3xl p-7"
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
