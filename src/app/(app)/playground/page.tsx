"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";

type ToolId = "subnet" | "regex" | "epoch" | "base";

const TOOLS: { id: ToolId; label: string; code: string }[] = [
  { id: "subnet", label: "Sous-réseau", code: "NET" },
  { id: "regex", label: "Regex", code: "RGX" },
  { id: "epoch", label: "Epoch", code: "TIME" },
  { id: "base", label: "Bases", code: "NUM" },
];

export default function PlaygroundPage() {
  const [tool, setTool] = useState<ToolId>("subnet");

  return (
    <div>
      <PageHeader
        code="PLG // UTILITAIRES"
        title="Playground"
        desc="Boîte à outils client-side : réseau, regex, temps, conversions. Rien n'est envoyé au serveur."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`hud-tab hud-tab--chip focus-ring px-3.5 py-1.5 font-mono text-xs ${
              tool === t.id ? "is-active text-secondary" : "text-muted hover:text-ink"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-[9px] text-muted">{t.code}</span>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {tool === "subnet" && <Subnet />}
      {tool === "regex" && <RegexTester />}
      {tool === "epoch" && <Epoch />}
      {tool === "base" && <BaseConv />}
    </div>
  );
}

/* ─────────── helpers UI ─────────── */
function Row({ label, value, mono = true }: { label: string; value: ReactNode; mono?: boolean }) {
  const { push } = useToast();
  const copy = () => {
    if (typeof value === "string") navigator.clipboard.writeText(value).then(() => push("ok", "Copié."));
  };
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-subtle py-2 last:border-0">
      <span className="label !text-muted shrink-0">{label}</span>
      <button
        onClick={copy}
        data-no-sfx
        className={`truncate text-right ${mono ? "font-mono" : ""} text-body-sm text-ink-strong hover:text-secondary`}
        title="Copier"
      >
        {value}
      </button>
    </div>
  );
}

/* ─────────── 1. Sous-réseau / CIDR ─────────── */
function ipToInt(ip: string): number | null {
  const p = ip.split(".");
  if (p.length !== 4) return null;
  let n = 0;
  for (const seg of p) {
    const v = Number(seg);
    if (!Number.isInteger(v) || v < 0 || v > 255 || seg === "") return null;
    n = (n << 8) | v;
  }
  return n >>> 0;
}
const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
const intToBin = (n: number) =>
  [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, "0")).join(".");

function Subnet() {
  const [input, setInput] = useState("192.168.1.10/24");

  const res = useMemo(() => {
    const [ipStr, bitsStr] = input.trim().split("/");
    const ip = ipToInt(ipStr ?? "");
    const bits = Number(bitsStr);
    if (ip === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - bits);
    const usable = bits >= 31 ? (bits === 32 ? 1 : 2) : total - 2;
    const first = bits >= 31 ? network : network + 1;
    const last = bits >= 31 ? broadcast : broadcast - 1;
    return {
      mask: intToIp(mask),
      wildcard: intToIp(~mask >>> 0),
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      range: `${intToIp(first)} — ${intToIp(last)}`,
      usable: usable.toLocaleString("fr-FR"),
      total: total.toLocaleString("fr-FR"),
      bin: intToBin(network),
    };
  }, [input]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="card p-5 h-fit">
        <label className="block">
          <span className="label !text-muted mb-1.5 block">Adresse CIDR</span>
          <input
            className="field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="192.168.1.0/24"
            spellCheck={false}
          />
        </label>
        <p className="mt-3 text-label text-muted">
          Ex. <span className="text-ink">10.0.0.0/8</span>, <span className="text-ink">172.16.5.4/20</span>.
        </p>
      </section>
      <section className="card p-5">
        {res ? (
          <div>
            <Row label="Masque" value={res.mask} />
            <Row label="Wildcard" value={res.wildcard} />
            <Row label="Réseau" value={res.network} />
            <Row label="Broadcast" value={res.broadcast} />
            <Row label="Plage hôtes" value={res.range} />
            <Row label="Hôtes utilisables" value={res.usable} />
            <Row label="Adresses totales" value={res.total} />
            <Row label="Réseau (binaire)" value={res.bin} />
          </div>
        ) : (
          <p className="font-mono text-body-sm text-danger">⚠ CIDR invalide.</p>
        )}
      </section>
    </div>
  );
}

/* ─────────── 2. Testeur de regex ─────────── */
function RegexTester() {
  const [pattern, setPattern] = useState("(\\d{1,3})\\.(\\d{1,3})");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("hôte 10.0.0.1 et 192.168.1.254 sur le lan");

  const { error, nodes, count, groups } = useMemo(() => {
    if (!pattern) return { error: null as string | null, nodes: [text] as ReactNode[], count: 0, groups: [] as string[][] };
    let re: RegExp;
    try {
      re = new RegExp(pattern, flags);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Regex invalide", nodes: [text], count: 0, groups: [] };
    }
    const out: ReactNode[] = [];
    const grps: string[][] = [];
    let n = 0;
    if (flags.includes("g")) {
      let last = 0;
      for (const m of text.matchAll(re)) {
        const idx = m.index ?? 0;
        if (idx > last) out.push(text.slice(last, idx));
        out.push(
          <mark key={`m-${n}`} className="rounded-sm bg-secondary/25 text-secondary">
            {m[0]}
          </mark>,
        );
        if (m.length > 1) grps.push(m.slice(1).map((g) => g ?? ""));
        last = idx + (m[0].length || 1);
        n++;
        if (n > 5000) break;
      }
      if (last < text.length) out.push(text.slice(last));
    } else {
      const m = re.exec(text);
      if (m) {
        const idx = m.index;
        out.push(text.slice(0, idx));
        out.push(
          <mark key="m0" className="rounded-sm bg-secondary/25 text-secondary">
            {m[0]}
          </mark>,
        );
        out.push(text.slice(idx + m[0].length));
        if (m.length > 1) grps.push(m.slice(1).map((g) => g ?? ""));
        n = 1;
      } else {
        out.push(text);
      }
    }
    return { error: null, nodes: out, count: n, groups: grps };
  }, [pattern, flags, text]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5 space-y-4">
        <label className="block">
          <span className="label !text-muted mb-1.5 block">Motif (pattern)</span>
          <input className="field font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} />
        </label>
        <label className="block">
          <span className="label !text-muted mb-1.5 block">Flags</span>
          <input className="field font-mono" value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} placeholder="gim" spellCheck={false} />
        </label>
        <label className="block">
          <span className="label !text-muted mb-1.5 block">Texte de test</span>
          <textarea className="field min-h-[120px] resize-y font-mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </label>
      </section>
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="label">Résultat</span>
          <span className={`font-mono text-label ${error ? "text-danger" : "text-secondary"}`}>
            {error ? "erreur" : `${count} correspondance(s)`}
          </span>
        </div>
        {error ? (
          <p className="font-mono text-body-sm text-danger">⚠ {error}</p>
        ) : (
          <pre className="whitespace-pre-wrap break-words rounded-sm border border-line bg-base/60 p-3 font-mono text-body-sm text-ink">
            {nodes}
          </pre>
        )}
        {groups.length > 0 && (
          <div className="mt-4">
            <span className="label !text-muted">Groupes capturés</span>
            <ul className="mt-2 space-y-1">
              {groups.slice(0, 30).map((g, i) => (
                <li key={i} className="font-mono text-label text-muted">
                  #{i + 1}: <span className="text-ink">{g.map((x) => `"${x}"`).join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────── 3. Epoch / date ─────────── */
function Epoch() {
  const [epoch, setEpoch] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState("");

  const fromEpoch = useMemo(() => {
    const raw = epoch.trim();
    if (!/^\d+$/.test(raw)) return null;
    const n = Number(raw);
    const ms = raw.length > 10 ? n : n * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return { utc: d.toUTCString(), local: d.toLocaleString("fr-FR"), iso: d.toISOString(), rel: relTime(ms) };
  }, [epoch]);

  const fromIso = useMemo(() => {
    if (!iso.trim()) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return { s: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  }, [iso]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="label">Timestamp → date</span>
          <button
            onClick={() => setEpoch(String(Math.floor(Date.now() / 1000)))}
            data-no-sfx
            className="font-mono text-label text-muted hover:text-secondary"
          >
            maintenant ↺
          </button>
        </div>
        <input className="field font-mono" value={epoch} onChange={(e) => setEpoch(e.target.value)} placeholder="1717000000" spellCheck={false} />
        {fromEpoch ? (
          <div className="mt-4">
            <Row label="Local" value={fromEpoch.local} />
            <Row label="UTC" value={fromEpoch.utc} />
            <Row label="ISO 8601" value={fromEpoch.iso} />
            <Row label="Relatif" value={fromEpoch.rel} mono={false} />
          </div>
        ) : (
          <p className="mt-4 font-mono text-body-sm text-danger">⚠ Timestamp invalide (secondes ou ms).</p>
        )}
      </section>
      <section className="card p-5">
        <span className="label mb-3 block">Date → timestamp</span>
        <input className="field font-mono" value={iso} onChange={(e) => setIso(e.target.value)} placeholder="2026-06-30T12:00:00Z" spellCheck={false} />
        {fromIso ? (
          <div className="mt-4">
            <Row label="Epoch (s)" value={String(fromIso.s)} />
            <Row label="Epoch (ms)" value={String(fromIso.ms)} />
          </div>
        ) : (
          <p className="mt-4 font-mono text-body-sm text-muted">Saisis une date (ISO, RFC, ou lisible).</p>
        )}
      </section>
    </div>
  );
}

function relTime(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [86400000, "jour"],
    [3600000, "heure"],
    [60000, "minute"],
    [1000, "seconde"],
  ];
  for (const [u, name] of units) {
    if (abs >= u) {
      const v = Math.round(abs / u);
      return diff < 0 ? `il y a ${v} ${name}${v > 1 ? "s" : ""}` : `dans ${v} ${name}${v > 1 ? "s" : ""}`;
    }
  }
  return "à l'instant";
}

/* ─────────── 4. Convertisseur de bases ─────────── */
function BaseConv() {
  const [val, setVal] = useState("255");
  const [base, setBase] = useState(10);

  const parsed = useMemo(() => {
    const raw = val.trim().toLowerCase().replace(/^0x|^0b|^0o/, "");
    if (!raw) return null;
    const n = parseInt(raw, base);
    if (isNaN(n) || !Number.isSafeInteger(n) || n < 0) return null;
    // vérifie que tous les chiffres sont valides pour la base
    if (parseInt(n.toString(base), base) !== n) return null;
    return n;
  }, [val, base]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="card p-5 h-fit space-y-4">
        <label className="block">
          <span className="label !text-muted mb-1.5 block">Valeur</span>
          <input className="field font-mono" value={val} onChange={(e) => setVal(e.target.value)} spellCheck={false} />
        </label>
        <label className="block">
          <span className="label !text-muted mb-1.5 block">Base d&apos;entrée</span>
          <div className="flex gap-1.5">
            {[
              { b: 2, l: "BIN" },
              { b: 8, l: "OCT" },
              { b: 10, l: "DEC" },
              { b: 16, l: "HEX" },
            ].map((o) => (
              <button
                key={o.b}
                onClick={() => setBase(o.b)}
                className={`hud-tab hud-tab--chip flex-1 px-2 py-1.5 font-mono text-[10px] ${
                  base === o.b ? "is-active text-secondary" : "text-muted hover:text-ink"
                }`}
              >
                <span className="relative z-10">{o.l}</span>
              </button>
            ))}
          </div>
        </label>
      </section>
      <section className="card p-5">
        {parsed !== null ? (
          <div>
            <Row label="Décimal" value={parsed.toString(10)} />
            <Row label="Hexadécimal" value={"0x" + parsed.toString(16).toUpperCase()} />
            <Row label="Octal" value={"0o" + parsed.toString(8)} />
            <Row label="Binaire" value={"0b" + parsed.toString(2)} />
            {parsed <= 0x10ffff && parsed > 0 && (
              <Row label="Caractère" value={safeChar(parsed)} />
            )}
          </div>
        ) : (
          <p className="font-mono text-body-sm text-danger">⚠ Valeur invalide pour la base choisie.</p>
        )}
      </section>
    </div>
  );
}

function safeChar(n: number): string {
  try {
    const c = String.fromCodePoint(n);
    return /\p{C}/u.test(c) ? `U+${n.toString(16).toUpperCase()}` : c;
  } catch {
    return "—";
  }
}
