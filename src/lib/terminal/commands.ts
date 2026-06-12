/*
 * Registre de commandes du terminal interactif UnknownX-077.
 * Les handlers s'exécutent côté client (APIs navigateur : crypto, atob/btoa,
 * fetch). Chaque commande renvoie des lignes de sortie (ou une promesse).
 */

import { RESOURCES, WRITEUPS, SCRIPTS, EXTERNAL_TOOLS, STATS } from "@/data/mock";
import { NAV_ITEMS } from "@/lib/nav";

export type Tone = "out" | "ok" | "err" | "cmd" | "warn" | "accent";
export interface OutLine {
  text: string;
  tone?: Tone;
}

export interface CmdContext {
  user: { name: string; role: string; email: string; since: number } | null;
  navigate: (href: string) => void;
  close: () => void;
  clear: () => void;
  startMatrix: () => void;
  history: string[];
}

type CmdResult = OutLine[] | Promise<OutLine[]> | void;

export interface Command {
  name: string;
  desc: string;
  usage?: string;
  run: (args: string[], ctx: CmdContext) => CmdResult;
}

const out = (text: string, tone: Tone = "out"): OutLine => ({ text, tone });

/* ───────────── helpers ───────────── */

const b64encode = (s: string) => btoa(unescape(encodeURIComponent(s)));
const b64decode = (s: string) => decodeURIComponent(escape(atob(s)));

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

async function sha(algo: "SHA-1" | "SHA-256", text: string) {
  const data = new TextEncoder().encode(text);
  return toHex(await crypto.subtle.digest(algo, data as unknown as BufferSource));
}

