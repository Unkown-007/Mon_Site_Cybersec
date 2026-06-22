"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { FakeTerminal } from "@/components/FakeTerminal";
import { StatusDot } from "@/components/StatusDot";
import { CountUp } from "@/components/animations/CountUp";
import { CoverageBars } from "@/components/CoverageBars";
import { AccountsPanel } from "@/components/AccountsPanel";
import { Panel, Badge } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import {
  STATS,
  WRITEUPS,
  CVES,
  COVERAGE_BY_DOMAIN,
  COVERAGE_BY_PHASE,
} from "@/data/mock";

const openTerminal = () =>
  window.dispatchEvent(new Event("ux077:open-terminal"));

type BadgeVariant = "neutral" | "accent" | "signal" | "danger" | "warning" | "success";

const DIFF_BADGE: Record<string, BadgeVariant> = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
  Insane: "accent",
};

// Couleur du score CVE — sémantique uniquement, aucun cyan décoratif.
const SEV_SCORE: Record<string, string> = {
  CRITICAL: "text-danger",
  HIGH: "text-warning",
  MEDIUM: "text-ink-strong",
  LOW: "text-muted",
};

// Data-viz CVE : barre de sévérité + jauge CVSS (tokens sémantiques).
const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const SEV_BAR: Record<string, string> = {
  CRITICAL: "bg-danger",
  HIGH: "bg-warning",
  MEDIUM: "bg-muted",
  LOW: "bg-line-strong",
};
const SEV_COUNTS = SEV_ORDER.map((s) => ({
  s,
  n: CVES.filter((c) => c.severity === s).length,
}));

// Totaux dérivés des vraies données (en-tête des panneaux de couverture).
const RES_TOTAL = COVERAGE_BY_DOMAIN.reduce((a, b) => a + b.count, 0);
const ARS_TOTAL = COVERAGE_BY_PHASE.reduce((a, b) => a + b.count, 0);

