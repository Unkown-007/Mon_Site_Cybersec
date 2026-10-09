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
import { RevealText } from "@/components/animations/RevealText";
import { XLogo } from "@/components/XLogo";
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
    show: { transition: { staggerChildren: disableAnimation ? 0 : 0.06 } },
  };
  const item: Variants = {
    hidden: disableAnimation ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: disableAnimation ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const name = user?.name ?? "l'opérateur";

  return (
    <div className="space-y-20 lg:space-y-28">
      {/* HERO */}
      <section className="grid items-center gap-10 pt-2 lg:grid-cols-[1.25fr_1fr] lg:pt-4">
        <div>
          <div className="mb-7 animate-fade-in">
            <span className="chip">
              <StatusDot state="online" />
              <span className="text-ink">Système opérationnel</span>
            </span>
          </div>
          <h1 className="max-w-3xl font-display text-display font-bold text-ink-strong">
            <RevealText text="Centre de commande" wordClassName="text-gradient-soft" />{" "}
            <RevealText text="cyber" delay={3} wordClassName="text-gradient-primary pr-1" />
            <br />
            <RevealText text={`de ${name}.`} delay={4} wordClassName="text-gradient-soft" />
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-[17px] leading-relaxed text-muted stagger-4">
            Ressources, write-ups CTF, arsenal d&apos;outils et veille threat-intel — réunis dans un
            espace de travail unique, rapide et chiffré.
          </p>
          <div className="mt-9 flex animate-fade-up flex-wrap gap-3 stagger-5">
            <Link href="/resources" className="btn btn-primary focus-ring !px-5 !py-3">
              Accéder aux ressources
              <span aria-hidden="true">→</span>
            </Link>
            <button type="button" onClick={openTerminal} className="btn btn-ghost focus-ring !px-5 !py-3">
              <span className="font-mono text-secondary">❯_</span> Ouvrir le terminal
            </button>
          </div>
        </div>

        <HeroEmblem />
      </section>

      {/* STATS */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <Stat value={STATS.resources} label="Ressources indexées" variant={item} />
        <Stat value={STATS.writeups} label="Write-ups publiés" variant={item} />
        <Stat value={STATS.tools} label="Outils en arsenal" variant={item} />
        <Stat value={STATS.cves} label="CVE suivies" accent="danger" variant={item} />
      </motion.section>

      {/* COMPTES — données externes réelles */}
      <AccountsPanel />

      {/* COUVERTURE — dérivée des vraies données */}
      <ScrollReveal>
        <section>
          <SectionHead
            eyebrow="Couverture du coffre"
            title="Couverture"
            right={`${STATS.domains} domaines · ${STATS.resolved}/${STATS.writeups} write-ups résolus`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel
              code="RES"
              title="Ressources par domaine"
              right={<span className="font-mono text-xs text-muted">Σ {RES_TOTAL}</span>}
            >
              <CoverageBars entries={COVERAGE_BY_DOMAIN} />
            </Panel>
            <Panel
              code="ARS"
              title="Arsenal par phase kill-chain"
              right={<span className="font-mono text-xs text-muted">Σ {ARS_TOTAL}</span>}
            >
              <CoverageBars entries={COVERAGE_BY_PHASE} accent="var(--secondary)" />
            </Panel>
          </div>
        </section>
      </ScrollReveal>

      {/* MODULES */}
      <ScrollReveal>
        <section>
          <SectionHead eyebrow="Modules" title="Accès rapide" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m) => (
              <ModuleCard
                key={m.href}
                href={m.href}
                code={m.code}
                title={m.title}
                desc={m.desc}
                meta={m.meta}
                accent={m.code === "INT" ? "secondary" : "primary"}
                icon={MODULE_ICONS[m.code]}
              />
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* TERMINAL + SIDEBAR */}
      <ScrollReveal>
        <section id="terminal" className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHead eyebrow="Shell rapide" title="Terminal" />
            <FakeTerminal />
          </div>

          <div className="space-y-10">
            {/* Derniers write-ups */}
            <div>
              <SideHead title="Derniers write-ups" href="/writeups" link="Tout voir" />
              {WRITEUPS.length === 0 ? (
                <div className="card flex flex-col items-center p-8 text-center">
                  <span className="icon-tile mb-3">{MODULE_ICONS.WUP}</span>
                  <p className="text-sm text-ink">Aucun write-up pour l&apos;instant</p>
                  <p className="mt-1 text-xs text-muted">À compléter au fil des machines résolues.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {WRITEUPS.slice(0, 5).map((w) => (
                    <li key={w.id}>
                      <Link href="/writeups" className="card focus-ring block p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-ink-strong">{w.name}</span>
                          <Badge variant={DIFF_BADGE[w.difficulty]}>{w.difficulty}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted">
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
              <SideHead title="CVE récentes" href="/veille" link="Veille" />
              {/* Distribution de sévérité — barre empilée + légende */}
              <div className="card mb-3 p-4">
                <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
                  {SEV_COUNTS.filter((x) => x.n > 0).map((x) => (
                    <div key={x.s} className={`${SEV_BAR[x.s]} rounded-full`} style={{ flex: x.n }} />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {SEV_COUNTS.map((x) => (
                    <span key={x.s} className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <span aria-hidden className={`h-2 w-2 rounded-full ${SEV_BAR[x.s]}`} />
                      <span className="capitalize">{x.s.toLowerCase()}</span>
                      <span className="font-mono text-ink">{x.n}</span>
                    </span>
                  ))}
                </div>
              </div>

              <ul className="space-y-2">
                {CVES.slice(0, 5).map((c) => (
                  <li key={c.id} className="card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[13px] text-ink-strong">{c.id}</span>
                      <span
                        className={`rounded-lg bg-white/[0.05] px-2 py-0.5 font-mono text-[13px] font-semibold tabular-nums ${SEV_SCORE[c.severity]}`}
                      >
                        {c.score.toFixed(1)}
                      </span>
                    </div>
                    {/* Jauge CVSS (score / 10) */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
                      <div
                        className={`h-full rounded-full ${SEV_BAR[c.severity]}`}
                        style={{ width: `${(c.score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-muted">{c.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

/* Emblème du hero : logo flottant, anneaux en orbite (transform → GPU). */
function HeroEmblem() {
  return (
    <div aria-hidden="true" className="relative hidden h-[360px] lg:block">
      <div className="absolute inset-0 grid place-items-center">
        <div className="absolute h-[260px] w-[260px] rounded-full bg-[radial-gradient(closest-side,rgba(123,92,240,0.38),rgba(0,245,212,0.08)_60%,transparent)]" />
        <div className="hero-ring h-[340px] w-[340px]" />
        <div className="hero-ring hero-ring--reverse h-[250px] w-[250px]" />
        <div className="hero-ring hero-ring--slow h-[170px] w-[170px] border-dashed" />
        <div className="hero-float">
          <XLogo size={124} />
        </div>
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <span className="label">{eyebrow}</span>
      <div className="mt-2.5 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-h2 font-bold text-ink-strong">{title}</h2>
        {right ? <div className="shrink-0 pb-1 text-xs text-muted">{right}</div> : null}
      </div>
      <div className="divider-gradient mt-4" />
    </div>
  );
}

function SideHead({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-lg font-semibold text-ink-strong">{title}</h2>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-white/[0.05] hover:text-ink-strong focus-ring"
      >
        {link}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </Link>
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
  const gradient = accent === "danger" ? "from-danger to-[#ff7ac4]" : "from-primary to-secondary";
  return (
    <motion.div variants={variant} className="hud-panel hud-panel--interactive p-5 sm:p-6">
      <div className="text-xs text-muted">{label}</div>
      <div
        className={`mt-2 font-display text-4xl font-bold tabular-nums tracking-tight sm:text-5xl ${
          accent === "danger" ? "text-[#ff8098]" : "text-ink-strong"
        }`}
      >
        <CountUp value={value} pad={0} />
      </div>
      <div className={`mt-4 h-1 w-14 rounded-full bg-gradient-to-r ${gradient}`} />
    </motion.div>
  );
}
