import type { ReactNode } from "react";

/*
 * Panneau HUD réutilisable — style interface militaire/hacker.
 * Bordure néon, fond flouté, coins en équerre, scanline au survol (animated),
 * bordure pulsante (pulse), variante rouge (danger).
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

function Corner({ at, danger }: { at: "tl" | "tr" | "bl" | "br"; danger?: boolean }) {
  const color = danger ? "border-danger shadow-[0_0_8px_var(--danger)]" : "border-primary shadow-[0_0_8px_var(--primary)]";
  const map: Record<string, string> = {
    tl: "top-0 left-0 border-t border-l",
    tr: "top-0 right-0 border-t border-r",
    bl: "bottom-0 left-0 border-b border-l",
    br: "bottom-0 right-0 border-b border-r",
  };
  return <span aria-hidden className={`pointer-events-none absolute h-2.5 w-2.5 ${color} ${map[at]}`} />;
}

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
      className={`${POS[position]} ${SIZE[size]} ${animated ? "card scan-hover" : "card"} ${
        pulse ? "gui-pulse" : ""
      } overflow-hidden ${className ?? ""}`}
      style={{
        borderColor: danger ? "rgba(255,61,96,0.4)" : "rgba(123,92,240,0.4)",
        background: "rgba(10,10,18,0.65)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <Corner at="tl" danger={danger} />
      <Corner at="tr" danger={danger} />
      <Corner at="bl" danger={danger} />
      <Corner at="br" danger={danger} />
      <div className="px-3 py-2.5">
        <div
          className={`gui-stream label ${danger ? "!text-danger" : "!text-secondary"} pb-1.5 border-b flex items-center justify-between`}
          style={{ borderColor: danger ? "rgba(255,61,96,0.25)" : "rgba(123,92,240,0.25)" }}
        >
          <span>{title}</span>
          <span
            aria-hidden
            className={`holo-flicker h-1.5 w-1.5 rounded-full ${danger ? "bg-danger" : "bg-secondary"}`}
            style={{ boxShadow: `0 0 6px ${danger ? "var(--danger)" : "var(--secondary)"}` }}
          />
        </div>
        <div className="pt-2.5 font-mono text-[11px] leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}
