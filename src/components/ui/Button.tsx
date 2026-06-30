import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

/*
 * <Button> — primitive d'action.
 *   • primary : violet STRUCTUREL, action standard.
 *   • signal  : cyan SIGNAL RARE, réservé au CTA focal (1 par vue) — seul à glow.
 *   • ghost   : neutre.
 *   • danger  : sémantique destructeur / erreur.
 * Rendu <a> (Next Link) si `href` fourni, sinon <button>. Focus-ring accessible,
 * transitions ciblées (pas de transition-all), états hover/focus/active propres.
 */

type Variant = "primary" | "signal" | "ghost" | "danger";
type Size = "sm" | "md";

const BASE =
  "relative overflow-hidden inline-flex items-center justify-center gap-2 clip-chamfer-sm border font-mono uppercase " +
  "tracking-[0.12em] select-none transition-[color,background-color,border-color,filter,transform] " +
  "duration-fast ease-out-soft active:translate-y-px disabled:opacity-40 disabled:pointer-events-none";

const SIZES: Record<Size, string> = {
  sm: "text-label px-3 py-2",
  md: "text-xs px-5 py-3",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "btn-primary focus-ring border-primary/70 bg-gradient-to-br from-primary/20 to-primary/5 text-[#d7ccff] hover:from-primary/30 hover:to-primary/10 hover:border-primary hover:shadow-[0_0_15px_rgba(123,92,240,0.4),inset_0_0_10px_rgba(123,92,240,0.2)]",
  signal:
    "focus-ring border-secondary/70 bg-gradient-to-br from-secondary/20 to-secondary/5 text-secondary hover:from-secondary/30 hover:to-secondary/10 " +
    "hover:drop-shadow-[0_0_8px_rgba(0,245,212,0.45)]",
  ghost:
    "focus-ring border-line-strong bg-transparent text-ink hover:border-secondary hover:text-secondary hover:bg-secondary/5",
  danger:
    "focus-ring-danger border-danger/70 bg-gradient-to-br from-danger/20 to-danger/5 text-danger hover:from-danger/30 hover:to-danger/10 hover:drop-shadow-[0_0_8px_rgba(255,61,96,0.4)]",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    href,
    ...rest
  } = props as BaseProps & { href?: string } & Record<string, unknown>;

  const cls = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`.trim();

  if (href !== undefined) {
    return (
      <Link
        href={href}
        className={cls}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
