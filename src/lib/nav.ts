export interface NavItem {
  href: string;
  label: string;
  code: string;
  desc: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", code: "DSH", desc: "Vue d'ensemble du système" },
  { href: "/resources", label: "Resources", code: "RES", desc: "Base de connaissances" },
  { href: "/writeups", label: "Write-ups", code: "WUP", desc: "Comptes-rendus CTF" },
  { href: "/tools", label: "Tools", code: "TLS", desc: "Outils & scripts perso" },
  { href: "/toolkit", label: "Toolkit", code: "KIT", desc: "Utilitaires offensifs en ligne" },
  { href: "/playground", label: "Playground", code: "PLG", desc: "Outils réseau / dev / conversions" },
  { href: "/reference", label: "Référence", code: "REF", desc: "Mémento ports / HTTP / hash" },
  { href: "/arsenal", label: "Arsenal", code: "ARS", desc: "Annuaire outils red team" },
  { href: "/lab", label: "Lab", code: "LAB", desc: "Environnement d'expé" },
  { href: "/hardware", label: "Hardware", code: "HW", desc: "Projets ESP32 & élec." },
  { href: "/veille", label: "Veille", code: "INT", desc: "Threat intel & CVE" },
  { href: "/news", label: "News", code: "NWS", desc: "Actu cyber en direct" },
  { href: "/ai", label: "AI", code: "AI", desc: "Assistant IA cybersécurité" },
  { href: "/map", label: "Attack Map", code: "MAP", desc: "Carte des attaques en direct" },
  { href: "/stats", label: "Stats", code: "STA", desc: "Progression & couverture opérateur" },
  { href: "/vault", label: "Vault", code: "VLT", desc: "Zone classifiée" },
];

export const ADMIN_ITEM: NavItem = {
  href: "/admin",
  label: "Admin",
  code: "ADM",
  desc: "Panneau d'administration",
};
