import type { ReactNode } from "react";

/*
 * <Panel> — surface/conteneur de base (verre fumé arrondi).
 *   • défaut      : liseré dégradé discret.
 *   • focal       : liseré dégradé plein (zone focale d'une vue).
 *   • interactive : léger soulèvement au survol (panneaux cliquables).
 * En-tête optionnel : code (eyebrow) + titre + slot à droite.
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
        "hud-panel relative overflow-hidden",
        focal ? "hud-panel--focal" : "",
        interactive ? "hud-panel--interactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasHeader ? (
        <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 pb-3.5 pt-4">
          <div className="min-w-0">
            {code ? <span className="label">{code}</span> : null}
            {title ? (
              <h2 className="mt-1.5 truncate font-display text-h3 font-semibold text-ink-strong">
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
