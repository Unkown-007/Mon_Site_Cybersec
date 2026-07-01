import type { Rarity } from "@/lib/stats";

/*
 * Succès PERSONNELS — calculés depuis le compte de l'utilisateur (unlocks,
 * points, amis, équipe, profil). Pur, côté client.
 */

export interface PAch {
  id: string;
  name: string;
  desc: string;
  glyph: string;
  rarity: Rarity;
  unlocked: boolean;
  progress: string;
}

export interface PInput {
  solves?: { name: string; points: number; cat?: string; at: number }[];
  score?: number;
  avatar?: string;
  bio?: string;
  handle?: string;
  country?: string;
  teamId?: string;
  logins?: number;
  firstSeen?: number;
  friends: number;
  rank?: number; // position au leaderboard (1 = 1er)
}

const mk = (x: number, n: number) => `${Math.min(x, n)}/${n}`;

export function personalAchievements(a: PInput): PAch[] {
  const solves = a.solves ?? [];
  const score = a.score ?? 0;
  const cats = new Set(solves.map((s) => s.cat).filter(Boolean)).size;
  const ageDays = a.firstSeen ? (Date.now() - a.firstSeen) / 86400000 : 0;
  const bigSolve = solves.some((s) => s.points >= 500);

  return [
    { id: "welcome", name: "Bienvenue", desc: "Rejoindre la plateforme.", glyph: "✦", rarity: "commun", unlocked: true, progress: "1/1" },
    { id: "photo", name: "Photogénique", desc: "Ajouter une photo de profil.", glyph: "📷", rarity: "commun", unlocked: !!a.avatar, progress: mk(a.avatar ? 1 : 0, 1) },
    { id: "card", name: "Carte de visite", desc: "Remplir bio + pseudo.", glyph: "🪪", rarity: "commun", unlocked: !!(a.bio && a.handle), progress: mk((a.bio ? 1 : 0) + (a.handle ? 1 : 0), 2) },
    { id: "first-solve", name: "Premier sang", desc: "Premier unlock.", glyph: "⚑", rarity: "commun", unlocked: solves.length >= 1, progress: mk(solves.length, 1) },
    { id: "hunter5", name: "Chasseur", desc: "5 unlocks.", glyph: "🎯", rarity: "commun", unlocked: solves.length >= 5, progress: mk(solves.length, 5) },
    { id: "prolific", name: "Prolifique", desc: "15 unlocks.", glyph: "▣", rarity: "rare", unlocked: solves.length >= 15, progress: mk(solves.length, 15) },
    { id: "machine", name: "Machine", desc: "30 unlocks.", glyph: "⚙", rarity: "épique", unlocked: solves.length >= 30, progress: mk(solves.length, 30) },
    { id: "grinder", name: "Acharné", desc: "60 unlocks.", glyph: "◈", rarity: "légendaire", unlocked: solves.length >= 60, progress: mk(solves.length, 60) },
    { id: "bigfish", name: "Gros poisson", desc: "Un unlock à 500+ points.", glyph: "🐋", rarity: "rare", unlocked: bigSolve, progress: mk(bigSolve ? 1 : 0, 1) },
    { id: "centurion", name: "Centurion", desc: "100 points.", glyph: "⛨", rarity: "commun", unlocked: score >= 100, progress: mk(score, 100) },
    { id: "millenaire", name: "Millénaire", desc: "1000 points.", glyph: "★", rarity: "rare", unlocked: score >= 1000, progress: mk(score, 1000) },
    { id: "elite-pts", name: "Élite", desc: "2500 points.", glyph: "✷", rarity: "épique", unlocked: score >= 2500, progress: mk(score, 2500) },
    { id: "legend-pts", name: "Légende", desc: "5000 points.", glyph: "👑", rarity: "légendaire", unlocked: score >= 5000, progress: mk(score, 5000) },
    { id: "friend1", name: "Sociable", desc: "1 ami.", glyph: "🤝", rarity: "commun", unlocked: a.friends >= 1, progress: mk(a.friends, 1) },
    { id: "friend5", name: "Populaire", desc: "5 amis.", glyph: "👥", rarity: "rare", unlocked: a.friends >= 5, progress: mk(a.friends, 5) },
    { id: "friend10", name: "Réseau", desc: "10 amis.", glyph: "🕸", rarity: "épique", unlocked: a.friends >= 10, progress: mk(a.friends, 10) },
    { id: "team", name: "Équipier", desc: "Rejoindre une équipe.", glyph: "🛡", rarity: "commun", unlocked: !!a.teamId, progress: mk(a.teamId ? 1 : 0, 1) },
    { id: "complete", name: "Profil complet", desc: "Photo + bio + pseudo + pays.", glyph: "🪪", rarity: "rare", unlocked: !!(a.avatar && a.bio && a.handle && a.country), progress: mk((a.avatar ? 1 : 0) + (a.bio ? 1 : 0) + (a.handle ? 1 : 0) + (a.country ? 1 : 0), 4) },
    { id: "top10", name: "Top 10", desc: "Entrer dans le top 10 du classement.", glyph: "🔟", rarity: "rare", unlocked: !!a.rank && a.rank <= 10, progress: a.rank ? `#${a.rank}` : "—" },
    { id: "podium", name: "Podium", desc: "Atteindre le top 3.", glyph: "🏆", rarity: "épique", unlocked: !!a.rank && a.rank <= 3, progress: a.rank ? `#${a.rank}` : "—" },
    { id: "throne", name: "N°1", desc: "Prendre la tête du classement.", glyph: "👑", rarity: "légendaire", unlocked: a.rank === 1, progress: a.rank ? `#${a.rank}` : "—" },
    { id: "versatile", name: "Polyvalent", desc: "Unlocks dans 3 catégories.", glyph: "❖", rarity: "rare", unlocked: cats >= 3, progress: mk(cats, 3) },
    { id: "regular", name: "Habitué", desc: "Se connecter 10 fois.", glyph: "↻", rarity: "commun", unlocked: (a.logins ?? 0) >= 10, progress: mk(a.logins ?? 0, 10) },
    { id: "veteran", name: "Vétéran", desc: "Compte de 30 jours.", glyph: "⏳", rarity: "rare", unlocked: ageDays >= 30, progress: `${Math.min(Math.floor(ageDays), 30)}/30` },
  ];
}
