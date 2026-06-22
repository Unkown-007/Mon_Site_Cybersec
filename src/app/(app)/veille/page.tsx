"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GUIPanel } from "@/components/GUIPanel";
import { Badge } from "@/components/ui";

interface ApiCve {
  id: string;
  score: number;
  severity: string;
  vendor: string;
  summary: string;
  published: string;
}

interface Bookmark {
  title: string;
  url: string;
  note: string;
  crit: "haute" | "moyenne" | "info";
}

const BOOKMARKS: Bookmark[] = [
  {
    title: "The Hacker News",
    url: "https://thehackernews.com/",
    note: "Veille quotidienne — breaking news sécu, large couverture.",
    crit: "info",
  },
  {
    title: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/",
    note: "Ransomware, fuites, advisories vendeurs. Très réactif.",
    crit: "moyenne",
  },
  {
    title: "CISA Known Exploited Vulns (KEV)",
    url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    note: "À surveiller en priorité : failles activement exploitées.",
    crit: "haute",
  },
  {
    title: "Project Zero",
    url: "https://googleprojectzero.blogspot.com/",
    note: "Recherche offensive de pointe, write-ups 0-day détaillés.",
    crit: "moyenne",
  },
  {
    title: "tl;dr sec",
    url: "https://tldrsec.com/",
    note: "Newsletter hebdo — sécu offensive & défensive condensée.",
    crit: "info",
  },
  {
    title: "Exploit-DB",
    url: "https://www.exploit-db.com/",
    note: "Base d'exploits publics, utile en recherche de PoC.",
    crit: "moyenne",
  },
];

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "text-danger border-danger/40",
  HIGH: "text-warning border-warning/40",
  MEDIUM: "text-secondary border-secondary/40",
  LOW: "text-muted border-line-strong",
};

const CRIT_COLOR: Record<Bookmark["crit"], string> = {
  haute: "text-danger border-danger/40",
  moyenne: "text-warning border-warning/40",
  info: "text-secondary border-secondary/40",
};

const SCORE_FILTERS = [
  { label: "Tous", min: 0 },
  { label: "≥ 4", min: 4 },
  { label: "≥ 7", min: 7 },
  { label: "≥ 9", min: 9 },
];

