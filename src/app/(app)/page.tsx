"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { FakeTerminal } from "@/components/FakeTerminal";
import { StatusDot } from "@/components/StatusDot";
import { CountUp } from "@/components/animations/CountUp";
import { CoverageBars } from "@/components/CoverageBars";
import { AccountsPanel } from "@/components/AccountsPanel";
import { Panel, Badge } from "@/components/ui";
import { ModuleCard } from "@/components/ModuleCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { RevealText } from "@/components/animations/RevealText";
import { XLogo } from "@/components/XLogo";
import { NavIcon } from "@/components/NavIcon";
import { PinButton } from "@/components/PinButton";
import { CtfAgenda } from "@/components/CtfAgenda";
import { IconSearch } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { usePerf } from "@/lib/perf";
import { usePins, useRecentPages, type Pin } from "@/lib/pins";
import { NAV_GROUPS, labelForPath, navItem } from "@/lib/nav";
import { STATS, WRITEUPS, COVERAGE_BY_DOMAIN, COVERAGE_BY_PHASE } from "@/data/mock";

const openTerminal = () => window.dispatchEvent(new Event("ux077:open-terminal"));
const openPalette = () => window.dispatchEvent(new Event("ux077:open-palette"));
const openShortcuts = () => window.dispatchEvent(new Event("ux077:shortcuts"));

type BadgeVariant = "neutral" | "accent" | "signal" | "danger" | "warning" | "success";

const DIFF_BADGE: Record<string, BadgeVariant> = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
  Insane: "accent",
};

// Couleur du score CVE — sémantique uniquement.
const SEV_SCORE: Record<string, string> = {
  CRITICAL: "text-danger",
  HIGH: "text-warning",
  MEDIUM: "text-ink-strong",
  LOW: "text-muted",
};
const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const SEV_BAR: Record<string, string> = {
  CRITICAL: "bg-danger",
  HIGH: "bg-warning",
  MEDIUM: "bg-muted",
  LOW: "bg-line-strong",
};

const RES_TOTAL = COVERAGE_BY_DOMAIN.reduce((a, b) => a + b.count, 0);
const ARS_TOTAL = COVERAGE_BY_PHASE.reduce((a, b) => a + b.count, 0);

interface Cve {
  id: string;
  score: number;
  severity: string;
  vendor: string;
  summary: string;
  published?: string;
}

