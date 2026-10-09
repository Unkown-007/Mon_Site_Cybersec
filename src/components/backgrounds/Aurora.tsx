/*
 * Fond « Aurora » — voiles colorés allongés qui ondulent lentement.
 * 100 % CSS : ellipses en dégradé radial (aucun filtre blur, qui coûtait
 * très cher en GPU), animées en transform. Figé en lite / reduced-motion.
 */

import type { CSSProperties } from "react";

type Veil = { wrap: CSSProperties; blob: CSSProperties & Record<`--${string}`, string> };

const VEILS: Veil[] = [
  {
    wrap: { top: "-8%", left: "-25%", width: "150vw", height: "55vh", transform: "rotate(-8deg)" },
    blob: {
      inset: 0,
      background: "radial-gradient(closest-side, rgba(0,245,212,0.24), rgba(0,245,212,0.06) 60%, transparent)",
      "--blob-x": "8vw",
      "--blob-y": "5vh",
      "--blob-dur": "30s",
    },
  },
  {
    wrap: { top: "18%", left: "-10%", width: "130vw", height: "50vh", transform: "rotate(6deg)" },
    blob: {
      inset: 0,
      background: "radial-gradient(closest-side, rgba(123,92,240,0.3), rgba(123,92,240,0.08) 60%, transparent)",
      "--blob-x": "-10vw",
      "--blob-y": "4vh",
      "--blob-dur": "36s",
      "--blob-delay": "-9s",
    },
  },
  {
    wrap: { bottom: "-20%", left: "10%", width: "110vw", height: "55vh", transform: "rotate(-4deg)" },
    blob: {
      inset: 0,
      background: "radial-gradient(closest-side, rgba(255,61,96,0.14), transparent)",
      "--blob-x": "6vw",
      "--blob-y": "-6vh",
      "--blob-dur": "42s",
      "--blob-delay": "-18s",
    },
  },
];

export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "#06060b" }}>
      {VEILS.map((v, i) => (
        <div key={i} className="absolute" style={v.wrap}>
          <div className="bg-blob" style={v.blob} />
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(3,3,8,0.75) 100%)" }}
      />
    </div>
  );
}
