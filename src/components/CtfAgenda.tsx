"use client";

import { useEffect, useMemo, useState } from "react";
import type { CtfEvent } from "@/app/api/ctf/route";
import { Segmented } from "@/components/ui/Segmented";

/*
 * Agenda des prochains CTF (CTFtime, via /api/ctf). `compact` = widget du
 * dashboard (quelques lignes, sans filtres). Aucun timer : le compte à
 * rebours est calculé à l'affichage.
 */

type Filter = "all" | "live" | "jeopardy" | "ad" | "onsite";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "live", label: "En cours" },
  { id: "jeopardy", label: "Jeopardy" },
  { id: "ad", label: "Attack-Defense" },
  { id: "onsite", label: "Sur place" },
];

const DAY = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
const MONTH = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const WHEN = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function relative(startIso: string, finishIso: string): { text: string; live: boolean } {
  const now = Date.now();
  const start = new Date(startIso).getTime();
  const finish = new Date(finishIso).getTime();
  if (start <= now && now < finish) {
    const h = Math.round((finish - now) / 3600000);
    return { text: h >= 48 ? `en cours · fin dans ${Math.round(h / 24)} j` : `en cours · fin dans ${h} h`, live: true };
  }
  const h = Math.round((start - now) / 3600000);
  if (h < 1) return { text: "commence bientôt", live: false };
  if (h < 48) return { text: `dans ${h} h`, live: false };
  return { text: `dans ${Math.round(h / 24)} j`, live: false };
}

function duration(startIso: string, finishIso: string): string {
  const h = Math.round((new Date(finishIso).getTime() - new Date(startIso).getTime()) / 3600000);
  return h >= 48 ? `${Math.round(h / 24)} j` : `${h} h`;
}

export function CtfAgenda({ limit, compact = false }: { limit?: number; compact?: boolean }) {
  const [items, setItems] = useState<CtfEvent[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  // Page complète : 12 CTF d'abord, le reste à la demande.
  const cap = limit ?? (expanded ? Infinity : 12);

  useEffect(() => {
    let alive = true;
    fetch("/api/ctf")
      .then((r) => r.json())
      .then((d: { source: string; items: CtfEvent[] }) => {
        if (!alive) return;
        setItems(d.items ?? []);
        setError(d.source !== "ctftime");
      })
      .catch(() => {
        if (alive) {
          setItems([]);
          setError(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const now = Date.now();
    const list = (items ?? []).filter((e) => {
      if (filter === "live") return new Date(e.start).getTime() <= now;
      if (filter === "jeopardy") return /jeopardy/i.test(e.format);
      if (filter === "ad") return /attack/i.test(e.format);
      if (filter === "onsite") return e.onsite;
      return true;
    });
    return { list: list.slice(0, cap), total: list.length };
  }, [items, filter, cap]);

  return (
    <div>
      {!compact && (
        <div className="mb-5">
          <Segmented items={FILTERS} value={filter} onChange={setFilter} layoutId="ctf-filter" />
        </div>
      )}

      {items === null ? (
        <ul className="space-y-2" aria-hidden="true">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
            <li key={i} className="card flex items-center gap-4 p-4">
              <div className="terminal-skeleton h-12 w-12 !rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="terminal-skeleton h-3.5 w-1/2" />
                <div className="terminal-skeleton h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : shown.list.length === 0 ? (
        <div className="card p-6 text-center text-sm text-muted">
          {error ? (
            <>
              Agenda CTFtime injoignable pour le moment —{" "}
              <a className="text-secondary hover:underline" href="https://ctftime.org/event/list/upcoming" target="_blank" rel="noopener noreferrer">
                voir sur ctftime.org ↗
              </a>
            </>
          ) : (
            "Aucun CTF pour ce filtre."
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {shown.list.map((e, i) => {
            const rel = relative(e.start, e.finish);
            const start = new Date(e.start);
            return (
              <li
                key={e.id}
                className="card group animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
              >
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3.5 focus-ring rounded-[inherit]"
                >
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border text-center leading-none ${
                      rel.live ? "border-success/40 bg-success/10" : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div>
                      <div className="font-display text-lg font-bold text-ink-strong">{DAY.format(start)}</div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">
                        {MONTH.format(start).replace(".", "")}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink-strong group-hover:text-white">{e.title}</span>
                      {rel.live && <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      <span className={rel.live ? "text-success" : "text-ink"}>{rel.text}</span>
                      {!compact && <span>· {WHEN.format(start)}</span>}
                      <span>· {duration(e.start, e.finish)}</span>
                      {e.format && <span>· {e.format}</span>}
                      {e.onsite && <span>· sur place{e.location ? ` (${e.location})` : ""}</span>}
                    </div>
                  </div>
                  {!compact && e.weight > 0 && (
                    <span className="hidden shrink-0 rounded-lg bg-primary/10 px-2 py-1 font-mono text-[11px] text-[#b9a8ff] sm:inline" title="Poids CTFtime">
                      ⚖ {e.weight.toFixed(1)}
                    </span>
                  )}
                  <span className="shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {!compact && shown.total > shown.list.length && (
        <button type="button" onClick={() => setExpanded(true)} className="btn btn-ghost mt-3 w-full">
          Afficher les {shown.total - shown.list.length} autres CTF
        </button>
      )}

      {!compact && items !== null && !error && (
        <p className="mt-4 text-xs text-muted">
          Source : CTFtime (mis à jour toutes les heures). Les horaires sont affichés dans ton fuseau.
        </p>
      )}
    </div>
  );
}
