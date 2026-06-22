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
  "inline-flex items-center justify-center gap-2 rounded-sm border font-mono uppercase " +
  "tracking-[0.12em] select-none transition-[color,background-color,border-color,box-shadow,transform] " +
  "duration-fast ease-out-soft active:translate-y-px disabled:opacity-40 disabled:pointer-events-none";

const SIZES: Record<Size, string> = {
  sm: "text-label px-3 py-2",
  md: "text-xs px-5 py-3",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "focus-ring border-primary/70 bg-primary/10 text-[#d7ccff] hover:bg-primary/20 hover:border-primary",
  signal:
    "focus-ring border-secondary/70 bg-secondary/10 text-secondary hover:bg-secondary/20 " +
    "[--glow-color:var(--secondary)] hover:shadow-glow",
  ghost:
    "focus-ring border-line-strong bg-transparent text-ink hover:border-secondary hover:text-secondary",
  danger:
    "focus-ring-danger border-danger/70 bg-danger/10 text-danger hover:bg-danger/20",
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
