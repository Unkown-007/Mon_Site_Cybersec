"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePerf } from "@/lib/perf";
import { XLogo } from "@/components/XLogo";

/*
 * Transition post-connexion (~1 s) : le logo apparaît, une coche se trace,
 * « Accès autorisé », puis le voile s'efface vers le dashboard.
 * Marque la session comme « bootée » : l'écran de démarrage ne se rejoue pas
 * juste derrière. Immédiat en lite / prefers-reduced-motion.
 */
export function LoginTransition({
  username,
  onComplete,
}: {
  username: string;
  onComplete: () => void;
}) {
  const { lite } = usePerf();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(onComplete);
  done.current = onComplete;

  useEffect(() => {
    try {
      sessionStorage.setItem("ux077:booted", "1");
    } catch {
      /* ignore */
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reduced) {
      done.current();
      return;
    }
    const t1 = setTimeout(() => setLeaving(true), 820);
    const t2 = setTimeout(() => done.current(), 1120);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [lite]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-base/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: leaving ? 0.3 : 0.2 }}
    >
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ scale: 0.92, y: 8 }}
        animate={{ scale: leaving ? 1.06 : 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <div className="relative">
          <XLogo size={84} />
          <motion.span
            className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full border-4 border-base bg-success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 520, damping: 18 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06060b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              />
            </svg>
          </motion.span>
        </div>
        <motion.div
          className="mt-7 font-display text-2xl font-bold text-ink-strong"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          Accès autorisé
        </motion.div>
        <motion.div
          className="mt-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          Bienvenue, {username}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
