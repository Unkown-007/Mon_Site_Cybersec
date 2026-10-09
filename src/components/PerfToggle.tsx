"use client";

import { motion } from "framer-motion";
import { usePerf } from "@/lib/perf";

/*
 * Interrupteur du mode « lite » (dans le menu Affichage de la navbar).
 * Coupe fond animé, flous, animations continues et transitions.
 */
export function PerfToggle() {
  const { lite, toggle } = usePerf();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!lite}
      onClick={toggle}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-strong">Effets visuels</span>
        <span className="block text-xs text-muted">
          {lite ? "Mode léger : animations coupées" : "Fond animé et transitions actifs"}
        </span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          lite ? "border-white/10 bg-white/[0.06]" : "border-primary/60 bg-primary/70"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 34 }}
          className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow ${lite ? "left-0.5" : "right-0.5"}`}
        />
      </span>
    </button>
  );
}
