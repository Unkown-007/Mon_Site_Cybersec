import Link from "next/link";
import type { ReactNode } from "react";

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
  return (
    <Link href={href} className="card group block p-5">
      <div className="flex items-start justify-between mb-4">
        <span className={`label ${accentText}`}>{code}</span>
        <span className={`${accentText} opacity-60 group-hover:opacity-100 transition-opacity`}>
          {icon ?? "→"}
        </span>
      </div>
      <h3 className="font-display text-lg text-ink mb-1.5 group-hover:text-glow-primary transition-all">
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
