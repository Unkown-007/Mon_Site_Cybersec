"use client";

import { useId } from "react";

/*
 * Monogramme « X » de UnknownX-077 : tuile arrondie sombre, X en dégradé
 * violet → cyan avec un halo statique (aucune animation en boucle — le flou
 * SVG animé était repeint à chaque frame). `draw` trace le X à l'apparition.
 */
export function XLogo({
  size = 32,
  danger = false,
  draw = false,
}: {
  size?: number;
  danger?: boolean;
  draw?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const g = `xgrad-${id}`;
  const bg = `xbg-${id}`;
  const rim = `xrim-${id}`;
  const blur = `xblur-${id}`;
  const c1 = danger ? "#ff3d60" : "#8c70ff";
  const c2 = danger ? "#ff7ac4" : "#00f5d4";
  const stroke = draw ? "xlogo-draw" : undefined;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1733" />
          <stop offset="100%" stopColor="#0a0a14" />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.7" />
        </linearGradient>
        <filter id={blur} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <rect x="3" y="3" width="94" height="94" rx="26" fill={`url(#${bg})`} />
      <rect x="3" y="3" width="94" height="94" rx="26" stroke={`url(#${rim})`} strokeWidth="2.5" />

      <g filter={`url(#${blur})`} opacity="0.55">
        <path d="M33 33 67 67M67 33 33 67" stroke={c1} strokeWidth="12" strokeLinecap="round" />
      </g>
      <path className={stroke} d="M33 33 67 67" stroke={`url(#${g})`} strokeWidth="10" strokeLinecap="round" pathLength={1} />
      <path
        className={stroke}
        style={draw ? { animationDelay: "0.18s" } : undefined}
        d="M67 33 33 67"
        stroke={`url(#${g})`}
        strokeWidth="10"
        strokeLinecap="round"
        pathLength={1}
      />
      <circle cx="50" cy="50" r="4.5" fill="#fff" opacity="0.92" />
    </svg>
  );
}
