"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

/*
 * <SpotlightCard> — carte premium avec spotlight cursor-following.
 * Un gradient radial suit le curseur au survol, créant un effet "lumière"
 * à la Apple Card. Utilise des CSS custom properties pour la perf (pas de
 * re-render React, juste un style.setProperty sur le DOM).
 */

type SpotlightCardProps = {
  className?: string;
  spotlightColor?: string;
  children: ReactNode;
};

export function SpotlightCard({
  className = "",
  spotlightColor = "rgba(123, 92, 240, 0.08)",
  children,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--spot-x", `${x}px`);
    el.style.setProperty("--spot-y", `${y}px`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--spot-x", `-200px`);
    el.style.setProperty("--spot-y", `-200px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`spotlight-card card ${className}`}
      style={
        {
          "--spot-color": spotlightColor,
          "--spot-x": "-200px",
          "--spot-y": "-200px",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
