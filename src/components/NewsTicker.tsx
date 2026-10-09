"use client";

import { useEffect, useState } from "react";

/*
 * Banderole défilante (ticker) — flux CVE (NVD) + actu cyber (RSS), en continu.
 * Récupère /api/cve et /api/news, entrelace les deux et fait défiler en boucle.
 * Le contenu est dupliqué pour un défilement sans couture (translateX -50%).
 */

interface CveItem {
  id: string;
  score: number;
  severity: string;
  vendor: string;
  summary: string;
}
interface NewsItem {
  title: string;
  link: string;
  source: string;
}
interface TickerEntry {
  kind: "cve" | "news";
  label: string;
  text: string;
  href: string;
  tone: string;
}

const SEV_TONE: Record<string, string> = {
  CRITICAL: "text-danger",
  HIGH: "text-warning",
  MEDIUM: "text-secondary",
  LOW: "text-muted",
};

export function NewsTicker() {
  // null = chargement en cours (on réserve la place → pas de saut de mise en page)
  const [entries, setEntries] = useState<TickerEntry[] | null>(null);

  useEffect(() => {
    let alive = true;

    const build = async () => {
      const [cveRes, newsRes] = await Promise.allSettled([
        fetch("/api/cve").then((r) => r.json()),
        fetch("/api/news").then((r) => r.json()),
      ]);

      const cves: TickerEntry[] =
        cveRes.status === "fulfilled"
          ? ((cveRes.value.items ?? []) as CveItem[]).slice(0, 20).map((c) => ({
              kind: "cve" as const,
              label: `CVE ${c.score.toFixed(1)}`,
              text: `${c.id} · ${c.vendor} — ${c.summary}`,
              href: `https://nvd.nist.gov/vuln/detail/${c.id}`,
              tone: SEV_TONE[c.severity] ?? "text-secondary",
            }))
          : [];

      const news: TickerEntry[] =
        newsRes.status === "fulfilled"
          ? ((newsRes.value.items ?? []) as NewsItem[]).slice(0, 25).map((n) => ({
              kind: "news" as const,
              label: n.source,
              text: n.title,
              href: n.link,
              tone: "text-ink",
            }))
          : [];

      // Entrelacement CVE/news pour alterner les deux flux.
      const merged: TickerEntry[] = [];
      const max = Math.max(cves.length, news.length);
      for (let i = 0; i < max; i++) {
        if (cves[i]) merged.push(cves[i]);
        if (news[i]) merged.push(news[i]);
      }
      if (alive) setEntries(merged);
    };

    build();
    const id = setInterval(build, 15 * 60 * 1000); // rafraîchit avec le cache serveur
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (entries !== null && entries.length === 0) return null;

  // Doublé pour la boucle sans couture.
  const loop = entries ? [...entries, ...entries] : [];

  return (
    <div className="mb-6 flex h-10 items-center overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
      {/* badge LIVE */}
      <div className="flex h-full shrink-0 items-center gap-2 border-r border-white/[0.07] pl-3.5 pr-3.5">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-danger">Live</span>
      </div>

      <div className="marquee-mask relative flex h-full min-w-0 flex-1 items-center">
        {entries === null ? (
          <div className="mx-4 h-2 w-2/3 rounded-full terminal-skeleton" aria-hidden="true" />
        ) : (
          <div
            className="marquee-track items-center"
            style={{ ["--marquee-duration" as string]: `${Math.max(40, loop.length * 3.2)}s` }}
          >
            {loop.map((e, i) => (
              <a
                key={`${e.kind}-${i}`}
                href={e.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 whitespace-nowrap px-5 text-[12.5px]"
                title={e.text}
              >
                <span
                  className={`shrink-0 rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${e.tone}`}
                >
                  {e.label}
                </span>
                <span className="text-muted transition-colors group-hover:text-ink-strong">
                  {e.text.length > 110 ? e.text.slice(0, 107) + "…" : e.text}
                </span>
                <span className="text-white/15">•</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
