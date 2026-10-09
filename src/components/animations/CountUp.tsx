"use client";

import { useEffect, useRef } from "react";
import { usePerf } from "@/lib/perf";

/**
 * Compteur animé 0 → value (ease-out expo). Écrit directement dans le DOM :
 * aucun re-render React par frame. Valeur finale immédiate en lite /
 * reduced-motion.
 */
export function CountUp({
  value,
  duration = 1400,
  className,
  pad = 2,
}: {
  value: number;
  duration?: number;
  className?: string;
  pad?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { lite } = usePerf();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (n: number) => String(n).padStart(pad, "0");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reducedMotion) {
      el.textContent = fmt(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, pad, lite]);

  return (
    <span ref={ref} className={className}>
      {String(0).padStart(pad, "0")}
    </span>
  );
}
