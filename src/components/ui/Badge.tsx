import type { ReactNode } from "react";

/*
 * <Badge> — étiquette d'état / méta (sévérité, statut, tag, catégorie).
 * Pilule arrondie teintée : neutral par défaut, accent (violet), signal
 * (cyan, rare) et les sémantiques danger/warning/success.
 */

type BadgeVariant =
  | "neutral"
  | "accent"
  | "signal"
  | "danger"
  | "warning"
  | "success";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-muted",
  accent: "border-primary/30 bg-primary/10 text-[#b9a8ff]",
  signal: "border-secondary/30 bg-secondary/10 text-secondary",
  danger: "border-danger/30 bg-danger/10 text-[#ff8098]",
  warning: "border-warning/30 bg-warning/10 text-warning",
  success: "border-success/30 bg-success/10 text-success",
};

const DOT: Record<BadgeVariant, string> = {
  neutral: "bg-muted",
  accent: "bg-primary",
  signal: "bg-secondary",
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
};

type BadgeProps = {
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  children: ReactNode;
};

export function Badge({
  variant = "neutral",
  dot = false,
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em] ${VARIANTS[variant]} ${className}`}
    >
      {dot ? <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOT[variant]}`} /> : null}
      {children}
    </span>
  );
}
