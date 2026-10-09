"use client";

import { useEffect, useRef, useState } from "react";
import { usePerf } from "@/lib/perf";
import { XLogo } from "@/components/XLogo";

/*
 * Écran de démarrage — joué UNE fois par session de navigation (~1 s) :
 * le X se trace, la barre se remplit (scaleX, GPU) et 4 étapes défilent.
 * Clic, Échap ou Entrée pour passer. Immédiat en lite / reduced-motion.
 * `quiet` : simple logo pendant que la session se vérifie (sans séquence).
 */

const STEPS = [
  "Initialisation du kernel",
  "Montage du coffre /vault",
  "Modules crypto AES-256-GCM",
  "Liaison sécurisée établie",
];
const STEP_MS = 230;

export function BootScreen({ onComplete, quiet = false }: { onComplete?: () => void; quiet?: boolean }) {
  const { lite } = usePerf();
  const [step, setStep] = useState(0);
  const done = useRef(false);

  const finish = useRef(() => {});
  finish.current = () => {
    if (done.current) return;
    done.current = true;
    onComplete?.();
  };

  useEffect(() => {
    if (quiet) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reducedMotion) {
      finish.current();
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= STEPS.length) {
          clearInterval(interval);
          setTimeout(() => finish.current(), 260);
        }
        return Math.min(s + 1, STEPS.length);
      });
    }, STEP_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") finish.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", onKey);
    };
  }, [quiet, lite]);

  return (
    <div
      // en mode quiet, apparition retardée : une vérif de session rapide
      // ne provoque aucun flash à l'écran
      className={`fixed inset-0 z-[90] grid place-items-center bg-base/80 p-6 ${quiet ? "animate-fade-in" : ""}`}
      style={quiet ? { animationDelay: "350ms" } : undefined}
      onClick={quiet ? undefined : () => finish.current()}
      role="status"
      aria-live="polite"
      aria-label="Chargement de UnknownX-077"
    >
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <div className={quiet ? "animate-pulse-slow" : "animate-scale-in"}>
          <XLogo size={76} draw={!quiet} />
        </div>

        {!quiet && (
          <>
            <div className="mt-6 animate-fade-up font-display text-xl font-bold tracking-tight text-ink-strong stagger-2">
              UnknownX<span className="text-gradient-primary">-077</span>
            </div>
            <div className="mt-1 animate-fade-up font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted stagger-3">
              SECURE BOOT SEQUENCE
            </div>

            <div className="mt-7 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="boot-bar h-full w-full origin-left rounded-full bg-gradient-to-r from-primary via-[#a68bff] to-secondary" />
            </div>

            <ul className="mt-5 h-[92px] w-full space-y-1.5 text-left font-mono text-[11.5px]">
              {STEPS.slice(0, Math.max(1, step + 1)).map((s, i) => {
                const ok = i < step;
                return (
                  <li key={s} className="flex animate-fade-up items-center gap-2.5">
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full text-[9px] transition-colors duration-300 ${
                        ok ? "bg-success/15 text-success" : "bg-white/[0.06] text-secondary"
                      }`}
                    >
                      {ok ? "✓" : "•"}
                    </span>
                    <span className={ok ? "text-ink" : "text-muted"}>{s}</span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-3 text-[11px] text-muted/70">Clic ou Échap pour passer</p>
          </>
        )}
      </div>
    </div>
  );
}
