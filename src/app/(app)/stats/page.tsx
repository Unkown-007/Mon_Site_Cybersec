"use client";

import { PageHeader } from "@/components/PageHeader";
import { Panel, Badge } from "@/components/ui";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CountUp } from "@/components/animations/CountUp";
import {
  OPERATOR,
  XP_BREAKDOWN,
  SKILLS,
  ACHIEVEMENTS,
  ACHIEVEMENTS_BY_RARITY,
  OPERATOR_XP,
  TOTALS,
  RES_BY_DOMAIN,
  RES_BY_TYPE,
  TOOLS_BY_PHASE,
  CVE_TOP_VENDORS,
  CVE_AVG,
  TOP_TAGS,
  type Skill,
  type Rarity,
} from "@/lib/stats";
import { CVES } from "@/data/mock";

const SEV = [
  { k: "CRITICAL", color: "#ff3d60" },
  { k: "HIGH", color: "#febc2e" },
  { k: "MEDIUM", color: "#00f5d4" },
  { k: "LOW", color: "#818aa8" },
] as const;

const RARITY_STYLE: Record<Rarity, { text: string; border: string; dot: string }> = {
  commun: { text: "text-muted", border: "border-line-strong", dot: "bg-muted" },
  rare: { text: "text-secondary", border: "border-secondary/50", dot: "bg-secondary" },
  épique: { text: "text-primary", border: "border-primary/50", dot: "bg-primary" },
  légendaire: { text: "text-warning", border: "border-warning/60", dot: "bg-warning" },
};

