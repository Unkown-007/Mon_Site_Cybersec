"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import {
  SCRIPTS,
  EXTERNAL_TOOLS,
  PHASES,
  type Phase,
  type Lang,
} from "@/data/mock";

const PHASE_COLOR: Record<Phase, string> = {
  Recon: "text-secondary border-secondary/40",
  Enum: "text-primary border-primary/40",
  Exploit: "text-danger border-danger/40",
  "Post-exploit": "text-warning border-warning/40",
  Reporting: "text-success border-success/40",
};

const LANG_COLOR: Record<Lang, string> = {
  Python: "text-warning",
  Bash: "text-success",
  PowerShell: "text-secondary",
  Go: "text-primary",
  C: "text-danger",
};

/**
 * Aperçu visuel propre à l'outil :
 *  - dépôt GitHub → carte d'aperçu OpenGraph du dépôt (image distincte par tool)
 *  - autre site   → favicon du site centré
 *  - repli        → initiale sur fond dégradé
 */
function ToolBanner({ url, name }: { url: string; name: string }) {
  const [idx, setIdx] = useState(0);

  const data = useMemo<{ kind: "og" | "fav"; srcs: string[] } | null>(() => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "github.com") {
        const [owner, repo] = u.pathname.split("/").filter(Boolean);
        if (owner && repo) {
          return {
            kind: "og",
            srcs: [
              `https://opengraph.githubassets.com/ux/${owner}/${repo}`,
              `https://github.com/${owner}.png?size=120`,
            ],
          };
        }
      }
      return {
        kind: "fav",
        srcs: [
          `https://icons.duckduckgo.com/ip3/${host}.ico`,
          `https://www.google.com/s2/favicons?sz=128&domain=${host}`,
          `https://logo.clearbit.com/${host}`,
        ],
      };
    } catch {
      return null;
    }
  }, [url]);

  const src = data?.srcs[idx];

  if (!data || !src) {
    return (
      <div className="h-24 w-full grid place-items-center border-b border-line bg-gradient-to-br from-primary/15 to-secondary/10">
        <span className="font-display text-2xl text-primary/80">{name[0]}</span>
      </div>
    );
  }

  // La première source d'un dépôt GitHub est la carte OG (object-cover) ;
  // les autres sources (avatar / favicon) sont des icônes (object-contain).
  const isCard = data.kind === "og" && idx === 0;

  return (
    <div
      className={`h-24 w-full overflow-hidden border-b border-line grid place-items-center ${
        isCard ? "bg-[#0d1117]" : "bg-gradient-to-br from-surface to-base"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Aperçu ${name}`}
        loading="lazy"
        className={
          isCard
            ? "h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            : "h-12 w-12 object-contain"
        }
        onError={() => setIdx((i) => i + 1)}
      />
    </div>
  );
}

