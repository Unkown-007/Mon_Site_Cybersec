import type { ReactNode } from "react";

/*
 * Petit panneau d'info (carte compacte) : en-tête étiqueté + pastille
 * d'état, liseré dégradé au survol. Variante rouge (danger).
 * Plus de flou d'arrière-plan ni de bruit SVG : opaque et léger.
 */

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "inline";
type Size = "sm" | "md" | "lg";

const POS: Record<Position, string> = {
  "top-left": "absolute top-4 left-4",
  "top-right": "absolute top-4 right-4",
  "bottom-left": "absolute bottom-4 left-4",
  "bottom-right": "absolute bottom-4 right-4",
  inline: "relative",
};
const SIZE: Record<Size, string> = { sm: "w-48", md: "w-60", lg: "w-80" };

export function GUIPanel({
  title,
  position = "inline",
  size = "sm",
  animated,
  pulse,
  danger,
  className,
  children,
}: {
  title: string;
  position?: Position;
  size?: Size;
  animated?: boolean;
  pulse?: boolean;
  danger?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`card ${POS[position]} ${SIZE[size]} overflow-hidden ${
        danger ? "!border-danger/30" : ""
      } ${pulse ? "hover-lift" : ""} ${className ?? ""}`}
    >
      <div className="px-3.5 py-3">
        <div
          className={`${animated ? "gui-stream" : ""} flex items-center justify-between border-b border-white/[0.06] pb-2`}
        >
          <span className={`font-mono text-[10.5px] uppercase tracking-[0.14em] ${danger ? "text-danger" : "text-muted"}`}>
            {title}
          </span>
          <span
            aria-hidden
            className={`live-dot h-1.5 w-1.5 rounded-full ${danger ? "bg-danger" : "bg-secondary"}`}
          />
        </div>
        <div className="pt-2.5 font-mono text-[11px] leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}