export default function StatsPage() {
  const rank = OPERATOR.rank;
  const xpParts = [
    { label: "Write-ups", v: XP_BREAKDOWN.writeups },
    { label: "Ressources", v: XP_BREAKDOWN.resources },
    { label: "Arsenal", v: XP_BREAKDOWN.arsenal },
    { label: "Intel", v: XP_BREAKDOWN.intel },
  ];
  const xpMax = Math.max(...xpParts.map((p) => p.v), 1);
  const sevCounts = SEV.map((s) => ({ ...s, n: CVES.filter((c) => c.severity === s.k).length }));

  return (
    <div>
      <PageHeader
        code="STA // TÉLÉMÉTRIE"
        title="Statistiques"
        desc="Progression opérateur, couverture et veille — calculées à partir des données réelles du coffre."
        right={
          <Badge variant="signal" dot>
            {OPERATOR.achievements}/{OPERATOR.achievementsTotal} hauts faits
          </Badge>
        }
      />

      {/* Totaux */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <Tile label="Ressources" value={TOTALS.resources} />
        <Tile label="Outils" value={TOTALS.tools} />
        <Tile label="Scripts" value={TOTALS.scripts} />
        <Tile label="CVE" value={TOTALS.cves} accent="text-danger" />
        <Tile label="Domaines" value={TOTALS.domains} sub={`/ 8`} />
        <Tile label="Phases" value={TOTALS.phases} sub={`/ 5`} />
        <Tile label="Tags" value={TOTALS.tags} />
        <Tile label="Éditeurs" value={TOTALS.vendors} />
      </div>

      {/* Rang + XP */}
      <Panel className="mb-6">
        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="label text-secondary">{rank.current.code}</span>
              <h2 className="mt-1 font-display text-h2 text-ink-strong">{rank.current.title}</h2>
            </div>
            <div className="text-right">
              <div className="font-display text-h1 text-secondary">
                <CountUp value={OPERATOR_XP} pad={0} />
              </div>
              <span className="label !text-muted">XP total</span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-line">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${rank.progress * 100}%` }}
            />
          </div>
          <p className="mt-2 text-label text-muted">
            {rank.next ? `${rank.into} / ${rank.span} XP vers ${rank.next.title}` : "Rang maximal atteint"}
          </p>
        </div>
      </Panel>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel code="SKL" title="Compétences par domaine">
          <SkillRadar skills={SKILLS} />
        </Panel>

        <div className="space-y-6">
          <Panel code="XP" title="Répartition de l'XP">
            <ul className="space-y-3">
              {xpParts.map((p) => (
                <li key={p.label}>
                  <div className="mb-1 flex justify-between text-body-sm">
                    <span className="text-ink">{p.label}</span>
                    <span className="font-mono text-muted">{Math.round(p.v)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded bg-line">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${(p.v / xpMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel code="CVE" title="Sévérité des CVE suivies">
            <div className="flex items-center gap-5">
              <Donut segments={sevCounts.filter((s) => s.n > 0)} total={CVES.length} />
              <ul className="flex-1 space-y-1.5 text-body-sm">
                {sevCounts.map((s) => (
                  <li key={s.k} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted">{s.k}</span>
                    <span className="ml-auto font-mono text-ink">{s.n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>

      {/* Répartitions détaillées */}
      <ScrollReveal>
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Panel code="RES" title="Ressources par domaine">
            <Bars data={RES_BY_DOMAIN} />
          </Panel>
          <div className="space-y-6">
            <Panel code="ARS" title="Outils par phase (kill-chain)">
              <Bars data={TOOLS_BY_PHASE} />
            </Panel>
            <Panel code="TYP" title="Ressources par type">
              <Bars data={RES_BY_TYPE} />
            </Panel>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <Panel code="CVE" title="Top éditeurs suivis" className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-display text-h1 text-secondary">{CVE_AVG}</span>
            <span className="label !text-muted">score CVSS moyen</span>
          </div>
          <Bars data={CVE_TOP_VENDORS} />
        </Panel>
      </ScrollReveal>

      <ScrollReveal>
        <Panel code="TAG" title="Tags les plus utilisés" className="mb-6">
          <div className="flex flex-wrap gap-2">
            {TOP_TAGS.map((t) => (
              <span key={t.label} className="clip-chamfer-sm border border-line-strong px-2.5 py-1 font-mono text-xs text-muted">
                {t.label} <span className="text-secondary">{t.count}</span>
              </span>
            ))}
          </div>
        </Panel>
      </ScrollReveal>

      {/* Hauts faits */}
      <ScrollReveal>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="label">
              HAUTS FAITS · {OPERATOR.achievements}/{ACHIEVEMENTS.length}
            </h2>
            <div className="flex flex-wrap gap-3">
              {ACHIEVEMENTS_BY_RARITY.map((r) => (
                <span key={r.rarity} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1px] text-muted">
                  <span className={`h-2 w-2 rounded-full ${RARITY_STYLE[r.rarity].dot}`} />
                  {r.rarity} {r.unlocked}/{r.total}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((a) => {
              const st = RARITY_STYLE[a.rarity];
              return (
                <div key={a.id} className={`card flex items-start gap-3 p-4 ${a.unlocked ? st.border : "opacity-45"}`}>
                  <span className={`text-2xl ${a.unlocked ? st.text : "text-muted"}`}>{a.glyph}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-sm text-ink-strong">{a.name}</span>
                      {a.unlocked && <span className="text-[9px] text-success">✓</span>}
                    </div>
                    <p className="mt-0.5 text-label text-muted">{a.desc}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[8px] font-mono uppercase tracking-[1px] ${st.text}`}>{a.rarity}</span>
                      <span className="font-mono text-[9px] text-muted">{a.progress}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

function Tile({ label, value, sub, accent = "text-ink-strong" }: { label: string; value: number; sub?: string; accent?: string }) {
  return (
    <div className="hud-panel px-4 py-4 text-center">
      <div className={`font-display text-h2 tabular-nums ${accent}`}>
        <CountUp value={value} pad={0} />
        {sub && <span className="text-body-sm text-muted"> {sub}</span>}
      </div>
      <div className="label mt-1 justify-center">{label}</div>
    </div>
  );
}

function Bars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between text-body-sm">
            <span className="text-ink">{d.label}</span>
            <span className="font-mono text-muted">{d.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded bg-line">
            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SkillRadar({ skills }: { skills: Skill[] }) {
  const n = skills.length;
  const cx = 130;
  const cy = 122;
  const R = 92;
  const pt = (i: number, r: number): [number, number] => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const ring = (f: number) => skills.map((_, i) => pt(i, f * R).join(",")).join(" ");
  const shape = skills.map((s, i) => pt(i, (s.level / 100) * R).join(",")).join(" ");

  return (
    <svg viewBox="0 0 260 250" className="mx-auto w-full max-w-[320px]">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="rgba(123,92,240,0.14)" />
      ))}
      {skills.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(123,92,240,0.1)" />;
      })}
      <polygon points={shape} fill="rgba(0,245,212,0.16)" stroke="#00f5d4" strokeWidth="1.5" />
      {skills.map((s, i) => {
        const [x, y] = pt(i, (s.level / 100) * R);
        return <circle key={i} cx={x} cy={y} r="2" fill="#00f5d4" />;
      })}
      {skills.map((s, i) => {
        const [x, y] = pt(i, R + 15);
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize="8"
            fill="#818aa8"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

function Donut({ segments, total }: { segments: { color: string; n: number }[]; total: number }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const t = Math.max(total, 1);
  let acc = 0;
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0">
      <circle cx="60" cy="60" r={R} fill="none" stroke="var(--line)" strokeWidth="16" />
      <g transform="rotate(-90 60 60)">
        {segments.map((s, i) => {
          const frac = s.n / t;
          const dash = frac * C;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc * C}
            />
          );
          acc += frac;
          return el;
        })}
      </g>
      <text x="60" y="58" fontSize="20" fill="#e9ecf6" textAnchor="middle" className="font-display">
        {total}
      </text>
      <text x="60" y="74" fontSize="8" fill="#818aa8" textAnchor="middle" className="font-mono">
        CVE
      </text>
    </svg>
  );
}
