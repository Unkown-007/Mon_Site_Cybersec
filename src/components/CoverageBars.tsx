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
          <span className="truncate text-label text-muted">{e.label}</span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
            {/* scaleX (GPU) plutôt que width : pas de recalcul de mise en page */}
            <div
              className="h-full origin-left rounded-full"
              style={{
                width: `${(e.count / max) * 100}%`,
                transform: shown ? "scaleX(1)" : "scaleX(0)",
                background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 30%, transparent), ${accent})`,
                transition: `transform 0.9s var(--ease-out-soft) ${i * 60}ms`,
              }}
            />
          </div>
          <span className="text-right font-mono text-body-sm tabular-nums text-ink">{e.count}</span>
        </div>
      ))}
    </div>
  );
}