export default function ToolsPage() {
  const { push } = useToast();
  const [phase, setPhase] = useState<Phase | null>(null);

  const scripts = useMemo(
    () => SCRIPTS.filter((s) => !phase || s.phase === phase),
    [phase]
  );
  const externals = useMemo(
    () => EXTERNAL_TOOLS.filter((t) => !phase || t.phase === phase),
    [phase]
  );

  const copy = async (code: string, name: string) => {
    try {
      await navigator.clipboard.writeText(code);
      push("ok", `${name} copié dans le presse-papier.`);
    } catch {
      push("err", "Copie impossible — presse-papier indisponible.");
    }
  };

  return (
    <div>
      <PageHeader
        code="TLS // OUTILS & SCRIPTS"
        title="Outils & scripts"
        desc="Arsenal personnel et boîte à outils externe, classés par phase d'attaque."
      />

      <AddedTools />

      {/* Filtre par phase */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Chip active={phase === null} onClick={() => setPhase(null)}>
          Toutes
        </Chip>
        {PHASES.map((p) => (
          <Chip key={p} active={phase === p} onClick={() => setPhase(p)}>
            {p}
          </Chip>
        ))}
      </div>

      {/* Scripts perso */}
      <section className="mb-12">
        <h2 className="label mb-4">Scripts perso · {scripts.length}</h2>
        {scripts.length === 0 ? (
          <p className="font-mono text-sm text-muted">[ aucun script pour cette phase ]</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {scripts.map((s) => (
              <article key={s.id} className="card overflow-hidden flex flex-col">
                <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-ink truncate">{s.name}</span>
                      <span className={`font-mono text-xs ${LANG_COLOR[s.lang]}`}>{s.lang}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{s.desc}</p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${PHASE_COLOR[s.phase]}`}
                  >
                    {s.phase}
                  </span>
                </header>
                <div className="relative flex-1">
                  <button
                    onClick={() => copy(s.code, s.name)}
                    className="absolute top-2 right-2 z-10 text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-secondary bg-base/80 border border-line px-2 py-1 transition-colors"
                    aria-label={`Copier ${s.name}`}
                  >
                    ⧉ Copier
                  </button>
                  <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-ink/90 font-mono max-h-72">
                    <code>{s.code}</code>
                  </pre>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Boîte à outils externe */}
      <section>
        <h2 className="label mb-4">Boîte à outils externe · {externals.length}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {externals.map((t) => (
            <article key={t.name} className="card scan-hover overflow-hidden group flex flex-col">
              {/* aperçu visuel du tool */}
              <ToolBanner url={t.url} name={t.name} />

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-ink group-hover:text-secondary transition-colors truncate"
                  >
                    {t.name} ↗
                  </a>
                  <span
                    className={`shrink-0 text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${PHASE_COLOR[t.phase]}`}
                  >
                    {t.phase}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed flex-1">{t.desc}</p>

                {t.tags && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-muted bg-base/60 border border-line px-1.5 py-0.5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {t.cmd && (
                  <div className="mt-3 relative">
                    <button
                      onClick={() => copy(t.cmd!, t.name)}
                      className="absolute top-1.5 right-1.5 text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-secondary transition-colors"
                      aria-label={`Copier la commande ${t.name}`}
                    >
                      ⧉
                    </button>
                    <pre className="bg-base/70 border border-line px-2.5 py-2 overflow-x-auto text-[11px] leading-relaxed text-secondary/90 font-mono">
                      <span className="text-success">$ </span>
                      {t.cmd}
                    </pre>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
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
      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-[1.5px] border transition-colors ${
        active
          ? "border-primary text-primary bg-primary/10"
          : "border-line-strong text-muted hover:text-ink hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

/* Outils ajoutés par l'admin (persistés en base, via /api/tools). */
interface AddedTool {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  command?: string;
  tags: string[];
}

function AddedTools() {
  const [tools, setTools] = useState<AddedTool[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/tools", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { tools?: AddedTool[] }) => {
        if (alive) setTools(d.tools ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (tools.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="label mb-4">⊕ AJOUTS DE L&apos;OPÉRATEUR</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <article key={t.id} className="card corner-frame p-4 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-1">
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm text-ink hover:text-secondary transition-colors truncate"
              >
                {t.name} ↗
              </a>
              <span className="shrink-0 text-[9px] font-mono uppercase tracking-[1px] text-primary border border-primary/40 px-1.5 py-0.5">
                {t.category}
              </span>
            </div>
            {t.description && (
              <p className="text-xs text-muted leading-relaxed flex-1 whitespace-pre-wrap">
                {t.description}
              </p>
            )}
            {t.command && (
              <pre className="mt-2 bg-base/70 border border-line px-2.5 py-1.5 text-[11px] text-secondary/90 overflow-x-auto">
                {t.command}
              </pre>
            )}
            {t.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.tags.map((x) => (
                  <span
                    key={x}
                    className="text-[10px] font-mono text-secondary bg-secondary/5 border border-secondary/30 px-1.5 py-0.5"
                  >
                    #{x}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
