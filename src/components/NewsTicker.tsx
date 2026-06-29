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
  const [entries, setEntries] = useState<TickerEntry[]>([]);

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

  if (entries.length === 0) return null;

  // Doublé pour la boucle sans couture.
  const loop = [...entries, ...entries];

  return (
    <div className="fixed top-14 inset-x-0 z-40 h-8 border-b border-primary/15 bg-base/80 backdrop-blur-md overflow-hidden" style={{ boxShadow: 'inset 0 -1px 0 rgba(123,92,240,0.08), 0 1px 8px rgba(0,0,0,0.3)' }}>
      <div className="marquee-mask relative flex h-full items-center">
        {/* badge LIVE fixe à gauche */}
        <div className="absolute left-0 top-0 z-10 flex h-full items-center gap-1.5 bg-base/95 pl-3 pr-4 border-r border-line-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-flicker" aria-hidden="true" />
          <span className="label !text-danger !text-[9px]">LIVE FEED</span>
        </div>

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
              className="group inline-flex items-center gap-2 px-5 font-mono text-[11px] whitespace-nowrap"
              title={e.text}
            >
              <span className={`shrink-0 uppercase tracking-[1px] ${e.tone}`}>
                {e.kind === "cve" ? "▰" : "◇"} {e.label}
              </span>
              <span className="text-muted group-hover:text-ink transition-colors">
                {e.text.length > 110 ? e.text.slice(0, 107) + "…" : e.text}
              </span>
              <span className="text-line-strong">/</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
