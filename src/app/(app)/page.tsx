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
import { usePerf } from "@/lib/perf";
import { ModuleCard } from "@/components/ModuleCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
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

const MODULE_ICONS: Record<string, React.ReactNode> = {
  RES: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  ),
  WUP: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  TLS: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  INT: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
};


export default function Dashboard() {
  const { user } = useAuth();
  const { lite } = usePerf();
  const reduce = useReducedMotion();
  const disableAnimation = lite || (reduce ?? false);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: disableAnimation ? 0 : 0.04 } },
  };
  const item: Variants = {
    hidden: disableAnimation ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: disableAnimation ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] },
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
          Centre de commande <span className="text-gradient-primary">cyber</span>
          <br />
          de {user?.name ?? "l'opérateur"}.
        </h1>
        <p className="mt-6 max-w-2xl text-body text-muted">
          Base de ressources, write-ups CTF, arsenal d&apos;outils et veille
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
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <Stat value={STATS.resources} label="Ressources indexées" variant={item} />
        <Stat value={STATS.writeups} label="Write-ups publiés" variant={item} />
        <Stat value={STATS.tools} label="Outils en arsenal" variant={item} />
        <Stat value={STATS.cves} label="CVE suivies" accent="danger" variant={item} />
      </motion.section>

      {/* COMPTES — données externes réelles */}
      <AccountsPanel />

      {/* GRADIENT DIVIDER */}
      <div className="divider-gradient" />

      {/* COUVERTURE — dérivée des vraies données */}
      <ScrollReveal>
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
      </ScrollReveal>

      {/* GRADIENT DIVIDER */}
      <div className="divider-gradient" />

      {/* MODULES */}
      <ScrollReveal delay={100}>
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
                <ModuleCard
                  href={m.href}
                  code={m.code}
                  title={m.title}
                  desc={m.desc}
                  meta={m.meta}
                  accent={m.code === "INT" ? "secondary" : "primary"}
                  icon={MODULE_ICONS[m.code]}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      </ScrollReveal>

      {/* GRADIENT DIVIDER */}
      <div className="divider-gradient" />

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
                      className="focus-ring card block p-3"
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
            <div className="mb-3 card p-3">
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
                <li key={c.id} className="card p-3">
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
  const line = accent === "danger" ? "from-danger via-danger" : "from-secondary via-primary";
  return (
    <motion.div variants={variant} className="hud-panel hud-panel--interactive px-5 py-6 text-center">
      <div className={`font-display text-h1 font-bold tabular-nums ${color}`}>
        <CountUp value={value} pad={0} />
      </div>
      <div className={`mx-auto mt-2 h-px w-12 bg-gradient-to-r ${line} to-transparent`} />
      <div className="label mt-2 justify-center">{label}</div>
    </motion.div>
  );
}
