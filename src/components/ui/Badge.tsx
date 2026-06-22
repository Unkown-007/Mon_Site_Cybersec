import type { ReactNode } from "react";

/*
 * <Badge> — étiquette d'état / méta (sévérité, statut, tag, catégorie).
 * Variantes alignées sur les tokens : neutral par défaut, accent (violet),
 * signal (cyan, rare), et les sémantiques danger/warning/success.
 * Taille mono 11px (plancher AA), point d'état optionnel.
 */

type BadgeVariant =
  | "neutral"
  | "accent"
  | "signal"
  | "danger"
  | "warning"
  | "success";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "border-line-strong text-muted",
  accent: "border-primary/50 text-primary",
  signal: "border-secondary/50 text-secondary",
  danger: "border-danger/50 text-danger",
  warning: "border-warning/50 text-warning",
  success: "border-success/50 text-success",
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
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono uppercase leading-none tracking-[0.12em] text-label ${VARIANTS[variant]} ${className}`}
    >
      {dot ? (
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${DOT[variant]}`}
        />
      ) : null}
      {children}
    </span>
  );
}
