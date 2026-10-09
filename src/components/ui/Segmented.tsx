"use client";

import { LayoutGroup, motion } from "framer-motion";
import { usePerf } from "@/lib/perf";

/*
 * Groupe d'onglets / filtres en pilules : la pastille active glisse d'une
 * option à l'autre (layoutId, animée uniquement au changement de sélection).
 * `layoutId` doit être unique par instance présente sur la page.
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  layoutId,
  className = "",
}: {
  items: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  layoutId: string;
  className?: string;
}) {
  const { lite } = usePerf();
  return (
    <LayoutGroup id={layoutId}>
      <div role="tablist" className={`flex flex-wrap gap-1.5 ${className}`}>
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(it.id)}
              className={`relative rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-ring ${
                active
                  ? "border-transparent text-ink-strong"
                  : "border-white/[0.08] bg-white/[0.02] text-muted hover:border-white/15 hover:text-ink-strong"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`${layoutId}-pill`}
                  transition={lite ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                  className="absolute inset-0 rounded-full bg-primary/[0.18] ring-1 ring-inset ring-primary/45"
                />
              )}
              <span className="relative z-10">
                {it.label}
                {it.count !== undefined && <span className="ml-1.5 text-[11px] opacity-60">{it.count}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
