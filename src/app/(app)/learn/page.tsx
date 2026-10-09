"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PinButton } from "@/components/PinButton";
import { Badge } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
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
  const filters = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of LEARN) c[l.category] = (c[l.category] ?? 0) + 1;
    return [
      { id: "all" as const, label: "Tout", count: LEARN.length },
      ...LEARN_CATS.filter((k) => c[k]).map((k) => ({ id: k, label: k, count: c[k] })),
    ];
  }, []);

  return (
    <div>
      <PageHeader
        code="LRN // ENTRAÎNEMENT"
        title="Plateformes d'entraînement"
        desc="Plateformes interactives, labs et wargames pour progresser — du web à l'IA, du reverse au blue team."
      />

      <Segmented
        items={filters as { id: LearnCat | "all"; label: string; count: number }[]}
        value={cat}
        onChange={setCat}
        layoutId="learn-cat"
        className="mb-6"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l, i) => (
          <div
            key={l.url}
            className="card hover-lift group relative animate-fade-up p-4"
            style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-semibold text-ink-strong after:absolute after:inset-0 after:rounded-[inherit] focus-ring"
              >
                {l.name}
              </a>
              <span className="relative z-10 -mr-1.5 -mt-1.5">
                <PinButton pin={{ id: `lrn:${l.url}`, kind: "plateforme", title: l.name, href: l.url, hint: l.category }} />
              </span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted">{l.desc}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-secondary">{l.category}</span>
              <span className="text-muted/40">·</span>
              <Badge variant={LEVEL_TONE[l.level]}>{l.level}</Badge>
              {l.free && <Badge variant="success">gratuit</Badge>}
            </div>
          </div>
        ))}
      </div>

      {/* Plateformes de CTF */}
      <section className="mt-14">
        <span className="label">CTF</span>
        <h2 className="mb-5 mt-2 font-display text-h2 font-bold text-ink-strong">Plateformes de CTF</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CTF_PLATFORMS.map((c) => (
            <div key={c.url} className="card hover-lift group relative p-4">
              <div className="mb-1 flex items-start justify-between gap-2">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-semibold text-ink-strong after:absolute after:inset-0 after:rounded-[inherit] focus-ring"
                >
                  {c.name}
                </a>
                <span className="relative z-10 -mr-1.5 -mt-1.5 flex items-center gap-1">
                  <span className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase text-secondary">
                    {c.kind}
                  </span>
                  <PinButton pin={{ id: `ctf:${c.url}`, kind: "plateforme", title: c.name, href: c.url, hint: c.kind }} />
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
