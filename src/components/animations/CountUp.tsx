"use client";

import { useEffect, useRef, useState } from "react";
import { usePerf } from "@/lib/perf";

/** Compteur animé 0 → value (ease-out), avec léger "flicker" pendant la montée. */
export function CountUp({
  value,
  duration = 1200,
  className,
  pad = 2,
}: {
  value: number;
  duration?: number;
  className?: string;
  pad?: number;
}) {
  const [display, setDisplay] = useState("0");
  const raf = useRef<number>(0);
  const { lite } = usePerf();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reducedMotion) {
      setDisplay(String(value).padStart(pad, "0"));
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(value * eased);
      // flicker : caractère aléatoire tant qu'on n'est pas arrivé
      if (p < 1 && Math.random() > 0.6) {
        setDisplay(String(Math.floor(Math.random() * Math.max(value, 9))).padStart(pad, "0"));
      } else {
        setDisplay(String(current).padStart(pad, "0"));
      }
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setDisplay(String(value).padStart(pad, "0"));
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration, pad, lite]);

  return <span className={className}>{display}</span>;
}
