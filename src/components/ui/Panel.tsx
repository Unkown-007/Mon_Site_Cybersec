import type { ReactNode } from "react";

/*
 * <Panel> — surface/conteneur de base.
 *   • défaut      : bordure neutre, le violet recule.
 *   • focal       : bordure violet STRUCTUREL + surface surélevée (zone focale
 *                   d'une vue). Pas de glow : le glow reste réservé au cyan signal.
 *   • interactive : léger lift au survol (panneaux cliquables).
 * En-tête optionnel : code (label violet) + titre (display). Rayons & bordures
 * via tokens unifiés.
 */

type PanelProps = {
  code?: string;
  title?: string;
  right?: ReactNode;
  focal?: boolean;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
};

export function Panel({
  code,
  title,
  right,
  focal = false,
  interactive = false,
  className = "",
  children,
}: PanelProps) {
  const hasHeader = Boolean(code || title || right);

  return (
    <section
      className={[
        "rounded-md border",
        focal ? "border-primary/40 bg-elevated" : "border-line bg-surface",
        interactive
          ? "transition-[transform,border-color] duration-base ease-out-soft hover:-translate-y-0.5 hover:border-line-strong"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasHeader ? (
        <header className="flex items-start justify-between gap-3 border-b border-line-subtle px-5 pb-3 pt-4">
          <div className="min-w-0">
            {code ? <span className="label text-primary">{code}</span> : null}
            {title ? (
              <h2 className="mt-1 truncate font-display text-h3 text-ink-strong">
                {title}
              </h2>
            ) : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
