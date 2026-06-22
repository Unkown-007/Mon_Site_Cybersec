"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button } from "@/components/ui";
import { ARSENAL, ARSENAL_SOURCES } from "@/data/arsenal";

export default function ArsenalPage() {
  const [q, setQ] = useState("");
  const reduce = useReducedMotion();

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ARSENAL;
    return ARSENAL.map((g) => ({
      ...g,
      tools: g.tools.filter((t) => t.name.toLowerCase().includes(query)),
    })).filter((g) => g.tools.length > 0);
  }, [q]);

  const total = ARSENAL.reduce((n, g) => n + g.tools.length, 0);

  // Stagger limité aux 24 sections (les 243 chips restent de simples liens CSS).
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.04 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div>
      <PageHeader
        code="ARS // ARSENAL RED TEAM"
        title="Arsenal"
        desc={`Annuaire d'outils offensifs open-source classés par phase (kill chain) — ${total} liens.`}
        right={<Badge>{total} outils</Badge>}
      />

      {/* Bandeau légal — warning sémantique (porte une information) */}
      <div className="mb-6 rounded-md border border-warning/40 bg-warning/5 p-3">
        <p className="text-body-sm leading-relaxed text-warning">
          ⚠ Liens de référence vers des dépôts publics. Outils à utiliser uniquement en{" "}
          <span className="text-ink">pentest autorisé, CTF ou labo</span>, sur du matériel/réseau
          t&apos;appartenant. Attaquer des systèmes tiers est illégal.
        </p>
      </div>

      {/* Sources */}
      <div className="mb-6">
        <span className="label mb-2 block">Sources</span>
        <div className="flex flex-wrap gap-2">
          {ARSENAL_SOURCES.map((s) => (
            <Button
              key={s.url}
              variant="ghost"
              size="sm"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ {s.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Recherche — élément focal cyan de la vue */}
      <div className="mb-6 flex items-center gap-3 rounded-md border border-secondary/40 bg-surface px-4 py-3 transition-[border-color,box-shadow] duration-base ease-out-soft [--glow-color:var(--secondary)] focus-within:border-secondary focus-within:shadow-glow">
        <span className="shrink-0 font-mono text-sm text-secondary">// SEARCH</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="filtrer un outil…"
          spellCheck={false}
          className="flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-muted"
          aria-label="Filtrer l'arsenal"
        />
      </div>

      {groups.length === 0 ? (
        <div className="rounded-md border border-line bg-surface p-8 text-center font-mono text-body-sm text-muted">
          [ aucun résultat ]
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {groups.map((g) => (
            <motion.section key={g.category} variants={item}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="label">{g.category}</h2>
                <span className="font-mono text-label text-muted">{g.tools.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.tools.map((t) => (
                  <a
                    key={t.url + t.name}
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring rounded-sm border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-ink transition-colors duration-fast ease-out-soft hover:border-secondary/50 hover:text-secondary"
                  >
                    {t.name} <span className="text-muted">↗</span>
                  </a>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>
      )}
    </div>
  );
}
