"use client";

import { useId } from "react";

/*
 * Monogramme « X » de UnknownX-077 : deux barres croisées en dégradé
 * violet→cyan, doublées d'une copie décalée façon glitch et d'un halo qui
 * respire, le tout encadré de coins HUD. Variante « danger » en rouge.
 */
export function XLogo({
  size = 32,
  danger = false,
}: {
  size?: number;
  danger?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const g = `xgrad-${id}`;
  const blur = `xblur-${id}`;
  const c1 = danger ? "#ff3d60" : "#7b5cf0";
  const c2 = danger ? "#ff7ac4" : "#00f5d4";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <filter id={blur} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* halo diffus qui respire */}
      <g filter={`url(#${blur})`} opacity="0.35" className="animate-pulse">
        <path d="M28 28 72 72" stroke={c1} strokeWidth="12" strokeLinecap="round" />
        <path d="M72 28 28 72" stroke={c1} strokeWidth="12" strokeLinecap="round" />
      </g>

      {/* copie décalée façon glitch */}
      <g transform="translate(3 -3)" opacity="0.5" className="animate-flicker">
        <path d="M28 28 72 72" stroke={c2} strokeWidth="9" strokeLinecap="round" />
        <path d="M72 28 28 72" stroke={c2} strokeWidth="9" strokeLinecap="round" />
      </g>

      {/* X principal */}
      <path d="M28 28 72 72" stroke={`url(#${g})`} strokeWidth="11" strokeLinecap="round" />
      <path d="M72 28 28 72" stroke={`url(#${g})`} strokeWidth="11" strokeLinecap="round" />

      {/* nœud central */}
      <circle cx="50" cy="50" r="4" fill={c2} />

      {/* coins HUD */}
      <g stroke={c2} strokeWidth="2.5" opacity="0.65" strokeLinecap="round" fill="none">
        <path d="M10 20 10 10 20 10" />
        <path d="M80 10 90 10 90 20" />
        <path d="M90 80 90 90 80 90" />
        <path d="M20 90 10 90 10 80" />
      </g>
    </svg>
  );
}