export default function VeillePage() {
  const [items, setItems] = useState<ApiCve[]>([]);
  const [source, setSource] = useState<"nvd" | "fallback" | null>(null);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [vendor, setVendor] = useState<string | null>(null);
  const [kev, setKev] = useState<Set<string>>(new Set());
  const [kevRansom, setKevRansom] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    fetch("/api/cve")
      .then((r) => r.json())
      .then((data: { source: "nvd" | "fallback"; items: ApiCve[] }) => {
        if (!alive) return;
        setItems(data.items);
        setSource(data.source);
      })
      .catch(() => alive && setSource("fallback"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // B1 — catalogue CISA KEV (failles activement exploitées).
  useEffect(() => {
    let alive = true;
    fetch("/api/kev")
      .then((r) => r.json())
      .then((d: { ids?: string[]; ransomware?: string[] }) => {
        if (!alive) return;
        setKev(new Set(d.ids ?? []));
        setKevRansom(new Set(d.ransomware ?? []));
      })
      .catch(() => {
        /* repli silencieux : pas de badge KEV si la source tombe */
      });
    return () => {
      alive = false;
    };
  }, []);

  const vendors = useMemo(
    () => Array.from(new Set(items.map((c) => c.vendor))).filter((v) => v !== "n/a").sort(),
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter((c) => c.score >= minScore && (!vendor || c.vendor === vendor)),
    [items, minScore, vendor]
  );

  return (
    <div>
      <PageHeader
        code="INT // THREAT INTEL & VEILLE"
        title="Threat intel & veille"
        desc="Flux CVE en direct depuis l'API NVD (NIST), bookmarks annotés et sources curatées."
        state={source === "fallback" ? "warn" : "online"}
        right={
          <div className="card px-3 py-2 font-mono text-xs">
            {loading ? (
              <span className="text-muted">
                chargement<span className="cursor" aria-hidden="true" />
              </span>
            ) : source === "nvd" ? (
              <span className="text-success">● flux NVD en direct</span>
            ) : (
              <span className="text-warning">● données locales (NVD injoignable)</span>
            )}
          </div>
        }
      />

      {/* GUI panels */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <GUIPanel title="// THREAT_FEED" size="lg" animated danger={items.filter((c) => c.score >= 9).length > 0} className="!w-full">
          <div className="space-y-1">
            <div>
              CVE CRITIQUES (≥9.0):{" "}
              <span className="text-danger font-bold">{items.filter((c) => c.score >= 9).length}</span>
            </div>
            <div>CVE TOTAL: <span className="text-ink">{items.length}</span></div>
            <div>
              SOURCE:{" "}
              {source === "nvd" ? (
                <span className="text-success">● NVD live</span>
              ) : (
                <span className="text-warning">● local</span>
              )}
            </div>
          </div>
        </GUIPanel>

        <GUIPanel title="// SOURCES_STATUS" size="lg" animated className="!w-full">
          <div className="space-y-1">
            <div>
              FLUX NVD:{" "}
              {loading ? (
                <span className="text-muted">sync…</span>
              ) : source === "nvd" ? (
                <span className="text-success">● online</span>
              ) : (
                <span className="text-danger">● offline</span>
              )}
            </div>
            <div>BOOKMARKS: <span className="text-ink">{BOOKMARKS.length}</span></div>
            <div>VENDORS SUIVIS: <span className="text-ink">{vendors.length}</span></div>
          </div>
        </GUIPanel>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Flux CVE */}
        <section>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="label">Flux CVE · {filtered.length}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {SCORE_FILTERS.map((f) => (
                <button
                  key={f.label}
                  onClick={() => setMinScore(f.min)}
                  aria-pressed={minScore === f.min}
                  className={`px-2.5 py-1 font-mono text-xs border transition-colors ${
                    minScore === f.min
                      ? "border-danger text-danger bg-danger/10"
                      : "border-line-strong text-muted hover:text-ink"
                  }`}
                >
                  CVSS {f.label}
                </button>
              ))}
            </div>
          </div>

          {vendors.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="label !text-muted">Vendor</span>
              <button
                onClick={() => setVendor(null)}
                className={`px-2 py-0.5 font-mono text-xs border transition-colors ${
                  !vendor ? "border-secondary text-secondary" : "border-line-strong text-muted hover:text-ink"
                }`}
              >
                tous
              </button>
              {vendors.slice(0, 10).map((v) => (
                <button
                  key={v}
                  onClick={() => setVendor(vendor === v ? null : v)}
                  className={`px-2 py-0.5 font-mono text-xs border transition-colors ${
                    vendor === v ? "border-secondary text-secondary" : "border-line-strong text-muted hover:text-ink"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="card p-8 text-center font-mono text-sm text-muted">
              interrogation de l&apos;API NVD<span className="cursor" aria-hidden="true" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-8 text-center font-mono text-sm text-muted">
              [ aucune CVE pour ce filtre ]
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((c) => (
                <li key={c.id} className="card p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-secondary hover:underline"
                    >
                      {c.id} ↗
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      {kev.has(c.id) && (
                        <Badge variant="danger" dot>
                          {kevRansom.has(c.id) ? "KEV · ransomware" : "KEV exploité"}
                        </Badge>
                      )}
                      <span
                        className={`text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${SEV_COLOR[c.severity] ?? SEV_COLOR.LOW}`}
                      >
                        {c.severity}
                      </span>
                      <span className="font-mono text-sm font-bold text-ink">
                        {c.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{c.summary}</p>
                  <div className="mt-2 text-[10px] font-mono text-muted uppercase tracking-[1px]">
                    {c.vendor !== "n/a" ? `${c.vendor} · ` : ""}
                    {c.published}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Bookmarks */}
        <aside>
          <h2 className="label mb-4">Sources & bookmarks</h2>
          <ul className="space-y-2">
            {BOOKMARKS.map((b) => (
              <li key={b.url}>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card block p-3 group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-sm text-ink group-hover:text-secondary transition-colors truncate">
                      {b.title} ↗
                    </span>
                    <span
                      className={`shrink-0 text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${CRIT_COLOR[b.crit]}`}
                    >
                      {b.crit}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-snug">{b.note}</p>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