const MODULES = [
  {
    href: "/resources",
    code: "RES",
    title: "Ressources",
    desc: "Cheatsheets, notes, liens — indexés et filtrables par domaine.",
    meta: `${STATS.resources} entrées`,
  },
  {
    href: "/writeups",
    code: "WUP",
    title: "Write-ups",
    desc: "Comptes-rendus CTF avec rendu Markdown et coloration.",
    meta: `${STATS.writeups} write-ups`,
  },
  {
    href: "/tools",
    code: "TLS",
    title: "Outils",
    desc: "Scripts, one-liners et arsenal classés par phase d'attaque.",
    meta: `${STATS.tools} outils`,
  },
  {
    href: "/veille",
    code: "INT",
    title: "Veille",
    desc: "Flux CVE (NVD), bookmarks annotés et agrégateur RSS.",
    meta: `${CVES.length} CVE récentes`,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const reduce = useReducedMotion();

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
    <div className="space-y-16">
      {/* HERO */}
      <motion.section variants={item} initial="hidden" animate="show">
        <div className="mb-6 flex items-center gap-3">
          <StatusDot state="online" />
          <span className="label text-secondary">SYSTÈME OPÉRATIONNEL</span>
        </div>
        <h1 className="max-w-3xl font-display text-display text-ink-strong">
          Centre de commande <span className="text-primary">cyber</span>
          <br />
          de {user?.name ?? "l'opérateur"}.
        </h1>
        <p className="mt-6 max-w-2xl text-body text-muted">
          Base de ressources, write-ups CTF, arsenal d'outils et veille
          threat-intel — centralisés dans un espace de travail unique.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {/* Unique CTA focal cyan de la vue */}
          <Link
            href="/resources"
            className="focus-ring inline-flex items-center gap-2 rounded-sm border border-secondary/70 bg-secondary/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-secondary shadow-glow transition-[color,background-color,border-color,box-shadow,transform] duration-fast ease-out-soft hover:bg-secondary/20 active:translate-y-px"
          >
            Accéder aux ressources
          </Link>
          <button
            type="button"
            onClick={openTerminal}
            className="focus-ring inline-flex items-center gap-2 rounded-sm border border-line-strong bg-transparent px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-[color,border-color,transform] duration-fast ease-out-soft hover:border-secondary hover:text-secondary active:translate-y-px"
          >
            ❯_ Terminal
          </button>
        </div>
      </motion.section>

      {/* STATS */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-px border border-line-strong bg-line-strong lg:grid-cols-4"
      >
        <Stat value={STATS.resources} label="Ressources indexées" variant={item} />
        <Stat value={STATS.writeups} label="Write-ups publiés" variant={item} />
        <Stat value={STATS.tools} label="Outils en arsenal" variant={item} />
        <Stat value={STATS.cves} label="CVE suivies" accent="danger" variant={item} />
      </motion.section>

      {/* COMPTES — données externes réelles */}
      <AccountsPanel />

      {/* COUVERTURE — dérivée des vraies données */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="label">COUVERTURE DU COFFRE</h2>
          <span className="text-label text-muted">
            {STATS.domains} domaines · {STATS.resolved}/{STATS.writeups} write-ups résolus
          </span>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          <motion.div variants={item}>
            <Panel
              code="RES"
              title="Ressources / domaine"
              right={<span className="font-mono text-label text-muted">Σ {RES_TOTAL}</span>}
            >
              <CoverageBars entries={COVERAGE_BY_DOMAIN} />
            </Panel>
          </motion.div>
          <motion.div variants={item}>
            <Panel
              code="ARS"
              title="Arsenal / phase kill-chain"
              right={<span className="font-mono text-label text-muted">Σ {ARS_TOTAL}</span>}
            >
              <CoverageBars entries={COVERAGE_BY_PHASE} />
            </Panel>
          </motion.div>
        </motion.div>
      </section>

      {/* MODULES */}
      <section>
        <h2 className="label mb-4">MODULES</h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {MODULES.map((m) => (
            <motion.div key={m.href} variants={item}>
              <Link
                href={m.href}
                className="focus-ring group block rounded-md border border-line bg-surface p-5 transition-[transform,border-color] duration-base ease-out-soft hover:-translate-y-0.5 hover:border-line-strong"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="label text-primary">{m.code}</span>
                  <span className="text-muted transition-colors duration-fast ease-out-soft group-hover:text-secondary">
                    →
                  </span>
                </div>
                <h3 className="mb-2 font-display text-h3 text-ink-strong">{m.title}</h3>
                <p className="text-body-sm text-muted">{m.desc}</p>
                <div className="mt-4 border-t border-line-subtle pt-3 text-label text-muted">
                  {m.meta}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TERMINAL + SIDEBAR */}
      <section id="terminal" className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="label mb-4">SHELL RAPIDE</h2>
          <FakeTerminal />
        </div>

        <div className="space-y-8">
          {/* Derniers write-ups */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="label">DERNIERS WRITE-UPS</h2>
              <Link
                href="/writeups"
                className="focus-ring rounded-sm text-label text-muted transition-colors duration-fast ease-out-soft hover:text-secondary"
              >
                tout voir →
              </Link>
            </div>
            {WRITEUPS.length === 0 ? (
              <Panel>
                <p className="text-center font-mono text-body-sm text-muted">
                  [ aucun write-up pour l&apos;instant ]
                </p>
                <p className="mt-1 text-center text-label text-muted">
                  à compléter au fil des machines résolues.
                </p>
              </Panel>
            ) : (
              <ul className="space-y-2">
                {WRITEUPS.slice(0, 5).map((w) => (
                  <li key={w.id}>
                    <Link
                      href="/writeups"
                      className="focus-ring block rounded-md border border-line bg-surface p-3 transition-[transform,border-color] duration-base ease-out-soft hover:-translate-y-0.5 hover:border-line-strong"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-body-sm text-ink">{w.name}</span>
                        <Badge variant={DIFF_BADGE[w.difficulty]}>{w.difficulty}</Badge>
                      </div>
                      <div className="mt-1 font-mono text-label text-muted">
                        {w.platform} · {w.category}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CVE récentes */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="label">CVE RÉCENTES</h2>
              <Link
                href="/veille"
                className="focus-ring rounded-sm text-label text-muted transition-colors duration-fast ease-out-soft hover:text-secondary"
              >
                veille →
              </Link>
            </div>
            {/* Distribution de sévérité — barre empilée + légende */}
            <div className="mb-3 rounded-md border border-line bg-surface p-3">
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-base">
                {SEV_COUNTS.filter((x) => x.n > 0).map((x) => (
                  <div key={x.s} className={SEV_BAR[x.s]} style={{ flex: x.n }} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {SEV_COUNTS.map((x) => (
                  <span key={x.s} className="inline-flex items-center gap-1.5 text-label text-muted">
                    <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${SEV_BAR[x.s]}`} />
                    {x.s} {x.n}
                  </span>
                ))}
              </div>
            </div>

            <ul className="space-y-2">
              {CVES.slice(0, 5).map((c) => (
                <li key={c.id} className="rounded-md border border-line bg-surface p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-body-sm text-ink">{c.id}</span>
                    <span className={`font-mono text-body-sm font-bold tabular-nums ${SEV_SCORE[c.severity]}`}>
                      {c.score.toFixed(1)}
                    </span>
                  </div>
                  {/* Jauge CVSS (score / 10) */}
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-base" aria-hidden>
                    <div
                      className={`h-full rounded-full ${SEV_BAR[c.severity]}`}
                      style={{ width: `${(c.score / 10) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-body-sm text-muted">{c.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  accent = "neutral",
  variant,
}: {
  value: number;
  label: string;
  accent?: "neutral" | "danger";
  variant: Variants;
}) {
  const color = accent === "danger" ? "text-danger" : "text-ink-strong";
  return (
    <motion.div variants={variant} className="bg-surface px-5 py-6 text-center">
      <div className={`font-display text-h1 font-bold tabular-nums ${color}`}>
        <CountUp value={value} pad={0} />
      </div>
      <div className="label mt-2 justify-center">{label}</div>
    </motion.div>
  );
}
