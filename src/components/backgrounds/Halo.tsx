"use client";

/*
 * Fond « Halo » (défaut) — lueurs néon qui dérivent lentement, grille fine
 * et grain. Les halos sont des dégradés radiaux (déjà doux, pas de filtre
 * blur) animés en transform → le GPU compose, le CPU ne fait rien.
 */

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { usePerf } from "@/lib/perf";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

type Blob = CSSProperties & Record<`--${string}`, string>;

const BLOBS: Blob[] = [
  {
    top: "-24vmax",
    left: "-16vmax",
    width: "64vmax",
    height: "64vmax",
    background:
      "radial-gradient(closest-side, rgba(123,92,240,0.34), rgba(123,92,240,0.1) 55%, transparent)",
    "--blob-x": "9vw",
    "--blob-y": "7vh",
    "--blob-dur": "44s",
  },
  {
    bottom: "-28vmax",
    right: "-20vmax",
    width: "68vmax",
    height: "68vmax",
    background:
      "radial-gradient(closest-side, rgba(0,245,212,0.2), rgba(0,245,212,0.06) 55%, transparent)",
    "--blob-x": "-8vw",
    "--blob-y": "-6vh",
    "--blob-dur": "52s",
    "--blob-delay": "-14s",
  },
  {
    top: "26%",
    left: "42%",
    width: "40vmax",
    height: "40vmax",
    background: "radial-gradient(closest-side, rgba(255,61,140,0.11), transparent)",
    "--blob-x": "-11vw",
    "--blob-y": "9vh",
    "--blob-dur": "38s",
    "--blob-delay": "-22s",
  },
];

const fade = "radial-gradient(ellipse 75% 60% at 50% 0%, #000 25%, transparent 78%)";

/*
 * Parallaxe au curseur : --px/--py (-1 → 1) sont posées sur le conteneur du
 * fond SEULEMENT (pas sur :root, qui ferait recalculer tout le document),
 * au plus une fois par frame ; les calques glissent avec une transition
 * douce. Coupé en lite, reduced-motion et sur écran tactile.
 */
function useParallax(ref: RefObject<HTMLDivElement>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      x = (e.clientX / window.innerWidth) * 2 - 1;
      y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ref, enabled]);
}

const layer = (depth: number): CSSProperties => ({
  transform: `translate3d(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth * 0.7}px), 0)`,
  transition: "transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
  willChange: "transform",
});

export function Halo() {
  const ref = useRef<HTMLDivElement>(null);
  const { lite } = usePerf();
  useParallax(ref, !lite);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-base">
      <div className="absolute -inset-12" style={layer(26)}>
        {BLOBS.map((style, i) => (
          <div key={i} className="bg-blob" style={style} />
        ))}
      </div>
      <div className="absolute -inset-6 bg-grid" style={{ maskImage: fade, WebkitMaskImage: fade, ...layer(10) }} />
      <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: NOISE }} />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 35%, transparent 45%, rgba(3,3,8,0.7) 100%)" }}
      />
    </div>
  );
}
