"use client";

import { useEffect, useRef } from "react";

/** Pluie "matrix" plein écran, jouée ~10s puis onDone(). */
export function MatrixOverlay({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = Math.floor(innerWidth * dpr));
    const h = (canvas.height = Math.floor(innerHeight * dpr));
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.scale(dpr, dpr);

    const cw = innerWidth;
    const ch = innerHeight;
    const font = 16;
    const cols = Math.floor(cw / font);
    const drops = Array.from({ length: cols }, () => Math.random() * -ch);
    const glyphs = "アァカサタナハマヤラ0123456789ABCDEF".split("");

    const draw = () => {
      ctx.fillStyle = "rgba(7,7,15,0.12)";
      ctx.fillRect(0, 0, cw, ch);
      ctx.font = `${font}px 'Share Tech Mono', monospace`;
      for (let i = 0; i < cols; i++) {
        const ch2 = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * font;
        const y = drops[i];
        ctx.fillStyle = Math.random() > 0.97 ? "#00f5d4" : "#7b5cf0";
        ctx.fillText(ch2, x, y);
        drops[i] = y > ch && Math.random() > 0.975 ? 0 : y + font;
      }
      raf = requestAnimationFrame(draw);
    };
    void w;
    void h;
    raf = requestAnimationFrame(draw);

    const timer = setTimeout(onDone, 10000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[90] bg-base">
      <canvas ref={canvasRef} aria-hidden="true" />
      <button
        onClick={onDone}
        className="absolute top-4 right-4 btn btn-ghost !py-1.5 !px-3 text-xs z-10"
      >
        [ESC] sortir
      </button>
    </div>
  );
}
