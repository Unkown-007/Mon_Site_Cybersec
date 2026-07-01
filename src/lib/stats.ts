/*
 * Dérivation du "dossier opérateur" — rang, XP, compétences et badges,
 * calculés intégralement à partir des vraies données du coffre (mock.ts).
 * Aucune valeur en dur : tout évolue quand tu ajoutes des write-ups,
 * ressources, outils ou CVE.
 */

import {
  RESOURCES,
  RESOURCE_TYPES,
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

export type Rarity = "commun" | "rare" | "épique" | "légendaire";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  glyph: string;
  rarity: Rarity;
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

/* Métriques additionnelles pour les succès. */
const resByDomain = (d: Domain) => RESOURCES.filter((r) => r.domain === d).length;
const resByType = (t: string) => RESOURCES.filter((r) => r.type === t).length;
const toolsByPhase = (p: string) => EXTERNAL_TOOLS.filter((t) => t.phase === p).length;
const cveVendors = new Set(CVES.map((c) => c.vendor)).size;
const avgCvss = CVES.length ? CVES.reduce((s, c) => s + c.score, 0) / CVES.length : 0;
const allResTypes = RESOURCE_TYPES.every((t) => resByType(t) > 0);
const tagCount = new Set(RESOURCES.flatMap((r) => r.tags)).size;
const mk = (x: number, n: number) => `${Math.min(x, n)}/${n}`;

export const ACHIEVEMENTS: Achievement[] = [
  // ── Write-ups ──
  { id: "first-blood", name: "Première intrusion", desc: "Résoudre un premier write-up.", glyph: "⚑", rarity: "commun", unlocked: resolved >= 1, progress: mk(resolved, 1) },
  { id: "box-breaker", name: "Briseur de boîtes", desc: "Publier 10 write-ups.", glyph: "▣", rarity: "rare", unlocked: WRITEUPS.length >= 10, progress: mk(WRITEUPS.length, 10) },
  { id: "box-legend", name: "Légende des boîtes", desc: "Publier 25 write-ups.", glyph: "◈", rarity: "épique", unlocked: WRITEUPS.length >= 25, progress: mk(WRITEUPS.length, 25) },
  { id: "ad-master", name: "Spécialiste AD", desc: "Résoudre 2 challenges Active Directory.", glyph: "🜲", rarity: "rare", unlocked: adWriteups >= 2, progress: mk(adWriteups, 2) },
  { id: "cryptographer", name: "Cryptographe", desc: "S'attaquer à un challenge de crypto.", glyph: "🔑", rarity: "rare", unlocked: cryptoWriteups >= 1, progress: mk(cryptoWriteups, 1) },

  // ── Ressources ──
  { id: "curator", name: "Curateur", desc: "Indexer 10 ressources.", glyph: "❒", rarity: "commun", unlocked: RESOURCES.length >= 10, progress: mk(RESOURCES.length, 10) },
  { id: "archivist", name: "Archiviste", desc: "Indexer 25 ressources.", glyph: "❑", rarity: "rare", unlocked: RESOURCES.length >= 25, progress: mk(RESOURCES.length, 25) },
  { id: "librarian", name: "Bibliothécaire", desc: "Indexer 40 ressources.", glyph: "▤", rarity: "rare", unlocked: RESOURCES.length >= 40, progress: mk(RESOURCES.length, 40) },
  { id: "grand-librarian", name: "Grand bibliothécaire", desc: "Indexer 60 ressources.", glyph: "▦", rarity: "épique", unlocked: RESOURCES.length >= 60, progress: mk(RESOURCES.length, 60) },
  { id: "eclectic", name: "Éclectique", desc: "Au moins une ressource de chaque type.", glyph: "✧", rarity: "rare", unlocked: allResTypes, progress: mk(RESOURCE_TYPES.filter((t) => resByType(t) > 0).length, RESOURCE_TYPES.length) },
  { id: "polymath", name: "Touche-à-tout", desc: "Couvrir les 8 domaines.", glyph: "✦", rarity: "épique", unlocked: domainsCovered >= DOMAINS.length, progress: mk(domainsCovered, DOMAINS.length) },
  { id: "taxonomist", name: "Taxonomiste", desc: "Utiliser 40 tags distincts.", glyph: "⌗", rarity: "rare", unlocked: tagCount >= 40, progress: mk(tagCount, 40) },

  // ── Domaines ──
  { id: "web-adept", name: "Adepte du web", desc: "10 ressources Web.", glyph: "🌐", rarity: "commun", unlocked: resByDomain("Web") >= 10, progress: mk(resByDomain("Web"), 10) },
  { id: "osint-eye", name: "Œil ouvert", desc: "5 ressources OSINT.", glyph: "◉", rarity: "commun", unlocked: resByDomain("OSINT") >= 5, progress: mk(resByDomain("OSINT"), 5) },
  { id: "reverser", name: "Rétro-ingénieur", desc: "4 ressources Reverse.", glyph: "⟲", rarity: "rare", unlocked: resByDomain("Reverse") >= 4, progress: mk(resByDomain("Reverse"), 4) },
  { id: "cloud-head", name: "Tête dans les nuages", desc: "3 ressources Cloud.", glyph: "☁", rarity: "commun", unlocked: resByDomain("Cloud") >= 3, progress: mk(resByDomain("Cloud"), 3) },
  { id: "cracker", name: "Casseur de codes", desc: "3 ressources Crypto.", glyph: "⚿", rarity: "commun", unlocked: resByDomain("Crypto") >= 3, progress: mk(resByDomain("Crypto"), 3) },
  { id: "forensicator", name: "Fouilleur", desc: "Une ressource Forensics.", glyph: "🔬", rarity: "commun", unlocked: resByDomain("Forensics") >= 1, progress: mk(resByDomain("Forensics"), 1) },

  // ── Arsenal / outils ──
  { id: "armorer", name: "Armurier", desc: "Référencer 25 outils.", glyph: "⚒", rarity: "rare", unlocked: EXTERNAL_TOOLS.length >= 25, progress: mk(EXTERNAL_TOOLS.length, 25) },
  { id: "arsenal", name: "Arsenal complet", desc: "Référencer 50 outils.", glyph: "⚔", rarity: "épique", unlocked: EXTERNAL_TOOLS.length >= 50, progress: mk(EXTERNAL_TOOLS.length, 50) },
  { id: "scout", name: "Éclaireur", desc: "6 outils de reconnaissance.", glyph: "🛰", rarity: "commun", unlocked: toolsByPhase("Recon") >= 6, progress: mk(toolsByPhase("Recon"), 6) },
  { id: "ghost-net", name: "Fantôme du réseau", desc: "5 outils de post-exploitation.", glyph: "👻", rarity: "rare", unlocked: toolsByPhase("Post-exploit") >= 5, progress: mk(toolsByPhase("Post-exploit"), 5) },
  { id: "killchain", name: "Kill-chain", desc: "Couvrir les 5 phases d'attaque.", glyph: "⛓", rarity: "épique", unlocked: phasesCovered >= PHASES.length, progress: mk(phasesCovered, PHASES.length) },
  { id: "scripter", name: "Scripteur", desc: "Écrire 10 scripts personnels.", glyph: "⌨", rarity: "rare", unlocked: SCRIPTS.length >= 10, progress: mk(SCRIPTS.length, 10) },
  { id: "polyglot", name: "Polyglotte", desc: "Scripter dans 3 langages.", glyph: "❖", rarity: "rare", unlocked: scriptLangs >= 3, progress: mk(scriptLangs, 3) },

  // ── Veille / CVE ──
  { id: "threat-hunter", name: "Chasseur de failles", desc: "Suivre 10 CVE.", glyph: "☣", rarity: "commun", unlocked: CVES.length >= 10, progress: mk(CVES.length, 10) },
  { id: "watcher", name: "Veilleur", desc: "Suivre une CVE critique.", glyph: "◎", rarity: "commun", unlocked: criticalCves >= 1, progress: mk(criticalCves, 1) },
  { id: "critical-mass", name: "Masse critique", desc: "Suivre 3 CVE critiques.", glyph: "☢", rarity: "rare", unlocked: criticalCves >= 3, progress: mk(criticalCves, 3) },
  { id: "cartographer", name: "Cartographe des menaces", desc: "CVE de 8 éditeurs distincts.", glyph: "🗺", rarity: "rare", unlocked: cveVendors >= 8, progress: mk(cveVendors, 8) },
  { id: "elite-hunter", name: "Chasseur d'élite", desc: "Score CVSS moyen ≥ 7.", glyph: "★", rarity: "épique", unlocked: avgCvss >= 7, progress: `${avgCvss.toFixed(1)}/7` },

  // ── Ressources (paliers étendus) ──
  { id: "res-80", name: "Encyclopédiste", desc: "80 ressources.", glyph: "📚", rarity: "légendaire", unlocked: RESOURCES.length >= 80, progress: mk(RESOURCES.length, 80) },
  { id: "cheatsheets", name: "Antisèche", desc: "10 cheatsheets.", glyph: "▤", rarity: "commun", unlocked: resByType("cheatsheet") >= 10, progress: mk(resByType("cheatsheet"), 10) },
  { id: "outils-type", name: "Boîte à outils", desc: "20 ressources de type outil.", glyph: "🛠", rarity: "rare", unlocked: resByType("outil") >= 20, progress: mk(resByType("outil"), 20) },
  { id: "tags-60", name: "Grand taxonomiste", desc: "60 tags distincts.", glyph: "⌗", rarity: "épique", unlocked: tagCount >= 60, progress: mk(tagCount, 60) },
  { id: "reseau-adept", name: "Maître réseau", desc: "15 ressources Réseau.", glyph: "🖧", rarity: "rare", unlocked: resByDomain("Réseau") >= 15, progress: mk(resByDomain("Réseau"), 15) },
  { id: "mobile", name: "Nomade", desc: "Une ressource Mobile.", glyph: "📱", rarity: "commun", unlocked: resByDomain("Mobile") >= 1, progress: mk(resByDomain("Mobile"), 1) },

  // ── Arsenal (paliers étendus) ──
  { id: "tools-collector", name: "Collectionneur", desc: "20 outils référencés.", glyph: "🧰", rarity: "commun", unlocked: EXTERNAL_TOOLS.length >= 20, progress: mk(EXTERNAL_TOOLS.length, 20) },
  { id: "tools-40", name: "Quincaillier", desc: "40 outils.", glyph: "🔧", rarity: "rare", unlocked: EXTERNAL_TOOLS.length >= 40, progress: mk(EXTERNAL_TOOLS.length, 40) },
  { id: "enum-master", name: "Énumérateur", desc: "5 outils d'énumération.", glyph: "🔎", rarity: "commun", unlocked: toolsByPhase("Enum") >= 5, progress: mk(toolsByPhase("Enum"), 5) },
  { id: "exploit-master", name: "Sapeur", desc: "5 outils d'exploitation.", glyph: "💥", rarity: "rare", unlocked: toolsByPhase("Exploit") >= 5, progress: mk(toolsByPhase("Exploit"), 5) },
  { id: "reporter", name: "Rapporteur", desc: "Un outil de reporting.", glyph: "📝", rarity: "commun", unlocked: toolsByPhase("Reporting") >= 1, progress: mk(toolsByPhase("Reporting"), 1) },

  // ── Veille (paliers étendus) ──
  { id: "high-cves", name: "Sentinelle", desc: "5 CVE de sévérité haute+.", glyph: "⚠", rarity: "rare", unlocked: CVES.filter((c) => c.severity === "HIGH" || c.severity === "CRITICAL").length >= 5, progress: mk(CVES.filter((c) => c.severity === "HIGH" || c.severity === "CRITICAL").length, 5) },

  // ── Rang ──
  { id: "legend-077", name: "Légende 077", desc: "Atteindre le rang maximal (6500 XP).", glyph: "👑", rarity: "légendaire", unlocked: OPERATOR_XP >= 6500, progress: mk(OPERATOR_XP, 6500) },
];

export const ACHIEVEMENTS_UNLOCKED = ACHIEVEMENTS.filter((a) => a.unlocked).length;

export const RARITY_ORDER: Rarity[] = ["commun", "rare", "épique", "légendaire"];
export const ACHIEVEMENTS_BY_RARITY = RARITY_ORDER.map((r) => ({
  rarity: r,
  total: ACHIEVEMENTS.filter((a) => a.rarity === r).length,
  unlocked: ACHIEVEMENTS.filter((a) => a.rarity === r && a.unlocked).length,
}));

/* ── Agrégats additionnels pour la page /stats ── */
export const RES_BY_TYPE = RESOURCE_TYPES.map((t) => ({ label: t, count: resByType(t) }));
export const RES_BY_DOMAIN = DOMAINS.map((d) => ({ label: d, count: resByDomain(d) })).sort((a, b) => b.count - a.count);
export const TOOLS_BY_PHASE = PHASES.map((p) => ({ label: p, count: toolsByPhase(p) }));
export const CVE_TOP_VENDORS = (() => {
  const m: Record<string, number> = {};
  for (const c of CVES) m[c.vendor] = (m[c.vendor] ?? 0) + 1;
  return Object.entries(m)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
})();
export const CVE_AVG = Math.round(avgCvss * 10) / 10;
export const TOP_TAGS = (() => {
  const m: Record<string, number> = {};
  for (const r of RESOURCES) for (const t of r.tags) m[t] = (m[t] ?? 0) + 1;
  return Object.entries(m)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
})();
export const TOTALS = {
  resources: RESOURCES.length,
  tools: EXTERNAL_TOOLS.length,
  scripts: SCRIPTS.length,
  cves: CVES.length,
  domains: domainsCovered,
  phases: phasesCovered,
  tags: tagCount,
  vendors: cveVendors,
};

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
