"use client";

/*
 * Fond "Nébuleuse" — champ d'étoiles scintillantes + halos de nébuleuse.
 * Respecte le mode lite (masqué) et prefers-reduced-motion (image figée).
 */

import { useEffect, useRef } from "react";
import { usePerf } from "@/lib/perf";

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { lite } = usePerf();

  useEffect(() => {
    if (lite) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0,
      w = 0,
      h = 0,
      dpr = 1,
      t = 0;
    let stars: { x: number; y: number; z: number; r: number }[] = [];
    let neb: { x: number; y: number; r: number; c: string }[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.floor((w * h) / 5500) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        r: Math.random() * 1.3 + 0.2,
      }));
      const M = Math.max(w, h);
      neb = [
        { x: w * 0.25, y: h * 0.3, r: M * 0.42, c: "123,92,240" },
        { x: w * 0.8, y: h * 0.72, r: M * 0.46, c: "0,245,212" },
        { x: w * 0.6, y: h * 0.12, r: M * 0.34, c: "255,61,96" },
      ];
    };

    const frame = () => {
      t += 0.003;
      ctx.fillStyle = "#05050c";
      ctx.fillRect(0, 0, w, h);
      for (const n of neb) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.c},0.10)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      }
      for (const s of stars) {
        const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 6 * s.z + s.x));
        ctx.fillStyle = `rgba(200,210,255,${a * s.z})`;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
    };

    let lastT = 0;
    const loop = (now = 0) => {
      raf = requestAnimationFrame(loop);
      if (now - lastT < 33) return; // ~30 FPS
      lastT = now;
      frame();
    };

    resize();
    if (reduced) frame();
    else raf = requestAnimationFrame(loop);

    const onR = () => resize();
    window.addEventListener("resize", onR);
    const onV = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onV);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onR);
      document.removeEventListener("visibilitychange", onV);
    };
  }, [lite]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ display: lite ? "none" : undefined }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
