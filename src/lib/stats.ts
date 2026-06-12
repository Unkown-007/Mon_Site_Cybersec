/*
 * Dérivation du "dossier opérateur" — rang, XP, compétences et badges,
 * calculés intégralement à partir des vraies données du coffre (mock.ts).
 * Aucune valeur en dur : tout évolue quand tu ajoutes des write-ups,
 * ressources, outils ou CVE.
 */

import {
  RESOURCES,
  WRITEUPS,
  EXTERNAL_TOOLS,
  SCRIPTS,
  CVES,
  DOMAINS,
  PHASES,
  type Domain,
} from "@/data/mock";

/* ── XP ───────────────────────────────────────────────────────────────── */

const DIFF_XP: Record<string, number> = {
  Easy: 50,
  Medium: 120,
  Hard: 250,
  Insane: 500,
};

export const XP_BREAKDOWN = {
  writeups: WRITEUPS.reduce(
    (sum, w) => sum + (DIFF_XP[w.difficulty] ?? 0) * (w.status === "résolu" ? 1 : 0.4),
    0,
  ),
  resources: RESOURCES.length * 8,
  arsenal: (EXTERNAL_TOOLS.length + SCRIPTS.length) * 4,
  intel: CVES.length * 5,
};

export const OPERATOR_XP = Math.round(
  XP_BREAKDOWN.writeups + XP_BREAKDOWN.resources + XP_BREAKDOWN.arsenal + XP_BREAKDOWN.intel,
);

/* ── Rangs ────────────────────────────────────────────────────────────── */

export interface Rank {
  threshold: number;
  title: string;
  code: string;
}

export const RANKS: Rank[] = [
  { threshold: 0, title: "Recrue", code: "R-00" },
  { threshold: 600, title: "Opérateur", code: "OP-01" },
  { threshold: 1400, title: "Agent de terrain", code: "AG-02" },
  { threshold: 2600, title: "Spectre", code: "GH-03" },
  { threshold: 4200, title: "Architecte", code: "AR-04" },
  { threshold: 6500, title: "Légende 077", code: "LG-077" },
];

export function getRankProgress(xp: number) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].threshold) idx = i;
  const current = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const span = next ? next.threshold - current.threshold : 1;
  const into = xp - current.threshold;
  const progress = next ? Math.min(1, into / span) : 1;
  return { current, next, progress, into, span };
}

/* ── Compétences par domaine (radar) ──────────────────────────────────── */

// Catégories de write-ups rattachées à un domaine de ressources.
const CAT_TO_DOMAIN: Record<string, Domain> = {
  Web: "Web",
  Pwn: "Reverse",
  AD: "Réseau",
  Réseau: "Réseau",
  Crypto: "Crypto",
};

export interface Skill {
  label: Domain;
  level: number; // 0–100
  resources: number;
  writeups: number;
}

export const SKILLS: Skill[] = (() => {
  const raw = DOMAINS.map((d) => {
    const resources = RESOURCES.filter((r) => r.domain === d).length;
    const writeups = WRITEUPS.filter((w) => CAT_TO_DOMAIN[w.category] === d).length;
    const score = resources * 1 + writeups * 1.6;
    return { label: d, score, resources, writeups };
  });
  const max = Math.max(1, ...raw.map((r) => r.score));
  return raw.map((r) => ({
    label: r.label,
    resources: r.resources,
    writeups: r.writeups,
    // normalisé sur le domaine le plus fourni, plancher à 18 pour garder une forme.
    level: Math.round(18 + (r.score / max) * 82),
  }));
})();

/* ── Badges / hauts faits ─────────────────────────────────────────────── */

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  glyph: string;
  unlocked: boolean;
  progress: string; // ex. "7/8"
}

