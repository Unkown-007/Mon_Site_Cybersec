import Link from "next/link";
import type { ReactNode } from "react";

const DEFAULT_ICONS: Record<string, ReactNode> = {
  RES: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  ),
  WUP: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  TLS: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  INT: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
};

export function ModuleCard({
  href,
  code,
  title,
  desc,
  meta,
  accent = "primary",
  icon,
}: {
  href: string;
  code: string;
  title: string;
  desc: string;
  meta?: string;
  accent?: "primary" | "secondary";
  icon?: ReactNode;
}) {
  const accentText = accent === "primary" ? "text-primary" : "text-secondary";
  const glowText = accent === "primary" ? "group-hover:text-glow-primary" : "group-hover:text-glow-secondary";
  const resolvedIcon = icon ?? DEFAULT_ICONS[code] ?? (
    <span className="transition-transform duration-fast ease-out-soft group-hover:translate-x-0.5">→</span>
  );

  return (
    <Link
      href={href}
      className="card corner-frame scan-hover group block p-5 rounded-md focus-ring hover:shadow-glow transition-all duration-base ease-out-soft"
      style={{
        "--glow-color": accent === "primary" ? "var(--primary)" : "var(--secondary)",
      } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-4">
        <span className={`label ${accentText}`}>{code}</span>
        <span className={`${accentText} opacity-60 group-hover:opacity-100 transition-opacity`}>
          {resolvedIcon}
        </span>
      </div>
      <h3 className={`font-display text-lg text-ink mb-1.5 ${glowText} transition-all`}>
        {title}
      </h3>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
      {meta ? (
        <div className="mt-4 pt-3 border-t border-line text-xs font-mono text-muted">
          {meta}
        </div>
      ) : null}
    </Link>
  );
}

