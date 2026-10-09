"use client";

import { useEffect } from "react";
import { usePerf } from "@/lib/perf";

const SELECTOR = ".card, .hud-panel";

/*
 * Effet « verre » : un seul écouteur pointermove (passif, 1 mise à jour par
 * frame max) pose --mx/--my sur la carte survolée uniquement → halo intérieur
 * et liseré qui s'illumine près du curseur (cf. .card dans globals.css).
 * Rien ne tourne quand la souris ne bouge pas. Coupé en lite, en
 * reduced-motion et sur écran tactile.
 */
export function PointerGlow() {
  const { lite } = usePerf();

  useEffect(() => {
    if (lite) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current: HTMLElement | null = null;
    let target: Element | null = null;
    let x = 0;
    let y = 0;
    let raf = 0;

    const clear = () => {
      current?.style.removeProperty("--mx");
      current?.style.removeProperty("--my");
      current = null;
    };

    const apply = () => {
      raf = 0;
      const el = target?.closest<HTMLElement>(SELECTOR) ?? null;
      if (el !== current) clear();
      if (!el) return;
      current = el;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${x - r.left}px`);
      el.style.setProperty("--my", `${y - r.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      target = e.target as Element | null;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", clear);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", clear);
      clear();
    };
  }, [lite]);

  return null;
}
