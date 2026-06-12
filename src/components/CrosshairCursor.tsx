"use client";

import { useEffect, useRef, useState } from "react";
import { usePerf } from "@/lib/perf";

/*
 * Curseur viseur cyberpunk : un point central qui suit le pointeur au pixel
 * et un anneau qui le rejoint en douceur. Additif (le curseur natif reste),
 * desktop uniquement, sans interception des clics.
 */
export function CrosshairCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const { lite } = usePerf();

  useEffect(() => {
    if (lite) {
      setEnabled(false);
      return;
    }
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    setEnabled(true);

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x}px,${y}px,0)`;
    };
    const down = () => ringRef.current?.classList.add("cursor-ring--down");
    const up = () => ringRef.current?.classList.remove("cursor-ring--down");
    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(raf);
    };
  }, [lite]);

  if (!enabled || lite) return null;

  return (
    <>
      {/* point central (croix) */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[200] -ml-px -mt-px"
      >
        <div className="relative h-0 w-0">
          <span className="absolute -left-2 top-0 h-px w-4 bg-secondary/80" />
          <span className="absolute left-0 -top-2 h-4 w-px bg-secondary/80" />
        </div>
      </div>
      {/* anneau qui suit en douceur */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[200]"
      >
        <div className="h-6 w-6 -ml-3 -mt-3 rounded-full border border-primary/50" />
      </div>
    </>
  );
}
