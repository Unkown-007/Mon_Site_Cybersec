"use client";

/*
 * Fond "Matrix" persistant — pluie de glyphes verts (ambiance hacker / Kali).
 * Respecte le mode lite (masqué) et prefers-reduced-motion (image figée).
 */

import { useEffect, useRef } from "react";
import { usePerf } from "@/lib/perf";

export function MatrixRain() {
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
      cols = 0;
    let drops: number[] = [];
    const font = 16;
    const glyphs = "アァカサタナハマヤラ0123456789ABCDEF<>=/\\".split("");

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(w / font));
      drops = Array.from({ length: cols }, () => Math.random() * h);
    };

    const frame = () => {
      ctx.fillStyle = "rgba(2,8,4,0.10)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${font}px 'Share Tech Mono', monospace`;
      for (let i = 0; i < cols; i++) {
        const g = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * font;
        const y = drops[i];
        ctx.fillStyle = Math.random() > 0.975 ? "#c8ffd8" : "#00ff66";
        ctx.fillText(g, x, y);
        drops[i] = y > h && Math.random() > 0.975 ? 0 : y + font;
      }
    };

    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      for (let k = 0; k < 30; k++) frame(); // image dense figée
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => resize();
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [lite]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ display: lite ? "none" : undefined }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.5]"
    />
  );
}
