"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { Badge } from "@/components/ui";
import { SHELLS, LISTENERS, fillTpl, type ShellTpl } from "@/lib/revshells";
import { md5, sha } from "@/lib/hashing";
import { GTFO_BINS, GTFO_FUNCTIONS, type GtfoFunction, type GtfoPlatform } from "@/data/gtfobins";

type Tab = "revshell" | "gtfo" | "codec" | "hash" | "jwt" | "gen" | "hashid" | "cidr" | "time";
const TABS: { id: Tab; label: string }[] = [
  { id: "revshell", label: "Reverse Shell" },
  { id: "gtfo", label: "GTFOBins / LOLBAS" },
  { id: "codec", label: "Encodeur / Décodeur" },
  { id: "hash", label: "Hash" },
  { id: "jwt", label: "JWT" },
  { id: "gen", label: "Générateur" },
  { id: "hashid", label: "Hash ID" },
  { id: "cidr", label: "CIDR / IP" },
  { id: "time", label: "Timestamp" },
];

export default function ToolkitPage() {
  const [tab, setTab] = useState<Tab>("revshell");

  return (
    <div>
      <PageHeader
        code="KIT // BOÎTE À OUTILS"
        title="Toolkit"
        desc="Utilitaires offensifs qui tournent en local dans ton navigateur — aucune donnée envoyée."
      />

      <div className="card p-3 mb-6 border-warning/30">
        <p className="font-mono text-[11px] text-warning leading-relaxed">
          ⚠ À usage légal uniquement (pentest autorisé, CTF, apprentissage). Tout est calculé côté client.
        </p>
      </div>

      {/* onglets */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-[1.5px] border transition-colors ${
              tab === t.id
                ? "border-primary text-primary bg-primary/10"
                : "border-line-strong text-muted hover:text-ink hover:border-primary/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "revshell" && <RevShell />}
      {tab === "gtfo" && <Gtfobins />}
      {tab === "codec" && <Codec />}
      {tab === "hash" && <HashTool />}
      {tab === "jwt" && <JwtTool />}
      {tab === "gen" && <Generator />}
      {tab === "hashid" && <HashId />}
      {tab === "cidr" && <CidrTool />}
      {tab === "time" && <TimeTool />}
    </div>
  );
}

/* ───────────── helpers de copie ───────────── */

function CopyBlock({ label, value }: { label?: string; value: string }) {
  const { push } = useToast();
  return (
    <div className="relative">
      {label && <div className="label !text-muted mb-1.5">{label}</div>}
      <button
        onClick={() =>
          navigator.clipboard.writeText(value).then(() => push("ok", "Copié."))
        }
        className="absolute top-1.5 right-1.5 text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-secondary transition-colors z-10"
        aria-label="Copier"
      >
        ⧉ Copier
      </button>
      <pre className="bg-base/70 border border-line px-3 py-2.5 overflow-x-auto text-xs leading-relaxed text-secondary/90 font-mono whitespace-pre-wrap break-all">
        {value || "—"}
      </pre>
    </div>
  );
}

/* Toggle segmenté réutilisable (état actif = signal cyan). */
function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-ring rounded-sm border px-2.5 py-1 font-mono text-label uppercase transition-colors duration-fast ease-out-soft ${
        active
          ? "border-secondary bg-secondary/10 text-secondary"
          : "border-line-strong text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ───────────── 1. Reverse shell ───────────── */

type EncMode = "none" | "url" | "b64" | "psenc";
const ENC_OPTIONS: { id: EncMode; label: string }[] = [
  { id: "none", label: "Brut" },
  { id: "url", label: "URL" },
  { id: "b64", label: "Base64" },
  { id: "psenc", label: "PS -enc" },
];

// Base64 d'une chaîne encodée en UTF-16LE (format attendu par `powershell -e`).
function utf16leB64(s: string): string {
  const bytes = new Uint8Array(s.length * 2);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    bytes[i * 2] = c & 0xff;
    bytes[i * 2 + 1] = (c >> 8) & 0xff;
  }
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function encodeRev(cmd: string, mode: EncMode): string {
  switch (mode) {
    case "none":
      return cmd;
    case "url":
      return encodeURIComponent(cmd);
    case "b64":
      return `echo ${btoa(unescape(encodeURIComponent(cmd)))} | base64 -d | sh`;
    case "psenc":
      return `powershell -e ${utf16leB64(cmd)}`;
  }
}

function RevShell() {
  const [ip, setIp] = useState("10.10.14.1");
  const [port, setPort] = useState("4444");
  const [os, setOs] = useState<ShellTpl["os"] | "All">("All");
  const [enc, setEnc] = useState<EncMode>("none");

  const shells = useMemo(
    () => SHELLS.filter((s) => os === "All" || s.os === os),
    [os]
  );

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
        <label className="block">
          <span className="label mb-2 block">LHOST (ton IP)</span>
          <input className="field" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.10.14.1" aria-label="LHOST" />
        </label>
        <label className="block">
          <span className="label mb-2 block">LPORT</span>
          <input className="field" value={port} onChange={(e) => setPort(e.target.value)} placeholder="4444" aria-label="LPORT" />
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        <div>
          <span className="label mb-2 block">Système</span>
          <div className="flex flex-wrap gap-2">
            {(["All", "Linux", "Windows", "Multi"] as const).map((o) => (
              <Toggle key={o} active={os === o} onClick={() => setOs(o)}>
                {o}
              </Toggle>
            ))}
          </div>
        </div>
        <div>
          <span className="label mb-2 block">Encodage</span>
          <div className="flex flex-wrap gap-2">
            {ENC_OPTIONS.map((o) => (
              <Toggle key={o.id} active={enc === o.id} onClick={() => setEnc(o.id)}>
                {o.label}
              </Toggle>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {shells.map((s) => (
          <div key={s.name} className="rounded-md border border-line bg-surface p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-body-sm text-ink">{s.name}</span>
              <Badge>{s.os}</Badge>
            </div>
            <CopyBlock value={encodeRev(fillTpl(s.parts, ip, port), enc)} />
          </div>
        ))}
      </div>

      <div>
        <h2 className="label mb-3">Listeners</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {LISTENERS.map((l) => (
            <div key={l.name} className="rounded-md border border-line bg-surface p-3">
              <div className="font-mono text-body-sm text-ink mb-2">{l.name}</div>
              <CopyBlock value={fillTpl(l.parts, ip, port)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── 1bis. GTFOBins / LOLBAS (read-only) ───────────── */

function Gtfobins() {
  const [q, setQ] = useState("");
  const [fn, setFn] = useState<GtfoFunction | "all">("all");
  const [plat, setPlat] = useState<GtfoPlatform | "all">("all");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return GTFO_BINS.filter(
      (b) =>
        (plat === "all" || b.platform === plat) &&
        (fn === "all" || b.functions.includes(fn)) &&
        (!query || b.name.toLowerCase().includes(query)),
    );
  }, [q, fn, plat]);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl font-mono text-body-sm text-muted">
        Binaires détournables — GTFOBins (Unix) &amp; LOLBAS (Windows). Read-only :
        chaque entrée renvoie à sa fiche officielle. {GTFO_BINS.length} binaires indexés.
      </p>

      {/* Recherche — élément focal cyan */}
      <div className="flex items-center gap-3 rounded-md border border-secondary/40 bg-surface px-4 py-3 transition-[border-color,box-shadow] duration-base ease-out-soft [--glow-color:var(--secondary)] focus-within:border-secondary focus-within:shadow-glow">
        <span className="shrink-0 font-mono text-sm text-secondary">// SEARCH</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="binaire (bash, certutil, vim…)"
          spellCheck={false}
          className="flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-muted"
          aria-label="Rechercher un binaire"
        />
      </div>

      {/* Filtres */}
      <div className="space-y-3">
        <div>
          <span className="label mb-2 block">Plateforme</span>
          <div className="flex flex-wrap gap-2">
            <Toggle active={plat === "all"} onClick={() => setPlat("all")}>Toutes</Toggle>
            <Toggle active={plat === "unix"} onClick={() => setPlat("unix")}>Unix</Toggle>
            <Toggle active={plat === "windows"} onClick={() => setPlat("windows")}>Windows</Toggle>
          </div>
        </div>
        <div>
          <span className="label mb-2 block">Fonction</span>
          <div className="flex flex-wrap gap-2">
            <Toggle active={fn === "all"} onClick={() => setFn("all")}>Toutes</Toggle>
            {GTFO_FUNCTIONS.map((f) => (
              <Toggle key={f} active={fn === f} onClick={() => setFn(f)}>
                {f}
              </Toggle>
            ))}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <span className="label">Résultats</span>
        <span className="font-mono text-label text-muted">{results.length} binaire(s)</span>
      </div>
      {results.length === 0 ? (
        <div className="rounded-md border border-line bg-surface p-8 text-center font-mono text-body-sm text-muted">
          [ aucun binaire ]
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {results.map((b) => (
            <li key={b.platform + b.name}>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring block rounded-md border border-line bg-surface p-3 transition-[transform,border-color] duration-base ease-out-soft hover:-translate-y-0.5 hover:border-line-strong"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-body-sm text-ink">
                    {b.name} <span className="text-muted">↗</span>
                  </span>
                  <Badge>{b.platform}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {b.functions.map((f) => (
                    <Badge key={f}>{f}</Badge>
                  ))}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────────── 2. Encodeur / Décodeur ───────────── */

const b64e = (s: string) => btoa(unescape(encodeURIComponent(s)));
const b64d = (s: string) => decodeURIComponent(escape(atob(s)));
const hexe = (s: string) =>
  Array.from(new TextEncoder().encode(s)).map((b) => b.toString(16).padStart(2, "0")).join("");
const hexd = (s: string) => {
  const clean = s.replace(/[^0-9a-fA-F]/g, "");
  const bytes = clean.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) ?? [];
  return new TextDecoder().decode(new Uint8Array(bytes));
};
const rot13 = (s: string) =>
  s.replace(/[a-zA-Z]/g, (c) =>
    String.fromCharCode((c <= "Z" ? 90 : 122) >= c.charCodeAt(0) + 13 ? c.charCodeAt(0) + 13 : c.charCodeAt(0) - 13)
  );

function safe(fn: (s: string) => string, s: string) {
  try {
    return fn(s);
  } catch {
    return "[erreur de décodage]";
  }
}

function Codec() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const rows =
    mode === "encode"
      ? [
          { k: "Base64", v: input ? safe(b64e, input) : "" },
          { k: "URL", v: input ? encodeURIComponent(input) : "" },
          { k: "Hex", v: input ? hexe(input) : "" },
          { k: "ROT13", v: input ? rot13(input) : "" },
        ]
      : [
          { k: "Base64", v: input ? safe(b64d, input) : "" },
          { k: "URL", v: input ? safe(decodeURIComponent, input) : "" },
          { k: "Hex", v: input ? safe(hexd, input) : "" },
          { k: "ROT13", v: input ? rot13(input) : "" },
        ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex gap-2">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-[1.5px] border transition-colors ${
              mode === m ? "border-primary text-primary bg-primary/10" : "border-line-strong text-muted hover:text-ink"
            }`}
          >
            {m === "encode" ? "Encoder" : "Décoder"}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "texte à encoder…" : "chaîne à décoder…"}
        spellCheck={false}
        className="field min-h-[110px] resize-y"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <CopyBlock key={r.k} label={r.k} value={r.v} />
        ))}
      </div>
    </div>
  );
}

/* ───────────── 3. Hash ───────────── */

function HashTool() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({ md5: "", sha1: "", sha256: "", sha512: "" });

  useEffect(() => {
    let alive = true;
    if (!input) {
      setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
      return;
    }
    (async () => {
      const [s1, s256, s512] = await Promise.all([
        sha("SHA-1", input),
        sha("SHA-256", input),
        sha("SHA-512", input),
      ]);
      if (alive) setHashes({ md5: md5(input), sha1: s1, sha256: s256, sha512: s512 });
    })();
    return () => {
      alive = false;
    };
  }, [input]);

  return (
    <div className="space-y-5 max-w-3xl">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="texte à hacher…"
        spellCheck={false}
        className="field min-h-[90px] resize-y"
      />
      <div className="space-y-3">
        <CopyBlock label="MD5" value={hashes.md5} />
        <CopyBlock label="SHA-1" value={hashes.sha1} />
        <CopyBlock label="SHA-256" value={hashes.sha256} />
        <CopyBlock label="SHA-512" value={hashes.sha512} />
      </div>
    </div>
  );
}

/* ───────────── 4. JWT ───────────── */

const b64urlDecode = (s: string) => {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(pad + "=".repeat((4 - (pad.length % 4)) % 4))));
};

function JwtTool() {
  const [token, setToken] = useState("");

  const parsed = useMemo(() => {
    const parts = token.trim().split(".");
    if (parts.length < 2) return null;
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      return { header, payload, sig: parts[2] ?? "" };
    } catch {
      return { error: true };
    }
  }, [token]);

  const human = (ts: unknown) =>
    typeof ts === "number" ? new Date(ts * 1000).toLocaleString("fr-FR") : null;

  return (
    <div className="space-y-5 max-w-3xl">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="eyJhbGciOi…"
        spellCheck={false}
        className="field min-h-[90px] resize-y break-all"
      />
      {!token ? null : !parsed || "error" in parsed ? (
        <p className="font-mono text-sm text-danger">[ token invalide ou illisible ]</p>
      ) : (
        <div className="space-y-4">
          <CopyBlock label="Header" value={JSON.stringify(parsed.header, null, 2)} />
          <CopyBlock label="Payload" value={JSON.stringify(parsed.payload, null, 2)} />
          <div className="card p-3 font-mono text-xs space-y-1 text-muted">
            {parsed.payload.exp && (
              <div>
                exp → <span className="text-ink">{human(parsed.payload.exp)}</span>
                {parsed.payload.exp * 1000 < Date.now() && <span className="text-danger"> (expiré)</span>}
              </div>
            )}
            {parsed.payload.iat && (
              <div>
                iat → <span className="text-ink">{human(parsed.payload.iat)}</span>
              </div>
            )}
            <div className="text-warning/80">
              ⚠ signature non vérifiée — déchiffrage d&apos;affichage uniquement.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── 5. Générateur (mots de passe / UUID / hex) ───────────── */

function Generator() {
  const { push } = useToast();
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [pw, setPw] = useState("");
  const [uuid, setUuid] = useState("");
  const [hex, setHex] = useState("");

  const regen = useCallback(() => {
    let pool = "";
    if (opts.lower) pool += "abcdefghijkmnpqrstuvwxyz";
    if (opts.upper) pool += "ABCDEFGHJKLMNPQRSTUVWXYZ";
    if (opts.digits) pool += "23456789";
    if (opts.symbols) pool += "!@#$%^&*()-_=+[]{};:,.?";
    if (pool) {
      const a = new Uint32Array(len);
      crypto.getRandomValues(a);
      let out = "";
      for (let i = 0; i < len; i++) out += pool[a[i] % pool.length];
      setPw(out);
    } else setPw("");
    setUuid(crypto.randomUUID());
    const hb = new Uint8Array(16);
    crypto.getRandomValues(hb);
    setHex(Array.from(hb).map((b) => b.toString(16).padStart(2, "0")).join(""));
  }, [len, opts]);

  useEffect(() => {
    regen();
  }, [regen]);

  const poolSize =
    (opts.lower ? 23 : 0) + (opts.upper ? 23 : 0) + (opts.digits ? 8 : 0) + (opts.symbols ? 22 : 0);
  const entropy = poolSize ? Math.round(len * Math.log2(poolSize)) : 0;
  const strength =
    entropy < 50 ? "faible" : entropy < 80 ? "correcte" : entropy < 120 ? "forte" : "excellente";
  const strengthColor =
    entropy < 50 ? "text-danger" : entropy < 80 ? "text-warning" : "text-success";
  const barColor =
    entropy < 50 ? "bg-danger" : entropy < 80 ? "bg-warning" : "bg-success";

  const toggle = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Mot de passe */}
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="label !text-secondary">Mot de passe</span>
          <button onClick={regen} className="btn btn-ghost !py-1.5 !px-3 text-[11px]">
            ⟳ Régénérer
          </button>
        </div>
        <CopyBlock value={pw} />
        <label className="block">
          <span className="font-mono text-[11px] text-muted">Longueur : {len}</span>
          <input
            type="range"
            min={8}
            max={64}
            value={len}
            onChange={(e) => setLen(Number(e.target.value))}
            className="deck-range w-full mt-1.5"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["lower", "a-z"],
              ["upper", "A-Z"],
              ["digits", "0-9"],
              ["symbols", "!@#"],
            ] as const
          ).map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => toggle(k)}
              aria-pressed={opts[k]}
              className={`px-2.5 py-1 font-mono text-xs uppercase tracking-[1px] border transition-colors ${
                opts[k]
                  ? "border-secondary text-secondary bg-secondary/10"
                  : "border-line-strong text-muted hover:text-ink"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
            <span className="text-muted">Entropie ≈ {entropy} bits</span>
            <span className={strengthColor}>{strength}</span>
          </div>
          <div className="h-1.5 w-full bg-base overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all`}
              style={{ width: `${Math.min(100, (entropy / 128) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* UUID + hex */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card p-3 space-y-2">
          <span className="label !text-muted">UUID v4</span>
          <CopyBlock value={uuid} />
        </div>
        <div className="card p-3 space-y-2">
          <span className="label !text-muted">128 bits aléatoires (hex)</span>
          <CopyBlock value={hex} />
        </div>
      </div>
      <p className="font-mono text-[10px] text-muted">
        Généré via <span className="text-secondary">crypto.getRandomValues</span> (CSPRNG du
        navigateur) — caractères ambigus (l, I, O, 0, 1) exclus.{" "}
        <button onClick={() => navigator.clipboard.writeText(pw).then(() => push("ok", "Copié."))} className="text-secondary hover:text-primary">copier le mdp</button>
      </p>
    </div>
  );
}

/* ───────────── 6. Identification de hash ───────────── */

function identifyHash(s: string): string[] {
  if (!s) return [];
  if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(s)) return ["bcrypt"];
  if (/^\$1\$/.test(s)) return ["MD5 crypt (Unix)"];
  if (/^\$5\$/.test(s)) return ["SHA-256 crypt (Unix)"];
  if (/^\$6\$/.test(s)) return ["SHA-512 crypt (Unix)"];
  if (/^\$argon2[id]{1,2}\$/.test(s)) return ["Argon2"];
  if (/^[0-9a-f]{32}:[0-9a-f]+$/i.test(s)) return ["MD5 salé (hash:salt)"];
  if (/^[0-9a-fA-F]+$/.test(s)) {
    switch (s.length) {
      case 32:
        return ["MD5", "NTLM", "MD4", "LM (moitié)"];
      case 40:
        return ["SHA-1", "RIPEMD-160"];
      case 56:
        return ["SHA-224", "SHA3-224"];
      case 64:
        return ["SHA-256", "SHA3-256", "BLAKE2s"];
      case 96:
        return ["SHA-384", "SHA3-384"];
      case 128:
        return ["SHA-512", "SHA3-512", "BLAKE2b"];
      default:
        return [`hexadécimal (${s.length} caractères) — type inconnu`];
    }
  }
  return ["format non reconnu"];
}

function HashId() {
  const [h, setH] = useState("");
  const guesses = useMemo(() => identifyHash(h.trim()), [h]);

  return (
    <div className="space-y-5 max-w-2xl">
      <input
        value={h}
        onChange={(e) => setH(e.target.value)}
        placeholder="colle un hash…"
        spellCheck={false}
        className="field break-all"
      />
      {h.trim() && (
        <div className="card p-4">
          <div className="label !text-muted mb-3">Types probables</div>
          <div className="flex flex-wrap gap-2">
            {guesses.map((g) => (
              <span
                key={g}
                className="font-mono text-xs px-2.5 py-1 border border-secondary/40 text-secondary bg-secondary/5"
              >
                {g}
              </span>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] text-muted">
            Heuristique sur longueur/format — à confirmer avec hashid/hashcat selon le contexte.
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────── 7. Calculateur CIDR / IPv4 ───────────── */

function CidrTool() {
  const [cidr, setCidr] = useState("10.10.10.0/24");

  const info = useMemo(() => {
    const m = cidr.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
    if (!m) return null;
    const oct = [1, 2, 3, 4].map((i) => Number(m[i]));
    const bits = Number(m[5]);
    if (oct.some((o) => o > 255) || bits > 32) return null;
    const ipNum = ((oct[0] << 24) >>> 0) + (oct[1] << 16) + (oct[2] << 8) + oct[3];
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - bits);
    const fmt = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
    return {
      mask: fmt(mask),
      wildcard: fmt(~mask >>> 0),
      network: fmt(network),
      broadcast: fmt(broadcast),
      first: fmt(bits >= 31 ? network : network + 1),
      last: fmt(bits >= 31 ? broadcast : broadcast - 1),
      total,
      usable: bits >= 31 ? total : Math.max(0, total - 2),
    };
  }, [cidr]);

  return (
    <div className="space-y-5 max-w-2xl">
      <input
        value={cidr}
        onChange={(e) => setCidr(e.target.value)}
        placeholder="10.10.10.0/24"
        spellCheck={false}
        className="field font-mono"
      />
      {!info ? (
        <p className="font-mono text-sm text-danger">[ CIDR invalide — format a.b.c.d/n ]</p>
      ) : (
        <div className="card p-4 grid sm:grid-cols-2 gap-y-2 gap-x-6 font-mono text-xs">
          <Row k="Masque" v={info.mask} />
          <Row k="Wildcard" v={info.wildcard} />
          <Row k="Réseau" v={info.network} />
          <Row k="Broadcast" v={info.broadcast} />
          <Row k="1ʳᵉ IP" v={info.first} />
          <Row k="Dernière IP" v={info.last} />
          <Row k="Total" v={info.total.toLocaleString("fr-FR")} />
          <Row k="Hôtes utiles" v={info.usable.toLocaleString("fr-FR")} />
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line pb-1">
      <span className="text-muted uppercase tracking-[1px]">{k}</span>
      <span className="text-ink">{v}</span>
    </div>
  );
}

/* ───────────── 8. Convertisseur Timestamp ───────────── */

function TimeTool() {
  const [val, setVal] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsed = useMemo(() => {
    const t = val.trim();
    if (!t) return null;
    let ms: number | null = null;
    if (/^\d{10}$/.test(t)) ms = Number(t) * 1000;
    else if (/^\d{13}$/.test(t)) ms = Number(t);
    else {
      const d = Date.parse(t);
      if (!isNaN(d)) ms = d;
    }
    if (ms === null) return null;
    const d = new Date(ms);
    return {
      local: d.toLocaleString("fr-FR"),
      iso: d.toISOString(),
      epoch: String(Math.floor(ms / 1000)),
      ms: String(ms),
    };
  }, [val]);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="card p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted">Maintenant</span>
        <span className="text-secondary">{Math.floor(now / 1000)}</span>
        <span className="text-ink">{new Date(now).toLocaleString("fr-FR")}</span>
      </div>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="epoch (s ou ms) ou date (2026-06-16, 16/06/2026…)"
        spellCheck={false}
        className="field font-mono"
      />
      {val.trim() && !parsed && (
        <p className="font-mono text-sm text-danger">[ date / timestamp illisible ]</p>
      )}
      {parsed && (
        <div className="space-y-3">
          <CopyBlock label="Local (fr-FR)" value={parsed.local} />
          <CopyBlock label="ISO 8601 (UTC)" value={parsed.iso} />
          <CopyBlock label="Epoch (s)" value={parsed.epoch} />
          <CopyBlock label="Epoch (ms)" value={parsed.ms} />
        </div>
      )}
    </div>
  );
}