/* Flux CVE réel (NVD via /api/cve). `source` = "nvd" ou repli local. */
function useCveFeed() {
  const [state, setState] = useState<{ items: Cve[] | null; source: string }>({ items: null, source: "" });
  useEffect(() => {
    let alive = true;
    fetch("/api/cve")
      .then((r) => r.json())
      .then((d: { source: string; items: Cve[] }) => alive && setState({ items: d.items ?? [], source: d.source }))
      .catch(() => alive && setState({ items: [], source: "error" }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Bonne nuit";
  if (h < 18) return "Bonjour";
  return "Bonsoir";
}

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { lite } = usePerf();
  const reduce = useReducedMotion();
  const disableAnimation = lite || (reduce ?? false);
  const cve = useCveFeed();

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

  const name = user?.name ?? "opérateur";
  const today = useMemo(
    () => new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date()),
    [],
  );
  const critical = (cve.items ?? []).filter((c) => c.score >= 9).length;

  return (
    <div className="space-y-20 lg:space-y-24">
      {/* ACCUEIL */}
      <section className="grid items-center gap-10 pt-2 lg:grid-cols-[1.25fr_1fr] lg:pt-4">
        <div>
          <div className="mb-7 flex animate-fade-in flex-wrap items-center gap-2">
            <span className="chip">
              <StatusDot state="online" />
              <span className="text-ink">Système opérationnel</span>
            </span>
            <span className="chip normal-case tracking-normal">{today}</span>
          </div>
          <h1 className="max-w-3xl font-display text-display font-bold text-ink-strong">
            <RevealText text={`${greeting()},`} wordClassName="text-gradient-soft" />
            <br />
            <RevealText text={`${name}.`} delay={1} wordClassName="text-gradient-primary pr-1" />
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-[17px] leading-relaxed text-muted stagger-3">
            Ton centre de commande cyber : ressources, outils, veille en direct et coffre chiffré.
            {cve.items && critical > 0 ? (
              <>
                {" "}
                <Link href="/veille" className="text-[#ff8098] underline-offset-4 hover:underline">
                  {critical} CVE critique{critical > 1 ? "s" : ""} publiée{critical > 1 ? "s" : ""} cette semaine
                </Link>
                .
              </>
            ) : null}
          </p>

          {/* Recherche rapide (ouvre la palette) */}
          <button
            type="button"
            onClick={openPalette}
            className="glass group mt-8 flex w-full max-w-xl animate-fade-up items-center gap-3 rounded-2xl px-4 py-3.5 text-left stagger-4 transition-[box-shadow,border-color] duration-300 hover:border-primary/40 hover:shadow-[0_18px_50px_-20px_rgba(123,92,240,0.7)]"
          >
            <IconSearch size={18} className="text-muted transition-colors group-hover:text-ink-strong" />
            <span className="flex-1 text-[15px] text-muted">Rechercher une page, un outil, une ressource…</span>
            <kbd className="whitespace-nowrap rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-muted">
              Ctrl K
            </kbd>
          </button>
          <div className="mt-4 flex animate-fade-up flex-wrap items-center gap-2 text-sm stagger-5">
            <button type="button" onClick={openTerminal} className="btn btn-ghost focus-ring !py-2">
              <span className="font-mono text-secondary">❯_</span> Terminal
            </button>
            <button type="button" onClick={openShortcuts} className="btn btn-ghost focus-ring !py-2">
              <span className="font-mono text-secondary">?</span> Raccourcis
            </button>
          </div>
        </div>

        <HeroEmblem />
      </section>

      {/* REPRENDRE : épingles + récents */}
      <Resume />

      {/* STATS */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <Stat value={STATS.resources} label="Ressources indexées" variant={item} />
        <Stat value={STATS.tools} label="Outils en arsenal" variant={item} />
        <Stat value={STATS.writeups} label="Write-ups publiés" variant={item} />
        <Stat
          value={cve.items ? cve.items.length : null}
          label={cve.source === "nvd" ? "CVE publiées (7 j)" : "CVE suivies"}
          accent="danger"
          variant={item}
        />
      </motion.section>

      {/* EN DIRECT */}
      <ScrollReveal>
        <section>
          <SectionHead eyebrow="En direct" title="Ce qui se passe maintenant" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <SideHead title="CVE de la semaine" href="/veille" link="Veille" />
              <LiveCves items={cve.items} source={cve.source} />
            </div>
            <div>
              <SideHead title="Prochains CTF" href="/events" link="Agenda" />
              <CtfAgenda compact limit={5} />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* EXPLORER : plan du site */}
      <ScrollReveal>
        <section>
          <SectionHead eyebrow="Explorer" title="Toutes les rubriques" right="g + lettre pour y aller au clavier" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NAV_GROUPS.map((g) => (
              <div key={g.id} className="card hover-lift p-5">
                <div className="mb-4">
                  <div className="font-display text-lg font-semibold text-ink-strong">{g.label}</div>
                  <div className="text-sm text-muted">{g.desc}</div>
                </div>
                <ul className="space-y-1">
                  {g.hrefs.map((h) => {
                    const it = navItem(h);
                    return (
                      <li key={h}>
                        <Link
                          href={h}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.05] focus-ring"
                        >
                          <span className="icon-tile h-8 w-8 shrink-0 !rounded-[10px]">
                            <NavIcon href={h} size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-ink-strong">{it.label}</span>
                            <span className="block truncate text-xs text-muted">{it.desc}</span>
                          </span>
                          {it.key ? (
                            <kbd className="whitespace-nowrap rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted opacity-60 transition-opacity group-hover:opacity-100">
                              g {it.key}
                            </kbd>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <Link href="/vault" className="card group flex flex-col justify-between p-5 focus-ring">
              <div>
                <span className="icon-tile mb-4 h-10 w-10">
                  <NavIcon href="/vault" size={18} />
                </span>
                <div className="font-display text-lg font-semibold text-ink-strong">Vault</div>
                <div className="text-sm text-muted">Coffre chiffré AES-256-GCM, déchiffré uniquement dans ton navigateur.</div>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink transition-transform duration-300 group-hover:translate-x-1">
                Ouvrir le coffre →
              </span>
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* COUVERTURE */}
      <ScrollReveal>
        <section>
          <SectionHead
            eyebrow="Couverture du coffre"
            title="Couverture"
            right={`${STATS.domains} domaines · ${STATS.resolved}/${STATS.writeups} write-ups résolus`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel code="RES" title="Ressources par domaine" right={<span className="font-mono text-xs text-muted">Σ {RES_TOTAL}</span>}>
              <CoverageBars entries={COVERAGE_BY_DOMAIN} />
            </Panel>
            <Panel code="ARS" title="Arsenal par phase" right={<span className="font-mono text-xs text-muted">Σ {ARS_TOTAL}</span>}>
              <CoverageBars entries={COVERAGE_BY_PHASE} accent="var(--secondary)" />
            </Panel>
          </div>
        </section>
      </ScrollReveal>

      {/* COMPTES — données externes réelles */}
      <AccountsPanel />

      {/* TERMINAL + WRITE-UPS */}
      <ScrollReveal>
        <section id="terminal" className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-strong">Terminal rapide</h2>
              <button
                type="button"
                onClick={openTerminal}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-white/[0.05] hover:text-ink-strong focus-ring"
              >
                Plein écran <kbd className="font-mono text-[10px]">Ctrl ~</kbd>
              </button>
            </div>
            <FakeTerminal />
          </div>
          <div>
            <SideHead title="Derniers write-ups" href="/writeups" link="Tout voir" />
            {WRITEUPS.length === 0 ? (
              <div className="card flex flex-col items-center p-8 text-center">
                <span className="icon-tile mb-3">
                  <NavIcon href="/writeups" />
                </span>
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
        </section>
      </ScrollReveal>
    </div>
  );
}

/* « Reprendre » : épingles (pages en grandes cartes, liens externes en liste)
   et pages récemment visitées. */
function Resume() {
  const { pins } = usePins();
  const recents = useRecentPages();
  const pages = pins.filter((p) => p.kind === "page");
  const links = pins.filter((p) => p.kind !== "page");

  return (
    <section>
      <SectionHead eyebrow="Reprendre" title="Tes raccourcis" right={pins.length ? `${pins.length} épingle${pins.length > 1 ? "s" : ""}` : undefined} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {pins.length === 0 ? (
            <div className="card flex h-full flex-col items-center justify-center p-8 text-center">
              <span className="icon-tile mb-3 !text-warning">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                  <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
                </svg>
              </span>
              <p className="text-sm text-ink-strong">Aucune épingle pour l&apos;instant</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
                Clique sur l&apos;étoile à côté du titre d&apos;une page, d&apos;une ressource, d&apos;un outil ou d&apos;une
                plateforme : elle apparaîtra ici.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pages.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {pages.slice(0, 4).map((p) => (
                    <ModuleCard
                      key={p.id}
                      href={p.href}
                      code={navItem(p.href).code}
                      title={p.title}
                      desc={p.hint ?? navItem(p.href).desc}
                      icon={<NavIcon href={p.href} />}
                    />
                  ))}
                </div>
              )}
              {links.length > 0 && <PinList pins={links} />}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-ink-strong">Récemment visités</span>
            <span className="text-xs text-muted">{recents.length || ""}</span>
          </div>
          {recents.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-muted">Les pages que tu ouvres apparaîtront ici.</p>
          ) : (
            <ul className="space-y-0.5">
              {recents.map((r) => (
                <li key={r.path}>
                  <Link
                    href={r.path}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.05] focus-ring"
                  >
                    <span className="icon-tile h-8 w-8 shrink-0 !rounded-[10px]">
                      <NavIcon href={r.path} size={15} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-strong">{labelForPath(r.path)}</span>
                    <span className="shrink-0 text-xs text-muted">{ago(r.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function PinList({ pins }: { pins: Pin[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {pins.map((p) => (
        <li key={p.id} className="card group relative flex items-center gap-3 p-3">
          <span className="icon-tile h-8 w-8 shrink-0 !rounded-[10px] font-mono text-[10px]">
            {p.kind === "ressource" ? "RES" : p.kind === "outil" ? "OUT" : "PLT"}
          </span>
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 after:absolute after:inset-0 after:rounded-[inherit] focus-ring"
          >
            <span className="block truncate text-sm font-medium text-ink-strong">{p.title}</span>
            {p.hint && <span className="block truncate text-xs text-muted">{p.hint}</span>}
          </a>
          <span className="relative z-10">
            <PinButton pin={p} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function LiveCves({ items, source }: { items: Cve[] | null; source: string }) {
  if (items === null) {
    return (
      <ul className="space-y-2" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="card space-y-2.5 p-4">
            <div className="terminal-skeleton h-3.5 w-1/3" />
            <div className="terminal-skeleton h-1.5 w-full" />
            <div className="terminal-skeleton h-3 w-4/5" />
          </li>
        ))}
      </ul>
    );
  }
  const counts = SEV_ORDER.map((s) => ({ s, n: items.filter((c) => c.severity === s).length }));
  return (
    <div>
      <div className="card mb-2 p-4">
        <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
          {counts
            .filter((x) => x.n > 0)
            .map((x) => (
              <div key={x.s} className={`${SEV_BAR[x.s]} rounded-full`} style={{ flex: x.n }} />
            ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {counts.map((x) => (
            <span key={x.s} className="inline-flex items-center gap-1.5 text-xs text-muted">
              <span aria-hidden className={`h-2 w-2 rounded-full ${SEV_BAR[x.s]}`} />
              <span className="capitalize">{x.s.toLowerCase()}</span>
              <span className="font-mono text-ink">{x.n}</span>
            </span>
          ))}
          <span className={`ml-auto text-[11px] ${source === "nvd" ? "text-success" : "text-warning"}`}>
            {source === "nvd" ? "● NVD en direct" : "● données locales"}
          </span>
        </div>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 4).map((c, i) => (
          <li key={c.id} className="card animate-fade-up p-4" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center justify-between gap-2">
              <a
                href={`https://nvd.nist.gov/vuln/detail/${c.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[13px] text-ink-strong hover:text-secondary"
              >
                {c.id} ↗
              </a>
              <span className={`rounded-lg bg-white/[0.05] px-2 py-0.5 font-mono text-[13px] font-semibold tabular-nums ${SEV_SCORE[c.severity]}`}>
                {c.score.toFixed(1)}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
              <div className={`h-full rounded-full ${SEV_BAR[c.severity]}`} style={{ width: `${(c.score / 10) * 100}%` }} />
            </div>
            <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
              {c.vendor !== "n/a" && <span className="text-ink">{c.vendor} — </span>}
              {c.summary}
            </p>
          </li>
        ))}
      </ul>
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
  value: number | null;
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
        {value === null ? <span className="text-muted/50">—</span> : <CountUp value={value} pad={0} />}
      </div>
      <div className={`mt-4 h-1 w-14 rounded-full bg-gradient-to-r ${gradient}`} />
    </motion.div>
  );
}
