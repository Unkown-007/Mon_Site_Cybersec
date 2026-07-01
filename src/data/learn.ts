/*
 * Base de connaissances "apprentissage" — plateformes d'entraînement, CTF,
 * certifications et événements. Liens réels curés. Édite/complète librement.
 */

/* ═══════════════ Entraînement & labs ═══════════════ */

export type LearnCat =
  | "IA / LLM"
  | "Web"
  | "Reverse / Malware"
  | "Pwn / Crypto"
  | "OSINT"
  | "Blue team"
  | "CTF"
  | "Bug Bounty"
  | "Hardware / IoT"
  | "Médias"
  | "Général";

export type Level = "Débutant" | "Intermédiaire" | "Avancé" | "Tous";

export interface LearnItem {
  name: string;
  url: string;
  category: LearnCat;
  level: Level;
  free: boolean;
  desc: string;
}

export const LEARN_CATS: LearnCat[] = [
  "IA / LLM",
  "Web",
  "Reverse / Malware",
  "Pwn / Crypto",
  "OSINT",
  "Blue team",
  "CTF",
  "Bug Bounty",
  "Hardware / IoT",
  "Médias",
  "Général",
];

export const LEARN: LearnItem[] = [
  // ── IA / LLM ──
  { name: "Gandalf (Lakera)", url: "https://gandalf.lakera.ai/", category: "IA / LLM", level: "Débutant", free: true, desc: "Jeu d'injection de prompt : extorque le mot de passe d'un LLM, niveau par niveau." },
  { name: "Prompt Airlines (Wiz)", url: "https://promptairlines.com/", category: "IA / LLM", level: "Intermédiaire", free: true, desc: "Challenge de manipulation d'un agent IA pour obtenir un billet gratuit." },
  { name: "OWASP Top 10 for LLM", url: "https://genai.owasp.org/", category: "IA / LLM", level: "Tous", free: true, desc: "Référentiel des risques de sécurité des applications à base de LLM." },

  // ── Web ──
  { name: "Hacksplaining", url: "https://www.hacksplaining.com/", category: "Web", level: "Débutant", free: true, desc: "Leçons interactives illustrées sur les vulnérabilités web (XSS, SQLi, CSRF…)." },
  { name: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", category: "Web", level: "Tous", free: true, desc: "Labs gratuits sur toutes les failles web, par les auteurs de Burp Suite." },
  { name: "OWASP Juice Shop", url: "https://owasp.org/www-project-juice-shop/", category: "Web", level: "Débutant", free: true, desc: "Application web volontairement vulnérable, moderne et complète." },
  { name: "Google XSS Game", url: "https://xss-game.appspot.com/", category: "Web", level: "Débutant", free: true, desc: "Six niveaux progressifs pour maîtriser l'exploitation XSS." },

  // ── Reverse / Malware ──
  { name: "Malware Unicorn RE101", url: "https://malwareunicorn.org/workshops/re101.html", category: "Reverse / Malware", level: "Débutant", free: true, desc: "Workshop de référence : introduction au reverse engineering de malware." },
  { name: "Malware Unicorn RE102", url: "https://malwareunicorn.org/workshops/re102.html", category: "Reverse / Malware", level: "Intermédiaire", free: true, desc: "Suite de RE101 : désobfuscation, packers, techniques anti-analyse." },
  { name: "crackmes.one", url: "https://crackmes.one/", category: "Reverse / Malware", level: "Tous", free: true, desc: "Dépôt de crackmes à rétro-ingénier, classés par difficulté." },
  { name: "MalwareBazaar (abuse.ch)", url: "https://bazaar.abuse.ch/", category: "Reverse / Malware", level: "Avancé", free: true, desc: "Échantillons de malwares réels pour l'analyse et la détection." },

  // ── Pwn / Crypto ──
  { name: "pwn.college", url: "https://pwn.college/", category: "Pwn / Crypto", level: "Tous", free: true, desc: "Cours pratique gratuit de sécurité binaire et d'exploitation." },
  { name: "Exploit Education", url: "https://exploit.education/", category: "Pwn / Crypto", level: "Intermédiaire", free: true, desc: "VMs (Phoenix, Nebula…) pour apprendre l'exploitation pas à pas." },
  { name: "CryptoHack", url: "https://cryptohack.org/", category: "Pwn / Crypto", level: "Tous", free: true, desc: "Challenges cryptographiques modernes et ludiques." },

  // ── OSINT ──
  { name: "OSINT Framework", url: "https://osintframework.com/", category: "OSINT", level: "Tous", free: true, desc: "Arborescence d'outils OSINT classés par type de donnée recherchée." },
  { name: "OSINT-FR", url: "https://osintfr.com/", category: "OSINT", level: "Tous", free: true, desc: "Communauté francophone OSINT : ressources, défis, entraide, événements." },
  { name: "Bellingcat Toolkit", url: "https://bellingcat.gitbook.io/toolkit", category: "OSINT", level: "Tous", free: true, desc: "Boîte à outils d'investigation en sources ouvertes de Bellingcat." },
  { name: "TraceLabs OSINT VM", url: "https://www.tracelabs.org/initiatives/osint-vm", category: "OSINT", level: "Intermédiaire", free: true, desc: "VM d'OSINT prête à l'emploi, orientée recherche de personnes disparues." },

  // ── Blue team ──
  { name: "CyberDefenders", url: "https://cyberdefenders.org/", category: "Blue team", level: "Tous", free: true, desc: "Challenges blue team / DFIR réalistes (pcap, mémoire, logs)." },
  { name: "LetsDefend", url: "https://letsdefend.io/", category: "Blue team", level: "Débutant", free: true, desc: "Plateforme d'entraînement SOC : investigation d'alertes réelles." },
  { name: "Blue Team Labs Online", url: "https://blueteamlabs.online/", category: "Blue team", level: "Intermédiaire", free: true, desc: "Labs et investigations défensives (forensics, threat hunting)." },

  // ── CTF (apprentissage) ──
  { name: "picoCTF", url: "https://picoctf.org/", category: "CTF", level: "Débutant", free: true, desc: "CTF éducatif de la Carnegie Mellon, idéal pour débuter." },
  { name: "OverTheWire Wargames", url: "https://overthewire.org/wargames/", category: "CTF", level: "Débutant", free: true, desc: "Wargames (Bandit…) pour maîtriser Linux et les bases de la sécu." },
  { name: "CTFlearn", url: "https://ctflearn.com/", category: "CTF", level: "Débutant", free: true, desc: "Challenges CTF communautaires par catégorie." },

  // ── Général / plateformes ──
  { name: "TryHackMe", url: "https://tryhackme.com/", category: "Général", level: "Débutant", free: true, desc: "Parcours guidés et rooms thématiques, progression pas à pas." },
  { name: "Hack The Box Academy", url: "https://academy.hackthebox.com/", category: "Général", level: "Tous", free: false, desc: "Modules structurés menant aux certifications HTB (CPTS, CBBH…)." },
  { name: "Root-Me", url: "https://www.root-me.org/", category: "Général", level: "Tous", free: true, desc: "Plateforme française de challenges variés (web, crackme, réseau…)." },

  // ── Bug Bounty ──
  { name: "YesWeHack", url: "https://www.yeswehack.com/", category: "Bug Bounty", level: "Tous", free: true, desc: "Plateforme de bug bounty européenne (FR) + YesWeHack EDU pour apprendre." },
  { name: "HackerOne", url: "https://www.hackerone.com/", category: "Bug Bounty", level: "Tous", free: true, desc: "La plus grande plateforme de bug bounty et divulgation de vulnérabilités." },
  { name: "Bugcrowd", url: "https://www.bugcrowd.com/", category: "Bug Bounty", level: "Tous", free: true, desc: "Plateforme de bug bounty avec université (Bugcrowd University)." },
  { name: "Intigriti", url: "https://www.intigriti.com/", category: "Bug Bounty", level: "Tous", free: true, desc: "Plateforme de bug bounty européenne + challenges mensuels." },
  { name: "Google Bug Hunters", url: "https://bughunters.google.com/", category: "Bug Bounty", level: "Intermédiaire", free: true, desc: "Programme de récompenses de Google + cours de sécurité web." },
  { name: "HackerOne Hacktivity", url: "https://hackerone.com/hacktivity", category: "Bug Bounty", level: "Tous", free: true, desc: "Flux public des rapports divulgués — mine d'apprentissage." },

  // ── Hardware / IoT ──
  { name: "Hak5", url: "https://hak5.org/", category: "Hardware / IoT", level: "Tous", free: true, desc: "Matériel offensif (Rubber Ducky, WiFi Pineapple) + tutos." },
  { name: "Flipper Zero — Docs", url: "https://docs.flipper.net/", category: "Hardware / IoT", level: "Débutant", free: true, desc: "Documentation du multi-outil de hacking hardware Flipper Zero." },
  { name: "OWASP IoT Top 10", url: "https://owasp.org/www-project-internet-of-things/", category: "Hardware / IoT", level: "Tous", free: true, desc: "Les risques de sécurité majeurs des objets connectés." },
  { name: "Great Scott Gadgets", url: "https://greatscottgadgets.com/", category: "Hardware / IoT", level: "Avancé", free: true, desc: "HackRF, GreatFET… + le cours « Software Defined Radio »." },
  { name: "Exploitee.rs", url: "https://www.exploitee.rs/", category: "Hardware / IoT", level: "Intermédiaire", free: true, desc: "Wiki communautaire de hacking d'appareils grand public/IoT." },

  // ── Médias (chaînes & podcasts) ──
  { name: "IppSec (YouTube)", url: "https://www.youtube.com/c/ippsec", category: "Médias", level: "Tous", free: true, desc: "Write-ups vidéo HackTheBox, référence pour la méthodo." },
  { name: "LiveOverflow (YouTube)", url: "https://www.youtube.com/c/LiveOverflow", category: "Médias", level: "Tous", free: true, desc: "Vulgarisation pointue : pwn, web, reverse, CTF." },
  { name: "John Hammond (YouTube)", url: "https://www.youtube.com/c/JohnHammond010", category: "Médias", level: "Tous", free: true, desc: "CTF, analyse de malware, outils et actualité cyber." },
  { name: "The Cyber Mentor (YouTube)", url: "https://www.youtube.com/c/TheCyberMentor", category: "Médias", level: "Débutant", free: true, desc: "Cours de pentest pratiques et accessibles (TCM Security)." },
  { name: "Darknet Diaries", url: "https://darknetdiaries.com/", category: "Médias", level: "Tous", free: true, desc: "Podcast d'histoires vraies de hacking et de cybercriminalité." },
  { name: "Le Comptoir Sécu", url: "https://www.comptoirsecu.fr/", category: "Médias", level: "Tous", free: true, desc: "Podcast francophone de vulgarisation cybersécurité." },
  { name: "NoLimitSecu", url: "https://www.nolimitsecu.fr/", category: "Médias", level: "Tous", free: true, desc: "Podcast hebdo francophone sur la sécurité de l'information." },
];

/* ═══════════════ Plateformes de CTF & événements CTF ═══════════════ */

export interface CtfPlatform {
  name: string;
  url: string;
  kind: string;
  desc: string;
}

export const CTF_PLATFORMS: CtfPlatform[] = [
  { name: "CTFtime", url: "https://ctftime.org/", kind: "Calendrier", desc: "Agenda mondial des CTF, classements d'équipes et archives de write-ups." },
  { name: "HTB CTF", url: "https://ctf.hackthebox.com/", kind: "Plateforme", desc: "CTF jeopardy et attack/defense organisés par Hack The Box." },
  { name: "picoCTF", url: "https://picoctf.org/", kind: "Éducatif", desc: "Compétition annuelle + banque de challenges toujours ouverte." },
  { name: "pwnable.kr", url: "http://pwnable.kr/", kind: "Pwn", desc: "Challenges d'exploitation binaire classés par difficulté." },
  { name: "pwnable.tw", url: "https://pwnable.tw/", kind: "Pwn", desc: "Challenges pwn plus avancés (successeur spirituel de pwnable.kr)." },
  { name: "CTFlearn", url: "https://ctflearn.com/", kind: "Communautaire", desc: "Challenges permanents par catégorie, orientés apprentissage." },
];

/* ═══════════════ Certifications (roadmap) ═══════════════ */

export type CertTrack =
  | "Fondamentaux"
  | "Offensive / Pentest"
  | "Defensive / Blue"
  | "Cloud"
  | "Forensics / DFIR"
  | "Gouvernance / GRC";

export interface Cert {
  name: string;
  org: string;
  level: 1 | 2 | 3 | 4; // 1 débutant → 4 expert
  url?: string;
}

export const CERT_TRACKS: CertTrack[] = [
  "Fondamentaux",
  "Offensive / Pentest",
  "Defensive / Blue",
  "Cloud",
  "Forensics / DFIR",
  "Gouvernance / GRC",
];

export const LEVEL_LABEL: Record<number, string> = {
  1: "Débutant",
  2: "Intermédiaire",
  3: "Avancé",
  4: "Expert",
};

export const CERTS: Record<CertTrack, Cert[]> = {
  Fondamentaux: [
    { name: "ISC2 CC", org: "ISC2", level: 1, url: "https://www.isc2.org/certifications/cc" },
    { name: "Google Cybersecurity", org: "Google", level: 1, url: "https://grow.google/certificates/cybersecurity/" },
    { name: "Security+", org: "CompTIA", level: 1, url: "https://www.comptia.org/certifications/security" },
    { name: "Network+", org: "CompTIA", level: 1, url: "https://www.comptia.org/certifications/network" },
    { name: "eJPT", org: "INE / eLearnSecurity", level: 1, url: "https://security.ine.com/certifications/ejpt-certification/" },
  ],
  "Offensive / Pentest": [
    { name: "PNPT", org: "TCM Security", level: 2, url: "https://certifications.tcm-sec.com/pnpt/" },
    { name: "CPTS", org: "Hack The Box", level: 2, url: "https://academy.hackthebox.com/preview/certifications/htb-certified-penetration-testing-specialist" },
    { name: "OSCP", org: "OffSec", level: 3, url: "https://www.offsec.com/courses/pen-200/" },
    { name: "CRTP / CRTO", org: "Altered/Zero-Point", level: 3 },
    { name: "OSWE (web)", org: "OffSec", level: 3, url: "https://www.offsec.com/courses/web-300/" },
    { name: "OSEP", org: "OffSec", level: 4, url: "https://www.offsec.com/courses/pen-300/" },
    { name: "OSED / OSEE", org: "OffSec", level: 4 },
    { name: "GXPN / GPEN", org: "GIAC (SANS)", level: 4, url: "https://www.giac.org/" },
  ],
  "Defensive / Blue": [
    { name: "CySA+", org: "CompTIA", level: 2, url: "https://www.comptia.org/certifications/cybersecurity-analyst" },
    { name: "BTL1", org: "Security Blue Team", level: 2, url: "https://securityblue.team/" },
    { name: "CDSA", org: "Hack The Box", level: 3 },
    { name: "GCIH", org: "GIAC (SANS)", level: 3, url: "https://www.giac.org/certifications/certified-incident-handler-gcih/" },
    { name: "GCIA", org: "GIAC (SANS)", level: 4 },
  ],
  Cloud: [
    { name: "AWS Security Specialty", org: "AWS", level: 3 },
    { name: "SC-200 / SC-100", org: "Microsoft", level: 3 },
    { name: "CCSP", org: "ISC2", level: 4 },
  ],
  "Forensics / DFIR": [
    { name: "GCFE", org: "GIAC (SANS)", level: 2 },
    { name: "GCFA", org: "GIAC (SANS)", level: 3 },
    { name: "GREM (malware)", org: "GIAC (SANS)", level: 4 },
  ],
  "Gouvernance / GRC": [
    { name: "CISA", org: "ISACA", level: 3 },
    { name: "CISM", org: "ISACA", level: 4 },
    { name: "CISSP", org: "ISC2", level: 4, url: "https://www.isc2.org/certifications/cissp" },
  ],
};

// Référence : roadmap visuelle complète.
export const CERT_ROADMAP_URL = "https://pauljerimy.com/security-certification-roadmap/";

/* ═══════════════ Événements & communautés ═══════════════ */

export interface Ev {
  name: string;
  url: string;
  place: string;
  region: "France" | "International";
  type: "Conférence" | "Communauté";
  desc: string;
}

export const EVENTS: Ev[] = [
  // ── France ──
  { name: "leHACK", url: "https://lehack.org/", place: "Paris", region: "France", type: "Conférence", desc: "La plus ancienne conférence hacking de France (ex-Nuit du Hack), talks + wargame nocturne." },
  { name: "IdentityDays", url: "https://identitydays.com/", place: "Paris", region: "France", type: "Conférence", desc: "Événement dédié à la gestion et la sécurité des identités (IAM)." },
  { name: "SSTIC", url: "https://www.sstic.org/", place: "Rennes", region: "France", type: "Conférence", desc: "Symposium technique de référence sur la sécurité de l'info (FR)." },
  { name: "FIC / InCyber", url: "https://www.forum-incyber.com/", place: "Lille", region: "France", type: "Conférence", desc: "Grand forum européen de la cybersécurité (institutionnel + technique)." },
  { name: "Hexacon", url: "https://www.hexacon.fr/", place: "Paris", region: "France", type: "Conférence", desc: "Conférence offensive pointue (exploitation, vulnérabilités)." },
  { name: "Pass the SALT", url: "https://www.pass-the-salt.org/", place: "Lille", region: "France", type: "Conférence", desc: "Conférence sécurité & logiciel libre, orientée hacking." },
  { name: "THCon", url: "https://thcon.party/", place: "Toulouse", region: "France", type: "Conférence", desc: "Conférence + CTF étudiante et communautaire toulousaine." },
  { name: "Barbhack", url: "https://www.barbhack.fr/", place: "Toulon", region: "France", type: "Conférence", desc: "Conférence hacking estivale conviviale dans le sud." },
  { name: "OSINT-FR", url: "https://osintfr.com/", place: "France / en ligne", region: "France", type: "Communauté", desc: "Communauté francophone OSINT : Discord, défis, meetups." },

  // ── International ──
  { name: "DEF CON", url: "https://defcon.org/", place: "Las Vegas", region: "International", type: "Conférence", desc: "La plus grande convention hacker du monde." },
  { name: "Black Hat", url: "https://www.blackhat.com/", place: "USA / EU / Asia", region: "International", type: "Conférence", desc: "Conférence sécurité pro (briefings + trainings)." },
  { name: "BruCON", url: "https://www.brucon.org/", place: "Belgique", region: "International", type: "Conférence", desc: "Conférence hacking européenne réputée." },
  { name: "Hack.lu", url: "https://hack.lu/", place: "Luxembourg", region: "International", type: "Conférence", desc: "Conférence technique organisée par le CIRCL." },
  { name: "NorthSec", url: "https://nsec.io/", place: "Montréal", region: "International", type: "Conférence", desc: "Conférence + l'un des plus gros CTF on-site au monde." },
];
