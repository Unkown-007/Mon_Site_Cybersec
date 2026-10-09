"use client";

/*
 * Fond « Nébuleuse » — étoiles scintillantes sur halos de nébuleuse.
 * Les nébuleuses sont en CSS (statiques) ; le canvas ne dessine que les
 * étoiles, en résolution 1x et à ~20 FPS (amplement suffisant pour un
 * scintillement). Masqué en lite, image figée en reduced-motion.
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

    let raf = 0;
    let w = 0;
    let h = 0;
    let t = 0;
    let stars: { x: number; y: number; z: number; r: number }[] = [];

    const resize = () => {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
      stars = Array.from({ length: Math.min(320, Math.floor((w * h) / 6000)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        r: Math.random() * 1.3 + 0.4,
      }));
    };

    const frame = () => {
      t += 0.004;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#c8d2ff";
      for (const s of stars) {
        ctx.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(t * 6 * s.z + s.x))) * s.z;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;
    };

    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 50) return;
      last = now;
      frame();
    };

    resize();
    frame();
    if (!reduced) raf = requestAnimationFrame(loop);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        resize();
        frame();
      }, 200);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [lite]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(circle at 25% 30%, rgba(123,92,240,0.16), transparent 45%), radial-gradient(circle at 80% 72%, rgba(0,245,212,0.1), transparent 45%), radial-gradient(circle at 60% 12%, rgba(255,61,96,0.08), transparent 35%), #05050c",
      }}
    >
      <canvas ref={ref} className="h-full w-full" style={{ display: lite ? "none" : undefined }} />
    </div>
  );
}
