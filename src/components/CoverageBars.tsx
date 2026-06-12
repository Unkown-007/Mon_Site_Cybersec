"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Barres de couverture dérivées des VRAIES données du coffre.
 * Anime la largeur à l'apparition (IntersectionObserver), reduced-motion safe.
 */

export interface CoverageEntry {
  label: string;
  count: number;
}

export function CoverageBars({
  entries,
  accent = "var(--primary)",
}: {
  entries: CoverageEntry[];
  accent?: string;
}) {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...entries.map((e) => e.count));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-2.5">
      {entries.map((e, i) => (
        <div key={e.label} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3">
          <span className="truncate font-mono text-[11px] uppercase tracking-[1px] text-muted">
            {e.label}
          </span>
          <div className="h-2 w-full overflow-hidden bg-base">
            <div
              className="h-full ease-out"
              style={{
                width: shown ? `${(e.count / max) * 100}%` : "0%",
                background: `linear-gradient(90deg, ${accent}40, ${accent})`,
                boxShadow: `0 0 8px -3px ${accent}`,
                transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
              }}
            />
          </div>
          <span className="text-right font-mono text-xs tabular-nums text-ink">{e.count}</span>
        </div>
      ))}
    </div>
  );
}
