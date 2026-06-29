"use client";

import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ARSENAL, ARSENAL_SOURCES } from "@/data/arsenal";
import { usePerf } from "@/lib/perf";
import { useReducedMotion } from "framer-motion";
import { ArsenalSkeletonCard } from "@/components/ui/Skeletons";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export default function ArsenalPage() {
  const [q, setQ] = useState("");
  const { lite } = usePerf();
  const shouldReduceMotion = useReducedMotion();
  const disableAnimation = lite || (shouldReduceMotion ?? false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (disableAnimation) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [disableAnimation]);

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ARSENAL;
    return ARSENAL.map((g) => ({
      ...g,
      tools: g.tools.filter((t) => t.name.toLowerCase().includes(query)),
    })).filter((g) => g.tools.length > 0);
  }, [q]);

  const total = ARSENAL.reduce((n, g) => n + g.tools.length, 0);

  return (
    <div>
      <PageHeader
        code="ARS // ARSENAL RED TEAM"
        title="Arsenal"
        desc={`Annuaire d'outils offensifs open-source classés par phase (kill chain) — ${total} liens.`}
        right={
          <span className="card px-3 py-2 font-mono text-xs text-secondary">{total} outils</span>
        }
      />

      {/* bandeau légal */}
      <div className="card p-3 mb-5 border-warning/40">
        <p className="font-mono text-[11px] text-warning leading-relaxed">
          ⚠ Liens de référence vers des dépôts publics. Outils à utiliser uniquement en{" "}
          <span className="text-ink">pentest autorisé, CTF ou labo</span>, sur du matériel/réseau
          t&apos;appartenant. Attaquer des systèmes tiers est illégal.
        </p>
      </div>

      {/* sources */}
      <div className="mb-6">
        <span className="label !text-muted block mb-2">Sources</span>
        <div className="flex flex-wrap gap-2">
          {ARSENAL_SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost !py-1.5 !px-3 text-[11px]"
            >
              ↗ {s.name}
            </a>
          ))}
        </div>
      </div>

      <div className="divider-gradient my-5" />

      {/* recherche */}
      <div className="card flex items-center gap-3 px-4 py-3 mb-6">
        <span className="font-mono text-sm text-secondary shrink-0">{"// SEARCH"}</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="filtrer un outil…"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none font-mono text-sm text-ink placeholder:text-muted"
          aria-label="Filtrer l'arsenal"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <ArsenalSkeletonCard key={idx} disableAnimation={disableAnimation} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card p-8 text-center font-mono text-sm text-muted">[ aucun résultat ]</div>
      ) : (
        <div className="space-y-8">
          {groups.map((g, idx) => (
            <ScrollReveal key={g.category} direction="up" delay={idx * 50} as="section">
              <div className="flex items-center justify-between mb-3">
                <h2 className="label">{g.category}</h2>
                <span className="font-mono text-[10px] text-muted">{g.tools.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.tools.map((t) => (
                  <a
                    key={t.url + t.name}
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-ink bg-surface border border-line hover:border-secondary/50 hover:text-secondary transition-colors px-2.5 py-1.5"
                  >
                    {t.name} <span className="text-muted">↗</span>
                  </a>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
