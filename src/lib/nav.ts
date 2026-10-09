/*
 * Plan du site — source unique pour la navbar, le tiroir mobile, la palette
 * Ctrl+K, les raccourcis clavier, le terminal et la carte « Explorer » du
 * dashboard. Les pages sont rangées par USAGE (apprendre / outiller /
 * pratiquer / surveiller / communauté) ; les URL ne changent pas.
 */

export interface NavItem {
  href: string;
  label: string;
  code: string;
  desc: string;
  /** Raccourci clavier : « g » puis cette touche. */
  key?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  desc: string;
  hrefs: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", code: "DSH", desc: "Vue d'ensemble, épingles et direct", key: "d" },

  { href: "/learn", label: "Plateformes", code: "LRN", desc: "Labs & sites d'entraînement", key: "a" },
  { href: "/resources", label: "Ressources", code: "RES", desc: "Base de connaissances filtrable", key: "r" },
  { href: "/reference", label: "Mémento", code: "REF", desc: "Ports, codes HTTP, hashes", key: "f" },
  { href: "/certifications", label: "Certifications", code: "CRT", desc: "Roadmap et badges obtenus", key: "c" },

  { href: "/toolkit", label: "Toolkit", code: "KIT", desc: "Encodeurs, hash, JWT, CVSS…", key: "k" },
  { href: "/playground", label: "Playground", code: "PLG", desc: "Réseau, regex, epoch, bases", key: "p" },
  { href: "/tools", label: "Mes scripts", code: "TLS", desc: "Scripts perso & boîte à outils", key: "s" },
  { href: "/arsenal", label: "Annuaire d'outils", code: "ARS", desc: "Outils open-source par catégorie", key: "o" },
  { href: "/hardware", label: "Hardware", code: "HW", desc: "Projets ESP32 & électronique", key: "h" },

  { href: "/lab", label: "Lab", code: "LAB", desc: "Session en cours, chrono, notes", key: "l" },
  { href: "/writeups", label: "Write-ups", code: "WUP", desc: "Comptes-rendus de machines", key: "w" },
  { href: "/stats", label: "Progression", code: "STA", desc: "Stats, couverture, hauts faits", key: "t" },

  { href: "/veille", label: "CVE & veille", code: "INT", desc: "Flux NVD, KEV, bookmarks", key: "v" },
  { href: "/news", label: "Actualités", code: "NWS", desc: "Flux RSS cyber en direct", key: "n" },
  { href: "/map", label: "Carte des attaques", code: "MAP", desc: "Sources d'attaques du jour", key: "m" },
  { href: "/events", label: "Agenda & CTF", code: "EVT", desc: "Prochains CTF et conférences", key: "e" },
  { href: "/ai", label: "Assistant IA", code: "AI", desc: "Chat avec ta propre clé API", key: "i" },

  { href: "/profile", label: "Profil", code: "PRF", desc: "Identité, unlocks, amis", key: "u" },
  { href: "/team", label: "Équipe", code: "TEAM", desc: "Escouade et unlocks partagés", key: "q" },
  { href: "/leaderboard", label: "Classement", code: "LDR", desc: "Classement des opérateurs", key: "b" },

  { href: "/vault", label: "Vault", code: "VLT", desc: "Coffre chiffré côté client", key: "x" },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "learn",
    label: "Apprendre",
    desc: "Se former et retrouver l'info",
    hrefs: ["/learn", "/resources", "/reference", "/certifications"],
  },
  {
    id: "tools",
    label: "Outils",
    desc: "Tout ce qui tourne dans le navigateur",
    hrefs: ["/toolkit", "/playground", "/tools", "/arsenal", "/hardware"],
  },
  {
    id: "practice",
    label: "Pratique",
    desc: "Sessions, write-ups et progression",
    hrefs: ["/lab", "/writeups", "/stats"],
  },
  {
    id: "intel",
    label: "Veille",
    desc: "Ce qui se passe en ce moment",
    hrefs: ["/veille", "/news", "/map", "/events", "/ai"],
  },
  {
    id: "social",
    label: "Communauté",
    desc: "Profil, équipe, classement",
    hrefs: ["/profile", "/team", "/leaderboard"],
  },
];

export const ADMIN_ITEM: NavItem = {
  href: "/admin",
  label: "Admin",
  code: "ADM",
  desc: "Panneau d'administration",
};

export function navItem(href: string): NavItem {
  return NAV_ITEMS.find((n) => n.href === href) ?? (href === ADMIN_ITEM.href ? ADMIN_ITEM : NAV_ITEMS[0]);
}

/** Libellé lisible d'un chemin (y compris sous-routes et routes inconnues). */
export function labelForPath(path: string): string {
  const exact = NAV_ITEMS.find((n) => n.href === path) ?? (path === ADMIN_ITEM.href ? ADMIN_ITEM : null);
  if (exact) return exact.label;
  const parent = NAV_ITEMS.filter((n) => n.href !== "/" && path.startsWith(n.href + "/"))[0];
  return parent ? parent.label : path;
}
