"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui";
import { LEARN, LEARN_CATS, CTF_PLATFORMS, type LearnCat } from "@/data/learn";

const LEVEL_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  Débutant: "success",
  Intermédiaire: "warning",
  Avancé: "danger",
  Tous: "neutral",
};

export default function LearnPage() {
  const [cat, setCat] = useState<LearnCat | "all">("all");

  const items = useMemo(() => (cat === "all" ? LEARN : LEARN.filter((l) => l.category === cat)), [cat]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of LEARN) c[l.category] = (c[l.category] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div>
      <PageHeader
        code="LRN // ENTRAÎNEMENT"
        title="Apprendre & s'entraîner"
        desc="Plateformes interactives, labs et wargames pour progresser — du web à l'IA, du reverse au blue team."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={cat === "all"} onClick={() => setCat("all")} label="Tout" count={LEARN.length} />
        {LEARN_CATS.filter((c) => counts[c]).map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)} label={c} count={counts[c]} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring card block p-4"
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <span className="font-mono text-sm text-ink-strong">{l.name}</span>
              <span className="shrink-0 text-primary/70">↗</span>
            </div>
            <p className="mb-3 text-label leading-snug text-muted">{l.desc}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-[1px] text-secondary">{l.category}</span>
              <span className="text-muted/40">·</span>
              <Badge variant={LEVEL_TONE[l.level]}>{l.level}</Badge>
              {l.free && <Badge variant="success">gratuit</Badge>}
            </div>
          </a>
        ))}
      </div>

      {/* Plateformes de CTF */}
      <section className="mt-12">
        <h2 className="label mb-4">PLATEFORMES DE CTF</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CTF_PLATFORMS.map((c) => (
            <a
              key={c.url}
              href={c.url}
              target="_blank"
              rel="noreferrer noopener"
              className="focus-ring card block p-4"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="font-mono text-sm text-ink-strong">{c.name}</span>
                <span className="clip-chamfer-sm border border-line-strong px-2 py-0.5 text-[9px] font-mono uppercase text-secondary">
                  {c.kind}
                </span>
              </div>
              <p className="text-label leading-snug text-muted">{c.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function Chip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`hud-tab hud-tab--chip focus-ring px-3 py-1.5 font-mono text-[10px] uppercase tracking-[1px] ${
        active ? "is-active text-secondary" : "text-muted hover:text-ink"
      }`}
    >
      <span className="relative z-10 flex items-center gap-1.5">
        {label}
        <span className={active ? "text-secondary/70" : "text-muted/50"}>{count}</span>
      </span>
    </button>
  );
}