// MD5 compact (SubtleCrypto ne fournit pas MD5). Implémentation classique.
function md5(str: string): string {
  function rl(n: number, c: number) {
    return (n << c) | (n >>> (32 - c));
  }
  function add(x: number, y: number) {
    const l = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return add(rl(add(add(a, q), add(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function toBlocks(s: string) {
    const n = s.length;
    const blks: number[] = [];
    for (let i = 0; i < n * 8; i += 8) blks[i >> 5] |= (s.charCodeAt(i / 8) & 0xff) << i % 32;
    blks[n * 8 >> 5] |= 0x80 << (n * 8) % 32;
    blks[(((n * 8 + 64) >>> 9) << 4) + 14] = n * 8;
    return blks;
  }
  const utf8 = unescape(encodeURIComponent(str));
  const x = toBlocks(utf8);
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, x[i] | 0, S[0], -680876936);
    d = ff(d, a, b, c, x[i + 1] | 0, S[1], -389564586);
    c = ff(c, d, a, b, x[i + 2] | 0, S[2], 606105819);
    b = ff(b, c, d, a, x[i + 3] | 0, S[3], -1044525330);
    a = ff(a, b, c, d, x[i + 4] | 0, S[0], -176418897);
    d = ff(d, a, b, c, x[i + 5] | 0, S[1], 1200080426);
    c = ff(c, d, a, b, x[i + 6] | 0, S[2], -1473231341);
    b = ff(b, c, d, a, x[i + 7] | 0, S[3], -45705983);
    a = ff(a, b, c, d, x[i + 8] | 0, S[0], 1770035416);
    d = ff(d, a, b, c, x[i + 9] | 0, S[1], -1958414417);
    c = ff(c, d, a, b, x[i + 10] | 0, S[2], -42063);
    b = ff(b, c, d, a, x[i + 11] | 0, S[3], -1990404162);
    a = ff(a, b, c, d, x[i + 12] | 0, S[0], 1804603682);
    d = ff(d, a, b, c, x[i + 13] | 0, S[1], -40341101);
    c = ff(c, d, a, b, x[i + 14] | 0, S[2], -1502002290);
    b = ff(b, c, d, a, x[i + 15] | 0, S[3], 1236535329);
    a = gg(a, b, c, d, x[i + 1] | 0, S[4], -165796510);
    d = gg(d, a, b, c, x[i + 6] | 0, S[5], -1069501632);
    c = gg(c, d, a, b, x[i + 11] | 0, S[6], 643717713);
    b = gg(b, c, d, a, x[i] | 0, S[7], -373897302);
    a = gg(a, b, c, d, x[i + 5] | 0, S[4], -701558691);
    d = gg(d, a, b, c, x[i + 10] | 0, S[5], 38016083);
    c = gg(c, d, a, b, x[i + 15] | 0, S[6], -660478335);
    b = gg(b, c, d, a, x[i + 4] | 0, S[7], -405537848);
    a = gg(a, b, c, d, x[i + 9] | 0, S[4], 568446438);
    d = gg(d, a, b, c, x[i + 14] | 0, S[5], -1019803690);
    c = gg(c, d, a, b, x[i + 3] | 0, S[6], -187363961);
    b = gg(b, c, d, a, x[i + 8] | 0, S[7], 1163531501);
    a = gg(a, b, c, d, x[i + 13] | 0, S[4], -1444681467);
    d = gg(d, a, b, c, x[i + 2] | 0, S[5], -51403784);
    c = gg(c, d, a, b, x[i + 7] | 0, S[6], 1735328473);
    b = gg(b, c, d, a, x[i + 12] | 0, S[7], -1926607734);
    a = hh(a, b, c, d, x[i + 5] | 0, S[8], -378558);
    d = hh(d, a, b, c, x[i + 8] | 0, S[9], -2022574463);
    c = hh(c, d, a, b, x[i + 11] | 0, S[10], 1839030562);
    b = hh(b, c, d, a, x[i + 14] | 0, S[11], -35309556);
    a = hh(a, b, c, d, x[i + 1] | 0, S[8], -1530992060);
    d = hh(d, a, b, c, x[i + 4] | 0, S[9], 1272893353);
    c = hh(c, d, a, b, x[i + 7] | 0, S[10], -155497632);
    b = hh(b, c, d, a, x[i + 10] | 0, S[11], -1094730640);
    a = hh(a, b, c, d, x[i + 13] | 0, S[8], 681279174);
    d = hh(d, a, b, c, x[i] | 0, S[9], -358537222);
    c = hh(c, d, a, b, x[i + 3] | 0, S[10], -722521979);
    b = hh(b, c, d, a, x[i + 6] | 0, S[11], 76029189);
    a = hh(a, b, c, d, x[i + 9] | 0, S[8], -640364487);
    d = hh(d, a, b, c, x[i + 12] | 0, S[9], -421815835);
    c = hh(c, d, a, b, x[i + 15] | 0, S[10], 530742520);
    b = hh(b, c, d, a, x[i + 2] | 0, S[11], -995338651);
    a = ii(a, b, c, d, x[i] | 0, S[12], -198630844);
    d = ii(d, a, b, c, x[i + 7] | 0, S[13], 1126891415);
    c = ii(c, d, a, b, x[i + 14] | 0, S[14], -1416354905);
    b = ii(b, c, d, a, x[i + 5] | 0, S[15], -57434055);
    a = ii(a, b, c, d, x[i + 12] | 0, S[12], 1700485571);
    d = ii(d, a, b, c, x[i + 3] | 0, S[13], -1894986606);
    c = ii(c, d, a, b, x[i + 10] | 0, S[14], -1051523);
    b = ii(b, c, d, a, x[i + 1] | 0, S[15], -2054922799);
    a = ii(a, b, c, d, x[i + 8] | 0, S[12], 1873313359);
    d = ii(d, a, b, c, x[i + 15] | 0, S[13], -30611744);
    c = ii(c, d, a, b, x[i + 6] | 0, S[14], -1560198380);
    b = ii(b, c, d, a, x[i + 13] | 0, S[15], 1309151649);
    a = ii(a, b, c, d, x[i + 4] | 0, S[12], -145523070);
    d = ii(d, a, b, c, x[i + 11] | 0, S[13], -1120210379);
    c = ii(c, d, a, b, x[i + 2] | 0, S[14], 718787259);
    b = ii(b, c, d, a, x[i + 9] | 0, S[15], -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  const hex = (n: number) =>
    Array.from({ length: 4 }, (_, j) => ((n >> (j * 8)) & 0xff).toString(16).padStart(2, "0")).join("");
  return hex(a) + hex(b) + hex(c) + hex(d);
}

const rnd = (a: number, b: number) => +(a + Math.random() * (b - a)).toFixed(1);

/* ───────────── commandes ───────────── */

export const COMMANDS: Command[] = [
  {
    name: "help",
    desc: "Liste toutes les commandes disponibles",
    run: () => [
      out("commandes disponibles :", "accent"),
      ...COMMANDS.map((c) => out(`  ${c.name.padEnd(12)} ${c.desc}`)),
    ],
  },
  {
    name: "whoami",
    desc: "Profil de l'opérateur connecté",
    run: (_a, ctx) =>
      ctx.user
        ? [
            out(`opérateur : ${ctx.user.name}`, "ok"),
            out(`email     : ${ctx.user.email}`),
            out(`rôle      : ${ctx.user.role}`),
          ]
        : [out("aucune session active", "err")],
  },
  {
    name: "ls",
    desc: "Liste modules / resources / writeups / tools",
    usage: "ls [resources|writeups|tools]",
    run: (args) => {
      const s = args[0];
      if (s === "resources")
        return RESOURCES.map((r) => out(`  ${r.id.padEnd(22)} ${r.domain} · ${r.title}`));
      if (s === "writeups")
        return WRITEUPS.map((w) => out(`  ${w.id.padEnd(18)} ${w.platform} · ${w.difficulty} · ${w.name}`));
      if (s === "tools")
        return [
          ...SCRIPTS.map((t) => out(`  ${t.name.padEnd(18)} ${t.lang} · ${t.phase}`)),
          ...EXTERNAL_TOOLS.map((t) => out(`  ${t.name.padEnd(18)} ext · ${t.phase}`)),
        ];
      return NAV_ITEMS.map((n) => out(`  ${n.href.padEnd(14)} ${n.desc}`));
    },
  },
  {
    name: "search",
    desc: "Recherche globale (resources, writeups, tools)",
    usage: "search <query>",
    run: (args) => {
      const q = args.join(" ").toLowerCase();
      if (!q) return [out("usage: search <query>", "warn")];
      const hits: OutLine[] = [];
      RESOURCES.filter((r) => (r.title + r.desc + r.tags.join()).toLowerCase().includes(q)).forEach(
        (r) => hits.push(out(`  [res]  ${r.id} — ${r.title}`, "out"))
      );
      WRITEUPS.filter((w) => (w.name + w.summary + w.tags.join()).toLowerCase().includes(q)).forEach(
        (w) => hits.push(out(`  [wup]  ${w.id} — ${w.name}`, "out"))
      );
      SCRIPTS.filter((t) => (t.name + t.desc).toLowerCase().includes(q)).forEach((t) =>
        hits.push(out(`  [tls]  ${t.name} — ${t.desc}`, "out"))
      );
      return hits.length ? [out(`${hits.length} résultat(s) :`, "accent"), ...hits] : [out("aucun résultat", "warn")];
    },
  },
  {
    name: "open",
    desc: "Ouvre un module, un write-up ou une ressource",
    usage: "open <slug>",
    run: (args, ctx) => {
      const slug = (args[0] ?? "").replace(/^\/+/, "").toLowerCase();
      if (!slug) return [out("usage: open <slug>", "warn")];
      const nav = NAV_ITEMS.find(
        (n) => n.href === `/${slug}` || n.label.toLowerCase() === slug
      );
      if (nav) {
        ctx.navigate(nav.href);
        ctx.close();
        return [out(`→ ${nav.href}`, "ok")];
      }
      const w = WRITEUPS.find((x) => x.id.toLowerCase() === slug);
      if (w) {
        ctx.navigate(`/writeups#${w.id}`);
        ctx.close();
        return [out(`→ /writeups#${w.id}`, "ok")];
      }
      const r = RESOURCES.find((x) => x.id.toLowerCase() === slug);
      if (r) {
        globalThis.open?.(r.url, "_blank", "noopener");
        return [out(`↗ ${r.url}`, "ok")];
      }
      return [out(`open: ${slug}: introuvable`, "err")];
    },
  },
  {
    name: "stats",
    desc: "Statistiques du vault",
    run: () => [
      out("── UnknownX-077 // stats ──", "accent"),
      out(`  ressources indexées : ${STATS.resources}`),
      out(`  write-ups publiés   : ${STATS.writeups}`),
      out(`  outils en arsenal   : ${STATS.tools}`),
      out(`  scripts perso       : ${SCRIPTS.length}`),
      out(`  outils externes     : ${EXTERNAL_TOOLS.length}`),
    ],
  },
  {
    name: "cve",
    desc: "Détaille un CVE depuis l'API NVD",
    usage: "cve <CVE-ID>",
    run: async (args) => {
      const id = args[0];
      if (!id) return [out("usage: cve CVE-AAAA-NNNN", "warn")];
      try {
        const res = await fetch(`/api/cve?id=${encodeURIComponent(id)}`);
        const data = (await res.json()) as { source: string; items: { id: string; score: number; severity: string; vendor: string; summary: string; published: string }[] };
        const c = data.items[0];
        if (!c) return [out(`cve: ${id}: introuvable (${data.source})`, "err")];
        return [
          out(`${c.id}`, "accent"),
          out(`  score    : ${c.score} (${c.severity})`, c.score >= 9 ? "err" : c.score >= 7 ? "warn" : "ok"),
          out(`  vendor   : ${c.vendor}`),
          out(`  publié   : ${c.published}`),
          out(`  résumé   : ${c.summary}`),
        ];
      } catch {
        return [out("cve: échec de la requête NVD", "err")];
      }
    },
  },
  {
    name: "encode",
    desc: "Encode une chaîne en base64",
    usage: "encode <texte>",
    run: (args) => {
      const t = args.join(" ");
      return t ? [out(b64encode(t), "ok")] : [out("usage: encode <texte>", "warn")];
    },
  },
  {
    name: "decode",
    desc: "Décode une chaîne base64",
    usage: "decode <base64>",
    run: (args) => {
      const t = args[0];
      if (!t) return [out("usage: decode <base64>", "warn")];
      try {
        return [out(b64decode(t), "ok")];
      } catch {
        return [out("decode: base64 invalide", "err")];
      }
    },
  },
  {
    name: "hash",
    desc: "MD5 + SHA1 + SHA256 d'une chaîne",
    usage: "hash <texte>",
    run: async (args) => {
      const t = args.join(" ");
      if (!t) return [out("usage: hash <texte>", "warn")];
      const [s1, s256] = await Promise.all([sha("SHA-1", t), sha("SHA-256", t)]);
      return [
        out(`  MD5    : ${md5(t)}`),
        out(`  SHA1   : ${s1}`),
        out(`  SHA256 : ${s256}`),
      ];
    },
  },
  {
    name: "ping",
    desc: "Ping simulé (éducatif)",
    usage: "ping <host>",
    run: (args) => {
      const host = args[0] ?? "10.10.10.1";
      const lines = [out(`PING ${host} — simulation éducative`, "accent")];
      for (let i = 0; i < 4; i++)
        lines.push(out(`64 bytes from ${host}: icmp_seq=${i} ttl=63 time=${rnd(8, 42)} ms`));
      lines.push(out("--- statistiques ---", "out"));
      lines.push(out("4 paquets transmis, 4 reçus, 0% perte", "ok"));
      return lines;
    },
  },
  {
    name: "nmap",
    desc: "Scan nmap simulé (éducatif)",
    usage: "nmap <target>",
    run: (args) => {
      const target = args[0] ?? "10.10.10.1";
      return [
        out(`Starting Nmap — SIMULATION ÉDUCATIVE (aucun paquet réel envoyé)`, "warn"),
        out(`Nmap scan report for ${target}`),
        out("PORT     STATE SERVICE     VERSION", "accent"),
        out("22/tcp   open  ssh         OpenSSH 8.9p1"),
        out("80/tcp   open  http        nginx 1.18.0"),
        out("443/tcp  open  ssl/http    nginx 1.18.0"),
        out("3306/tcp open  mysql       MySQL 8.0.32"),
        out("Service detection performed. 4 ports ouverts.", "ok"),
      ];
    },
  },
  {
    name: "matrix",
    desc: "Lance l'animation matrix plein écran (10s)",
    run: (_a, ctx) => {
      ctx.startMatrix();
      return [out("// flux matrix activé — 10s", "accent")];
    },
  },
  {
    name: "weather",
    desc: "Météo (easter egg)",
    run: () => [
      out("NEO-TOKYO // météo réseau", "accent"),
      out("  ciel        : pluie de paquets, néons diffus"),
      out("  température  : 13.37°C"),
      out("  visibilité   : 2 sauts"),
      out("  alerte       : tempête de scans en approche ⚡", "warn"),
    ],
  },
  {
    name: "banner",
    desc: "Affiche le logo ASCII",
    run: () => [
      out(" _   _      _                          __  __", "accent"),
      out("| | | |_ _ | |___ _  _____ __ ___ _ __ \\ \\/ /", "accent"),
      out("| |_| | ' \\| / / ' \\/ _ \\ V  V / ' \\\\ \\  >  < ", "accent"),
      out(" \\___/|_||_|_\\_\\_||_\\___/\\_/\\_/|_||_(_)/_/\\_\\", "accent"),
      out("            U N K N O W N X - 0 7 7", "out"),
    ],
  },
  {
    name: "uptime",
    desc: "Durée depuis la connexion",
    run: (_a, ctx) => {
      if (!ctx.user) return [out("aucune session", "err")];
      const s = Math.floor((Date.now() - ctx.user.since) / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return [out(`session active depuis ${h}h ${m}m ${s % 60}s`, "ok")];
    },
  },
  {
    name: "history",
    desc: "Historique des commandes",
    run: (_a, ctx) =>
      ctx.history.length
        ? ctx.history.map((c, i) => out(`  ${String(i + 1).padStart(3)}  ${c}`))
        : [out("historique vide", "warn")],
  },
  {
    name: "clear",
    desc: "Vide le terminal",
    run: (_a, ctx) => {
      ctx.clear();
    },
  },
  {
    name: "exit",
    desc: "Ferme le terminal",
    run: (_a, ctx) => {
      ctx.close();
    },
  },
];

export const COMMAND_NAMES = COMMANDS.map((c) => c.name);

export function runCommand(input: string, ctx: CmdContext): CmdResult {
  const [name, ...args] = input.trim().split(/\s+/);
  const cmd = COMMANDS.find((c) => c.name === name);
  if (!cmd) return [out(`${name}: commande inconnue — tape \`help\``, "err")];
  return cmd.run(args, ctx);
}
