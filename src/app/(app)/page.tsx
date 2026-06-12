"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ModuleCard } from "@/components/ModuleCard";
import { FakeTerminal } from "@/components/FakeTerminal";
import { StatusDot } from "@/components/StatusDot";
import { CountUp } from "@/components/animations/CountUp";
import { CoverageBars } from "@/components/CoverageBars";
import { AccountsPanel } from "@/components/AccountsPanel";
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

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-success border-success/40",
  Medium: "text-warning border-warning/40",
  Hard: "text-danger border-danger/40",
  Insane: "text-primary border-primary/40",
};

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "text-danger",
  HIGH: "text-warning",
  MEDIUM: "text-secondary",
  LOW: "text-muted",
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="animate-fade-up">
        <div className="flex items-center gap-3 mb-5">
          <StatusDot state="online" />
          <span className="label text-secondary">SYSTÈME OPÉRATIONNEL</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight text-ink max-w-3xl">
          Centre de commande <span className="text-primary text-glow-primary">cyber</span>
          <br />
          de {user?.name ?? "l'opérateur"}.
        </h1>
        <p className="mt-5 max-w-2xl text-muted leading-relaxed">
          Base de ressources, write-ups CTF, arsenal d'outils et veille
          threat-intel — centralisés dans un espace de travail unique.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/resources" className="btn btn-primary">
            Accéder aux ressources
          </Link>
          <button type="button" onClick={openTerminal} className="btn btn-ghost">
            ❯_ Terminal
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line-strong border border-line-strong">
        <Stat value={STATS.resources} label="Ressources indexées" />
        <Stat value={STATS.writeups} label="Write-ups publiés" />
        <Stat value={STATS.tools} label="Outils en arsenal" />
        <Stat value={STATS.cves} label="CVE suivies" accent="danger" />
      </section>

      {/* COMPTES — données externes réelles */}
      <AccountsPanel />

      {/* COUVERTURE — dérivée des vraies données */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="label">COUVERTURE DU COFFRE</h2>
          <span className="font-mono text-[11px] text-muted">
            {STATS.domains} domaines · {STATS.resolved}/{STATS.writeups} write-ups résolus
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card corner-frame p-5">
            <div className="gui-stream label !text-secondary mb-4 pb-1">RESSOURCES / DOMAINE</div>
            <CoverageBars entries={COVERAGE_BY_DOMAIN} accent="var(--primary)" />
          </div>
          <div className="card corner-frame p-5">
            <div className="gui-stream label !text-secondary mb-4 pb-1">ARSENAL / PHASE KILL-CHAIN</div>
            <CoverageBars entries={COVERAGE_BY_PHASE} accent="var(--secondary)" />
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section>
        <h2 className="label mb-4">MODULES</h2>
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {[
            {
              href: "/resources",
              code: "RES",
              title: "Ressources",
              desc: "Cheatsheets, notes, liens — indexés et filtrables par domaine.",
              meta: `${STATS.resources} entrées`,
              accent: "primary" as const,
            },
            {
              href: "/writeups",
              code: "WUP",
              title: "Write-ups",
              desc: "Comptes-rendus CTF avec rendu Markdown et coloration.",
              meta: `${STATS.writeups} write-ups`,
              accent: "secondary" as const,
            },
            {
              href: "/tools",
              code: "TLS",
              title: "Outils",
              desc: "Scripts, one-liners et arsenal classés par phase d'attaque.",
              meta: `${STATS.tools} outils`,
              accent: "primary" as const,
            },
            {
              href: "/veille",
              code: "INT",
              title: "Veille",
              desc: "Flux CVE (NVD), bookmarks annotés et agrégateur RSS.",
              meta: `${CVES.length} CVE récentes`,
              accent: "secondary" as const,
            },
          ].map((m) => (
            <motion.div
              key={m.href}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
              }}
            >
              <ModuleCard {...m} />
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

        <div className="space-y-6">
          {/* Derniers write-ups */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="label">DERNIERS WRITE-UPS</h2>
              <Link href="/writeups" className="font-mono text-[11px] text-secondary hover:text-primary transition-colors">
                tout voir →
              </Link>
            </div>
            {WRITEUPS.length === 0 ? (
              <div className="card p-5 text-center font-mono text-xs text-muted">
                [ aucun write-up pour l&apos;instant ]
                <div className="mt-1 text-[11px]">à compléter au fil des machines résolues.</div>
              </div>
            ) : (
              <ul className="space-y-2">
                {WRITEUPS.slice(0, 5).map((w) => (
                  <li key={w.id}>
                    <Link href="/writeups" className="card block p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-ink text-sm">{w.name}</span>
                        <span className={`text-[10px] font-mono uppercase border px-1.5 py-0.5 ${DIFF_COLOR[w.difficulty]}`}>
                          {w.difficulty}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted font-mono">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="label">CVE RÉCENTES</h2>
              <Link href="/veille" className="font-mono text-[11px] text-secondary hover:text-primary transition-colors">
                veille →
              </Link>
            </div>
            <ul className="space-y-2">
              {CVES.slice(0, 5).map((c) => (
                <li key={c.id} className="card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-ink">{c.id}</span>
                    <span className={`font-mono text-xs font-bold ${SEV_COLOR[c.severity]}`}>
                      {c.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted leading-snug">{c.summary}</p>
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
  accent = "secondary",
}: {
  value: number;
  label: string;
  accent?: "secondary" | "primary" | "danger";
}) {
  const color =
    accent === "danger" ? "text-danger" : accent === "primary" ? "text-primary" : "text-secondary";
  return (
    <div className="bg-surface px-5 py-6 text-center">
      <div className={`font-display font-bold text-3xl sm:text-4xl tabular-nums ${color}`}>
        <CountUp value={value} pad={0} />
      </div>
      <div className="label mt-2 justify-center">{label}</div>
    </div>
  );
}