const resolved = WRITEUPS.filter((w) => w.status === "résolu").length;
const domainsCovered = DOMAINS.filter((d) => RESOURCES.some((r) => r.domain === d)).length;
const phasesCovered = PHASES.filter((p) => EXTERNAL_TOOLS.some((t) => t.phase === p)).length;
const scriptLangs = new Set(SCRIPTS.map((s) => s.lang)).size;
const adWriteups = WRITEUPS.filter((w) => w.category === "AD").length;
const cryptoWriteups = WRITEUPS.filter((w) => w.category === "Crypto").length;
const criticalCves = CVES.filter((c) => c.severity === "CRITICAL").length;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-blood",
    name: "Première intrusion",
    desc: "Résoudre un premier write-up.",
    glyph: "⚑",
    unlocked: resolved >= 1,
    progress: `${Math.min(resolved, 1)}/1`,
  },
  {
    id: "box-breaker",
    name: "Briseur de boîtes",
    desc: "Publier 10 write-ups.",
    glyph: "▣",
    unlocked: WRITEUPS.length >= 10,
    progress: `${Math.min(WRITEUPS.length, 10)}/10`,
  },
  {
    id: "librarian",
    name: "Bibliothécaire",
    desc: "Indexer 40 ressources.",
    glyph: "❒",
    unlocked: RESOURCES.length >= 40,
    progress: `${Math.min(RESOURCES.length, 40)}/40`,
  },
  {
    id: "polymath",
    name: "Touche-à-tout",
    desc: "Couvrir les 8 domaines avec au moins une ressource.",
    glyph: "✦",
    unlocked: domainsCovered >= DOMAINS.length,
    progress: `${domainsCovered}/${DOMAINS.length}`,
  },
  {
    id: "arsenal",
    name: "Arsenal complet",
    desc: "Référencer 50 outils externes.",
    glyph: "⚔",
    unlocked: EXTERNAL_TOOLS.length >= 50,
    progress: `${Math.min(EXTERNAL_TOOLS.length, 50)}/50`,
  },
  {
    id: "scripter",
    name: "Scripteur",
    desc: "Écrire 10 scripts personnels.",
    glyph: "⌨",
    unlocked: SCRIPTS.length >= 10,
    progress: `${Math.min(SCRIPTS.length, 10)}/10`,
  },
  {
    id: "polyglot",
    name: "Polyglotte",
    desc: "Scripter dans au moins 3 langages.",
    glyph: "❖",
    unlocked: scriptLangs >= 3,
    progress: `${Math.min(scriptLangs, 3)}/3`,
  },
  {
    id: "killchain",
    name: "Kill-chain",
    desc: "Couvrir les 5 phases d'attaque.",
    glyph: "⛓",
    unlocked: phasesCovered >= PHASES.length,
    progress: `${phasesCovered}/${PHASES.length}`,
  },
  {
    id: "threat-hunter",
    name: "Chasseur de failles",
    desc: "Suivre 10 CVE.",
    glyph: "☣",
    unlocked: CVES.length >= 10,
    progress: `${Math.min(CVES.length, 10)}/10`,
  },
  {
    id: "watcher",
    name: "Veilleur",
    desc: "Suivre une CVE critique (score ≥ 9).",
    glyph: "◎",
    unlocked: criticalCves >= 1,
    progress: `${Math.min(criticalCves, 1)}/1`,
  },
  {
    id: "ad-master",
    name: "Spécialiste AD",
    desc: "Résoudre 2 challenges Active Directory.",
    glyph: "🜲",
    unlocked: adWriteups >= 2,
    progress: `${Math.min(adWriteups, 2)}/2`,
  },
  {
    id: "cryptographer",
    name: "Cryptographe",
    desc: "S'attaquer à un challenge de cryptographie.",
    glyph: "🔑",
    unlocked: cryptoWriteups >= 1,
    progress: `${Math.min(cryptoWriteups, 1)}/1`,
  },
];

export const ACHIEVEMENTS_UNLOCKED = ACHIEVEMENTS.filter((a) => a.unlocked).length;

/* ── Synthèse opérateur ───────────────────────────────────────────────── */

export const OPERATOR = {
  xp: OPERATOR_XP,
  rank: getRankProgress(OPERATOR_XP),
  resolved,
  total: WRITEUPS.length,
  domainsCovered,
  phasesCovered,
  achievements: ACHIEVEMENTS_UNLOCKED,
  achievementsTotal: ACHIEVEMENTS.length,
};
