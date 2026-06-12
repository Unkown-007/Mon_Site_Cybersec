"use client";

import { usePerf } from "@/lib/perf";

/*
 * Interrupteur du mode "lite" — bouton flottant discret (haut-droite).
 * Coupe/réactive les effets lourds (fond animé, curseur, scanlines).
 */
export function PerfToggle() {
  const { lite, toggle } = usePerf();

  return (
    <button
      onClick={toggle}
      style={{ position: "fixed", top: "6rem", right: "0.75rem" }}
      className={`z-[60] flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[1px] border backdrop-blur-sm transition-colors ${
        lite
          ? "border-warning/50 text-warning bg-base/80"
          : "border-line-strong text-muted bg-base/60 hover:text-secondary hover:border-secondary/40"
      }`}
      aria-pressed={lite}
      title={lite ? "Effets coupés (mode léger actif)" : "Couper les effets lourds"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${lite ? "bg-warning" : "bg-success"}`} />
      {lite ? "LITE" : "FX"}
    </button>
  );
}
