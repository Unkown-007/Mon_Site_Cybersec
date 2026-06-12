"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "scan" | "glitch" | "fragment" | "done";
const FRAGMENTS = 8;

export function LoginTransition({
  username,
  onComplete,
}: {
  username: string;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("scan");
  const [shown, setShown] = useState(0);

  const lines = useMemo(
    () => [
      "[AUTH] Credentials verified...",
      "[SYS]  Loading operator profile...",
      "[UI]   Initialisation de l'interface... OK",
      `[VAULT] Access granted — ${username}`,
    ],
    [username]
  );

  // Étape 1 — scan terminal (~0.5s : 4 lignes × 100ms)
  useEffect(() => {
    if (phase !== "scan") return;
    if (shown >= lines.length) {
      const t = setTimeout(() => setPhase("glitch"), 120);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), 100);
    return () => clearTimeout(t);
  }, [phase, shown, lines.length]);

  // Étape 2 — glitch (0.2s)
  useEffect(() => {
    if (phase !== "glitch") return;
    const t = setTimeout(() => setPhase("fragment"), 200);
    return () => clearTimeout(t);
  }, [phase]);

  // Étape 3 — fragmentation (0.3s) → fin
  useEffect(() => {
    if (phase !== "fragment") return;
    const t = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 320);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-mono">
      {phase !== "fragment" && phase !== "done" && <div className="absolute inset-0 bg-base bg-diagonal" />}

      {phase === "fragment" && (
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
          {Array.from({ length: FRAGMENTS }).map((_, i) => {
            const dirX = (i % 4) - 1.5;
            const dirY = Math.floor(i / 4) - 0.5;
            return (
              <motion.div
                key={i}
                className="bg-base bg-diagonal border border-line/40"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, x: dirX * 240, y: dirY * 260, rotate: dirX * 12 }}
                transition={{ duration: 0.3, delay: i * 0.015, ease: [0.4, 0, 0.2, 1] }}
              />
            );
          })}
        </div>
      )}

      {phase === "scan" && (
        <motion.div
          className="absolute left-0 right-0 h-20 z-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(0,245,212,0.10), rgba(0,245,212,0.18), transparent)",
          }}
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ duration: 0.7, ease: "linear", repeat: Infinity }}
        />
      )}

      {(phase === "scan" || phase === "glitch") && (
        <div className="absolute inset-0 flex items-center justify-center z-20 p-6">
          <div className="w-full max-w-md text-xs sm:text-sm">
            <div className="label text-secondary mb-3">// ÉTABLISSEMENT DE LA SESSION</div>
            {lines.slice(0, shown).map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className={i === lines.length - 1 ? "text-secondary" : "text-success"}
              >
                {l}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {phase === "glitch" && (
          <>
            <motion.div
              className="absolute inset-0 bg-white z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.2, times: [0, 0.4, 1] }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-40"
              style={{ transform: "skewX(-2deg)" }}
            >
              <span
                className="glitch is-glitching font-display font-black text-3xl sm:text-5xl tracking-[3px] text-ink"
                data-text="UnknownX-077"
              >
                UnknownX-077
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
