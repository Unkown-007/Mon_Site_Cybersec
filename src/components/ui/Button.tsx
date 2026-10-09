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

const BASE = "btn focus-ring";

const SIZES: Record<Size, string> = {
  sm: "!px-3 !py-2 !text-xs !rounded-[10px]",
  md: "",
};

const VARIANTS: Record<Variant, string> = {
  primary: "btn-primary",
  signal:
    "border-secondary/50 bg-secondary/10 text-secondary hover:-translate-y-px hover:bg-secondary/[0.16] hover:shadow-[0_12px_30px_-14px_rgba(0,245,212,0.8)]",
  ghost: "btn-ghost",
  danger:
    "border-danger/50 bg-danger/10 text-danger focus-ring-danger hover:-translate-y-px hover:bg-danger/[0.16] hover:shadow-[0_12px_30px_-14px_rgba(255,61,96,0.8)]",
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
