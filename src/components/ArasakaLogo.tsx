"use client";

import { useId } from "react";

/*
 * Emblème façon Arasaka (Cyberpunk 2077) : hexagone + losange central +
 * lignes rayonnantes. Dégradé violet→cyan (ou rouge en variante danger),
 * motif interne en rotation lente (60s) et halo qui respire.
 */
export function ArasakaLogo({
  size = 32,
  danger = false,
}: {
  size?: number;
  danger?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const g = `grad-${id}`;
  const c1 = danger ? "#ff3d60" : "#7b5cf0";
  const c2 = danger ? "#ff7ac4" : "#00f5d4";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>

      {/* halo qui respire */}
      <polygon
        points="50,6 88,28 88,72 50,94 12,72 12,28"
        fill={c1}
        opacity="0.12"
        className="animate-pulse"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* hexagone */}
      <polygon
        points="50,6 88,28 88,72 50,94 12,72 12,28"
        stroke={`url(#${g})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* motif interne en rotation lente */}
      <g
        className="animate-spin origin-center"
        style={{ animationDuration: "60s", transformBox: "fill-box" }}
      >
        {/* lignes rayonnantes vers les sommets */}
        {[
          [50, 6],
          [88, 28],
          [88, 72],
          [50, 94],
          [12, 72],
          [12, 28],
        ].map(([x, y], i) => (
          <line key={i} x1="50" y1="50" x2={x} y2={y} stroke={`url(#${g})`} strokeWidth="1" opacity="0.4" />
        ))}
        {/* losange central */}
        <polygon points="50,26 70,50 50,74 30,50" fill={`url(#${g})`} opacity="0.18" stroke={`url(#${g})`} strokeWidth="2" />
      </g>

      <circle cx="50" cy="50" r="4.5" fill={c2} />
    </svg>
  );
}
