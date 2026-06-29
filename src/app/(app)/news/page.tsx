"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { usePerf } from "@/lib/perf";
import { useReducedMotion } from "framer-motion";
import { NewsSkeletonCard } from "@/components/ui/Skeletons";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string;
}

const SOURCE_COLOR: Record<string, string> = {
  "The Hacker News": "text-primary border-primary/40",
  BleepingComputer: "text-secondary border-secondary/40",
  "Krebs on Security": "text-warning border-warning/40",
  "Dark Reading": "text-danger border-danger/40",
  "SANS ISC": "text-success border-success/40",
};

const ago = (iso: string) => {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000);
  if (isNaN(s)) return "";
  if (s < 3600) return `il y a ${Math.max(1, Math.floor(s / 60))} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
};

export default function NewsPage() {
  const { lite } = usePerf();
  const shouldReduceMotion = useReducedMotion();
  const disableAnimation = lite || (shouldReduceMotion ?? false);

  const [items, setItems] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [read, setRead] = useLocalStorage<string[]>("ux077.news.read", []);

  useEffect(() => {
    let alive = true;
    fetch("/api/news")
      .then((r) => r.json())
      .then((d: { ok: boolean; sources: string[]; items: NewsItem[] }) => {
        if (!alive) return;
        setItems(d.items);
        setSources(d.sources);
        setOk(d.ok);
      })
      .catch(() => alive && setOk(false))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () => (active ? items.filter((i) => i.source === active) : items),
    [items, active]
  );

  const markRead = (link: string) =>
    setRead((prev) => (prev.includes(link) ? prev : [...prev, link].slice(-300)));

  return (
    <div>
      <PageHeader
        code="NWS // ACTU CYBER EN DIRECT"
        title="News"
        desc="Agrégation en temps réel des principaux médias de cybersécurité (flux RSS)."
        state={ok ? "online" : "warn"}
        right={
          <div className="card px-3 py-2 font-mono text-xs flex items-center gap-2">
            {loading ? (
              <span className="text-muted">chargement<span className="cursor" aria-hidden="true" /></span>
            ) : ok ? (
              <span className="text-success">● {items.length} articles en direct</span>
            ) : (
              <span className="text-warning">● flux indisponible</span>
            )}
          </div>
        }
      />

      {/* filtres sources */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Chip active={active === null} onClick={() => setActive(null)}>
            Tout
          </Chip>
          {sources.map((s) => (
            <Chip key={s} active={active === s} onClick={() => setActive(active === s ? null : s)}>
              {s}
            </Chip>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <NewsSkeletonCard key={i} disableAnimation={disableAnimation} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center font-mono text-sm text-muted">
          [ aucun article — flux momentanément injoignables ]
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((it) => {
            const isRead = read.includes(it.link);
            return (
              <li key={it.link}>
                <a
                  href={it.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markRead(it.link)}
                  className="card scan-hover block p-4 group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`shrink-0 text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${SOURCE_COLOR[it.source] ?? "text-muted border-line-strong"}`}
                    >
                      {it.source}
                    </span>
                    <span className="font-mono text-[10px] text-muted">{ago(it.date)}</span>
                    {isRead && <span className="font-mono text-[10px] text-muted">· lu</span>}
                  </div>
                  <p
                    className={`text-sm leading-snug transition-colors ${
                      isRead ? "text-muted" : "text-ink group-hover:text-secondary"
                    }`}
                  >
                    {it.title} <span className="text-muted">↗</span>
                  </p>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-[1px] border transition-colors ${
        active
          ? "border-primary text-primary bg-primary/10"
          : "border-line-strong text-muted hover:text-ink hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}
