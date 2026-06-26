"use client";

import { useCallback, useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { Badge, Button, Panel } from "@/components/ui";
import { SHELLS, LISTENERS, fillTpl, type ShellTpl } from "@/lib/revshells";
import { md5, sha } from "@/lib/hashing";
import { GTFO_BINS, GTFO_FUNCTIONS, type GtfoFunction, type GtfoPlatform } from "@/data/gtfobins";
import { usePerf } from "@/lib/perf";
import { useReducedMotion, motion } from "framer-motion";
import { ToolkitTabSkeleton } from "@/components/ui/ToolkitTabSkeleton";

type Tab = "revshell" | "gtfo" | "codec" | "pipe" | "hash" | "jwt" | "cvss" | "cmd" | "gen" | "hashid" | "cidr" | "time";
const TABS: { id: Tab; label: string }[] = [
  { id: "revshell", label: "Reverse Shell" },
  { id: "gtfo", label: "GTFOBins / LOLBAS" },
  { id: "codec", label: "Encodeur / Décodeur" },
  { id: "pipe", label: "Pipeline" },
  { id: "hash", label: "Hash" },
  { id: "jwt", label: "JWT" },
  { id: "cvss", label: "CVSS" },
  { id: "cmd", label: "Command Builder" },
  { id: "gen", label: "Générateur" },
  { id: "hashid", label: "Hash ID" },
  { id: "cidr", label: "CIDR / IP" },
  { id: "time", label: "Timestamp" },
];

export default function ToolkitPage() {
  const { lite } = usePerf();
  const shouldReduceMotion = useReducedMotion();
  const disableAnimation = lite || (shouldReduceMotion ?? false);

  const [tab, setTab] = useState<Tab>("revshell");
  const [activeTab, setActiveTab] = useState<Tab>("revshell");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const changeTab = (newTab: Tab) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTab(newTab);

    if (disableAnimation) {
      setActiveTab(newTab);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      setActiveTab(newTab);
      setLoading(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
            onClick={() => changeTab(t.id)}
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

      {loading ? (
        <ToolkitTabSkeleton tabId={tab} />
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: disableAnimation ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: disableAnimation ? 0 : 0.2 }}
        >
          {activeTab === "revshell" && <RevShell />}
          {activeTab === "gtfo" && <Gtfobins />}
          {activeTab === "codec" && <Codec />}
          {activeTab === "pipe" && <Pipeline />}
          {activeTab === "hash" && <HashTool />}
          {activeTab === "jwt" && <JwtTool />}
          {activeTab === "cvss" && <CvssTool />}
          {activeTab === "cmd" && <CmdBuilder />}
          {activeTab === "gen" && <Generator />}
          {activeTab === "hashid" && <HashId />}
          {activeTab === "cidr" && <CidrTool />}
          {activeTab === "time" && <TimeTool />}
        </motion.div>
      )}
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
        <span className="shrink-0 font-mono text-sm text-secondary">{"// SEARCH"}</span>
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

/* ───────────── 2bis. Pipeline d'encodage (CyberChef-lite) ───────────── */

const PIPE_OPS: { id: string; label: string; fn: (s: string) => string }[] = [
  { id: "b64e", label: "Base64 ▸ encode", fn: (s) => safe(b64e, s) },
  { id: "b64d", label: "Base64 ▸ decode", fn: (s) => safe(b64d, s) },
  { id: "urle", label: "URL ▸ encode", fn: (s) => encodeURIComponent(s) },
  { id: "urld", label: "URL ▸ decode", fn: (s) => safe(decodeURIComponent, s) },
  { id: "hexe", label: "Hex ▸ encode", fn: (s) => hexe(s) },
  { id: "hexd", label: "Hex ▸ decode", fn: (s) => safe(hexd, s) },
  { id: "rot13", label: "ROT13", fn: rot13 },
  {
    id: "uni-e",
    label: "Unicode ▸ \\uXXXX",
    fn: (s) =>
      Array.from(s)
        .map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"))
        .join(""),
  },
  {
    id: "uni-d",
    label: "Unicode ▸ decode",
    fn: (s) =>
      safe(
        (x) => x.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))),
        s,
      ),
  },
  { id: "rev", label: "Inverser", fn: (s) => Array.from(s).reverse().join("") },
  { id: "upper", label: "MAJUSCULES", fn: (s) => s.toUpperCase() },
  { id: "lower", label: "minuscules", fn: (s) => s.toLowerCase() },
];

const PIPE_MAP = new Map(PIPE_OPS.map((o) => [o.id, o]));

function Pipeline() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<string[]>(["b64e"]);
  const [sel, setSel] = useState(PIPE_OPS[0].id);

  const output = useMemo(() => {
    let cur = input;
    for (const id of steps) {
      const op = PIPE_MAP.get(id);
      if (op) cur = op.fn(cur);
    }
    return cur;
  }, [input, steps]);

  const add = () => setSteps((s) => [...s, sel]);
  const remove = (i: number) => setSteps((s) => s.filter((_, j) => j !== i));
  const move = (i: number, d: number) =>
    setSteps((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const n = [...s];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div className="max-w-3xl space-y-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="entrée…"
        spellCheck={false}
        className="field min-h-[90px] resize-y"
        aria-label="Entrée du pipeline"
      />

      {/* Construction de la recette */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          className="field !w-auto !py-2"
          aria-label="Opération à ajouter"
        >
          {PIPE_OPS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="sm" onClick={add}>
          + Ajouter l&apos;étape
        </Button>
        {steps.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSteps([])}>
            Vider
          </Button>
        )}
      </div>

      {/* Étapes ordonnées */}
      {steps.length === 0 ? (
        <p className="font-mono text-body-sm text-muted">
          [ recette vide — ajoute des étapes, elles s&apos;appliquent de haut en bas ]
        </p>
      ) : (
        <ol className="space-y-2">
          {steps.map((id, i) => (
            <li
              key={`${id}-${i}`}
              className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2"
            >
              <span className="label text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 font-mono text-body-sm text-ink">{PIPE_MAP.get(id)?.label}</span>
              <div className="flex items-center gap-1">
                <IconBtn label="Monter" onClick={() => move(i, -1)} disabled={i === 0}>↑</IconBtn>
                <IconBtn label="Descendre" onClick={() => move(i, 1)} disabled={i === steps.length - 1}>↓</IconBtn>
                <IconBtn label="Retirer" onClick={() => remove(i)}>✕</IconBtn>
              </div>
            </li>
          ))}
        </ol>
      )}

      <CopyBlock label="Sortie" value={output} />
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="focus-ring rounded-sm border border-line-strong px-2 py-1 font-mono text-xs text-muted transition-colors duration-fast ease-out-soft hover:text-secondary disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
    </button>
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

// ── Helpers de forge JWT (HS256 / none) ──
const b64urlFromString = (s: string) =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const b64urlFromBytes = (bytes: Uint8Array) => {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

// Dictionnaire COURT de secrets faibles courants (démo pédagogique).
const WEAK_SECRETS = [
  "secret", "password", "123456", "admin", "root", "key", "jwt", "token",
  "changeme", "test", "qwerty", "letmein", "welcome", "default", "private",
  "supersecret", "secretkey", "secret123", "your-256-bit-secret", "mysecret",
  "s3cr3t", "p@ssw0rd", "abc123", "passw0rd", "secret_key", "jwtsecret",
  "Password1", "admin123", "0000", "iloveyou",
];

type CrackState = "idle" | "running" | "found" | "notfound" | "na";

function JwtTool() {
  const [token, setToken] = useState("");

  // Forge
  const [payloadText, setPayloadText] = useState(
    '{\n  "sub": "1337",\n  "name": "operator",\n  "role": "admin"\n}',
  );
  const [secret, setSecret] = useState("secret");
  const [alg, setAlg] = useState<"HS256" | "none">("HS256");
  const [forged, setForged] = useState("");
  const [forgeErr, setForgeErr] = useState(false);

  // Test de secret faible
  const [crack, setCrack] = useState<CrackState>("idle");
  const [found, setFound] = useState("");

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

  // Forge en direct (HS256 signé, ou alg:none non signé).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const payloadObj = JSON.parse(payloadText);
        const header = { alg, typ: "JWT" };
        const data = `${b64urlFromString(JSON.stringify(header))}.${b64urlFromString(
          JSON.stringify(payloadObj),
        )}`;
        const out =
          alg === "none" ? `${data}.` : `${data}.${b64urlFromBytes(await hmacSha256(secret, data))}`;
        if (alive) {
          setForged(out);
          setForgeErr(false);
        }
      } catch {
        if (alive) {
          setForged("");
          setForgeErr(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [payloadText, secret, alg]);

  const testWeak = useCallback(async () => {
    const parts = token.trim().split(".");
    if (parts.length < 3 || !parts[2]) {
      setCrack("na");
      return;
    }
    try {
      const h = JSON.parse(b64urlDecode(parts[0]));
      if (h.alg !== "HS256") {
        setCrack("na");
        return;
      }
    } catch {
      setCrack("na");
      return;
    }
    setCrack("running");
    const data = `${parts[0]}.${parts[1]}`;
    for (const s of WEAK_SECRETS) {
      if (b64urlFromBytes(await hmacSha256(s, data)) === parts[2]) {
        setFound(s);
        setCrack("found");
        return;
      }
    }
    setCrack("notfound");
  }, [token]);

  const human = (ts: unknown) =>
    typeof ts === "number" ? new Date(ts * 1000).toLocaleString("fr-FR") : null;

  return (
    <div className="max-w-3xl space-y-8">
      {/* ── Décodage ── */}
      <div className="space-y-5">
        <span className="label">Décoder un token</span>
        <textarea
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setCrack("idle");
          }}
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
            <div className="rounded-md border border-line bg-surface p-3 font-mono text-body-sm space-y-1 text-muted">
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
              <div className="text-warning">
                ⚠ signature non vérifiée — déchiffrage d&apos;affichage uniquement.
              </div>
            </div>

            {/* Test de secret faible (sur le token ci-dessus) */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="signal" size="sm" onClick={testWeak} disabled={crack === "running"}>
                {crack === "running" ? "Test en cours…" : "Tester les secrets faibles"}
              </Button>
              {crack === "found" && (
                <span className="font-mono text-body-sm text-danger">
                  secret trouvé : <span className="text-ink">{found}</span> — token cassable
                </span>
              )}
              {crack === "notfound" && (
                <span className="font-mono text-body-sm text-success">
                  aucun secret du dictionnaire ({WEAK_SECRETS.length}) ne correspond
                </span>
              )}
              {crack === "na" && (
                <span className="font-mono text-body-sm text-muted">
                  test indisponible (token non HS256 ou sans signature)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Forge ── */}
      <Panel code="HS256 / none" title="Forger un token">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Toggle active={alg === "HS256"} onClick={() => setAlg("HS256")}>
              HS256
            </Toggle>
            <Toggle active={alg === "none"} onClick={() => setAlg("none")}>
              alg:none
            </Toggle>
          </div>

          <label className="block">
            <span className="label mb-2 block">Payload (JSON)</span>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              spellCheck={false}
              className="field min-h-[120px] resize-y font-mono"
              aria-label="Payload JSON"
            />
          </label>

          <label className="block">
            <span className="label mb-2 block">
              Secret {alg === "none" && "(ignoré — alg:none)"}
            </span>
            <input
              className="field"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              disabled={alg === "none"}
              placeholder="secret de signature"
              aria-label="Secret HMAC"
            />
          </label>

          {forgeErr ? (
            <p className="font-mono text-sm text-danger">[ payload JSON invalide ]</p>
          ) : (
            <CopyBlock label="Token forgé" value={forged} />
          )}

          <p className="font-mono text-label text-muted">
            {alg === "none"
              ? "alg:none = signature vide. Teste les implémentations qui ne vérifient pas l'algorithme."
              : "Signé en HS256 via Web Crypto (HMAC-SHA256), côté client."}
          </p>
        </div>
      </Panel>
    </div>
  );
}

/* ───────────── 4bis. Calculateur CVSS (v3.1 score + v4.0 vecteur) ───────────── */

interface Metric {
  key: string;
  label: string;
  opts: [string, string][];
}

const V31_METRICS: Metric[] = [
  { key: "AV", label: "Attack Vector", opts: [["N", "Network"], ["A", "Adjacent"], ["L", "Local"], ["P", "Physical"]] },
  { key: "AC", label: "Attack Complexity", opts: [["L", "Low"], ["H", "High"]] },
  { key: "PR", label: "Privileges Required", opts: [["N", "None"], ["L", "Low"], ["H", "High"]] },
  { key: "UI", label: "User Interaction", opts: [["N", "None"], ["R", "Required"]] },
  { key: "S", label: "Scope", opts: [["U", "Unchanged"], ["C", "Changed"]] },
  { key: "C", label: "Confidentiality", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { key: "I", label: "Integrity", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { key: "A", label: "Availability", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
];

const V40_METRICS: Metric[] = [
  { key: "AV", label: "Attack Vector", opts: [["N", "Network"], ["A", "Adjacent"], ["L", "Local"], ["P", "Physical"]] },
  { key: "AC", label: "Attack Complexity", opts: [["L", "Low"], ["H", "High"]] },
  { key: "AT", label: "Attack Requirements", opts: [["N", "None"], ["P", "Present"]] },
  { key: "PR", label: "Privileges Required", opts: [["N", "None"], ["L", "Low"], ["H", "High"]] },
  { key: "UI", label: "User Interaction", opts: [["N", "None"], ["P", "Passive"], ["A", "Active"]] },
  { key: "VC", label: "Confidentiality (Vuln.)", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { key: "VI", label: "Integrity (Vuln.)", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { key: "VA", label: "Availability (Vuln.)", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { key: "SC", label: "Confidentiality (Sys.)", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { key: "SI", label: "Integrity (Sys.)", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { key: "SA", label: "Availability (Sys.)", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
];

const num = (map: Record<string, number>, k: string) => map[k] ?? 0;

function roundup(x: number): number {
  const i = Math.round(x * 100000);
  return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10;
}

function scoreV31(s: Record<string, string>): number {
  const av = num({ N: 0.85, A: 0.62, L: 0.55, P: 0.2 }, s.AV);
  const ac = num({ L: 0.77, H: 0.44 }, s.AC);
  const pr =
    s.S === "U"
      ? num({ N: 0.85, L: 0.62, H: 0.27 }, s.PR)
      : num({ N: 0.85, L: 0.68, H: 0.5 }, s.PR);
  const ui = num({ N: 0.85, R: 0.62 }, s.UI);
  const cia = (v: string) => num({ H: 0.56, L: 0.22, N: 0 }, v);
  const iss = 1 - (1 - cia(s.C)) * (1 - cia(s.I)) * (1 - cia(s.A));
  const impact =
    s.S === "U" ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  const expl = 8.22 * av * ac * pr * ui;
  if (impact <= 0) return 0;
  return s.S === "U"
    ? roundup(Math.min(impact + expl, 10))
    : roundup(Math.min(1.08 * (impact + expl), 10));
}

function severity(x: number): { label: string; variant: "neutral" | "success" | "warning" | "danger" } {
  if (x === 0) return { label: "None", variant: "neutral" };
  if (x < 4) return { label: "Low", variant: "success" };
  if (x < 7) return { label: "Medium", variant: "warning" };
  return { label: x < 9 ? "High" : "Critical", variant: "danger" };
}

const vector = (prefix: string, metrics: Metric[], s: Record<string, string>) =>
  `${prefix}/` + metrics.map((m) => `${m.key}:${s[m.key]}`).join("/");

function MetricGrid({
  metrics,
  sel,
  onSet,
}: {
  metrics: Metric[];
  sel: Record<string, string>;
  onSet: (k: string, v: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {metrics.map((m) => (
        <div key={m.key}>
          <span className="label mb-2 block">
            {m.key} · {m.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {m.opts.map(([v, lbl]) => (
              <Toggle key={v} active={sel[m.key] === v} onClick={() => onSet(m.key, v)}>
                {v} <span className="opacity-60">{lbl}</span>
              </Toggle>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const defaults = (metrics: Metric[]): Record<string, string> =>
  Object.fromEntries(metrics.map((m) => [m.key, m.opts[0][0]]));

function CvssTool() {
  const [ver, setVer] = useState<"3.1" | "4.0">("3.1");
  const [s31, setS31] = useState<Record<string, string>>(() => defaults(V31_METRICS));
  const [s40, setS40] = useState<Record<string, string>>(() => defaults(V40_METRICS));

  const score = useMemo(() => scoreV31(s31), [s31]);
  const sev = severity(score);
  const vec31 = vector("CVSS:3.1", V31_METRICS, s31);
  const vec40 = vector("CVSS:4.0", V40_METRICS, s40);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2">
        <Toggle active={ver === "3.1"} onClick={() => setVer("3.1")}>CVSS v3.1</Toggle>
        <Toggle active={ver === "4.0"} onClick={() => setVer("4.0")}>CVSS v4.0</Toggle>
      </div>

      {ver === "3.1" ? (
        <>
          <Panel focal>
            <div className="flex items-center gap-5">
              <span className="font-display text-display tabular-nums text-ink-strong">
                {score.toFixed(1)}
              </span>
              <div className="space-y-2">
                <Badge variant={sev.variant} dot>{sev.label}</Badge>
                <p className="text-body-sm text-muted">Base Score · CVSS v3.1</p>
              </div>
            </div>
          </Panel>
          <MetricGrid
            metrics={V31_METRICS}
            sel={s31}
            onSet={(k, v) => setS31((p) => ({ ...p, [k]: v }))}
          />
          <CopyBlock label="Vecteur" value={vec31} />
        </>
      ) : (
        <>
          <MetricGrid
            metrics={V40_METRICS}
            sel={s40}
            onSet={(k, v) => setS40((p) => ({ ...p, [k]: v }))}
          />
          <CopyBlock label="Vecteur CVSS v4.0" value={vec40} />
          <div className="rounded-md border border-line bg-surface p-4 space-y-3">
            <p className="text-body-sm text-muted">
              Le score numérique v4.0 repose sur la table de correspondance officielle
              de FIRST. Ouvre le vecteur dans le calculateur de référence pour l&apos;obtenir :
            </p>
            <Button
              variant="signal"
              size="sm"
              href={`https://www.first.org/cvss/calculator/4.0#${vec40}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Score officiel sur first.org ↗
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────── 4ter. Command builder (Nmap / Hashcat / John) ───────────── */

function FlagRow({
  flags,
  state,
  onToggle,
}: {
  flags: [string, string][];
  state: Record<string, boolean>;
  onToggle: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {flags.map(([k, lbl]) => (
        <Toggle key={k} active={!!state[k]} onClick={() => onToggle(k)}>
          {k} <span className="opacity-60">{lbl}</span>
        </Toggle>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      <input
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        aria-label={label}
      />
    </label>
  );
}

function NmapBuilder() {
  const [target, setTarget] = useState("10.10.10.10");
  const [ports, setPorts] = useState("");
  const [timing, setTiming] = useState("T4");
  const [out, setOut] = useState("");
  const [f, setF] = useState<Record<string, boolean>>({
    "-sC": true, "-sV": true, "-Pn": false, "-A": false,
    "-sS": false, "-sU": false, "-O": false, "--open": false, "-v": false,
  });
  const toggle = (k: string) => setF((p) => ({ ...p, [k]: !p[k] }));

  const cmd = useMemo(() => {
    const flags = Object.entries(f).filter(([, v]) => v).map(([k]) => k);
    return [
      "nmap",
      ...flags,
      timing ? `-${timing}` : "",
      ports ? `-p ${ports}` : "",
      out ? `-oN ${out}` : "",
      target || "<target>",
    ].filter(Boolean).join(" ");
  }, [f, timing, ports, out, target]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cible" value={target} onChange={setTarget} placeholder="10.10.10.10 / cible.htb" />
        <Field label="Ports (-p)" value={ports} onChange={setPorts} placeholder="- (tous) ou 22,80,443" />
      </div>
      <div>
        <span className="label mb-2 block">Options</span>
        <FlagRow
          flags={[
            ["-sC", "scripts"], ["-sV", "versions"], ["-A", "agressif"], ["-Pn", "no ping"],
            ["-sS", "SYN"], ["-sU", "UDP"], ["-O", "OS"], ["--open", "ouverts"], ["-v", "verbeux"],
          ]}
          state={f}
          onToggle={toggle}
        />
      </div>
      <div>
        <span className="label mb-2 block">Timing</span>
        <div className="flex flex-wrap gap-2">
          {["T2", "T3", "T4", "T5"].map((t) => (
            <Toggle key={t} active={timing === t} onClick={() => setTiming(t)}>{t}</Toggle>
          ))}
        </div>
      </div>
      <Field label="Sortie (-oN)" value={out} onChange={setOut} placeholder="scan.txt (optionnel)" />
      <CopyBlock label="Commande" value={cmd} />
    </div>
  );
}

const HC_MODES: [string, string][] = [
  ["0", "MD5"], ["100", "SHA1"], ["1400", "SHA-256"], ["1000", "NTLM"],
  ["1800", "sha512crypt"], ["3200", "bcrypt"], ["22000", "WPA"],
  ["13100", "Kerberoast TGS"], ["18200", "AS-REP"], ["5600", "NetNTLMv2"],
];
const HC_ATTACKS: [string, string][] = [["0", "dictionnaire"], ["3", "brute-force"], ["6", "hybride W+M"], ["1", "combinator"]];

function HashcatBuilder() {
  const [mode, setMode] = useState("1000");
  const [attack, setAttack] = useState("0");
  const [hashfile, setHashfile] = useState("hash.txt");
  const [wordlist, setWordlist] = useState("rockyou.txt");
  const [rules, setRules] = useState("");
  const [f, setF] = useState<Record<string, boolean>>({ "-O": false, "--force": false, "--show": false });
  const toggle = (k: string) => setF((p) => ({ ...p, [k]: !p[k] }));

  const cmd = useMemo(() => {
    const flags = Object.entries(f).filter(([, v]) => v).map(([k]) => k);
    const last = attack === "3" ? "?a?a?a?a?a?a" : wordlist || "wordlist.txt";
    return [
      "hashcat", "-m", mode, "-a", attack, hashfile || "hash.txt", last,
      rules ? `-r ${rules}` : "", ...flags,
    ].filter(Boolean).join(" ");
  }, [mode, attack, hashfile, wordlist, rules, f]);

  return (
    <div className="space-y-4">
      <div>
        <span className="label mb-2 block">Mode de hash (-m)</span>
        <div className="flex flex-wrap gap-2">
          {HC_MODES.map(([m, lbl]) => (
            <Toggle key={m} active={mode === m} onClick={() => setMode(m)}>{m} <span className="opacity-60">{lbl}</span></Toggle>
          ))}
        </div>
      </div>
      <div>
        <span className="label mb-2 block">Attaque (-a)</span>
        <div className="flex flex-wrap gap-2">
          {HC_ATTACKS.map(([a, lbl]) => (
            <Toggle key={a} active={attack === a} onClick={() => setAttack(a)}>{a} <span className="opacity-60">{lbl}</span></Toggle>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Fichier de hash" value={hashfile} onChange={setHashfile} placeholder="hash.txt" />
        <Field label="Wordlist" value={wordlist} onChange={setWordlist} placeholder="rockyou.txt" />
      </div>
      <Field label="Règles (-r)" value={rules} onChange={setRules} placeholder="best64.rule (optionnel)" />
      <div>
        <span className="label mb-2 block">Options</span>
        <FlagRow flags={[["-O", "optimisé"], ["--force", "force"], ["--show", "afficher"]]} state={f} onToggle={toggle} />
      </div>
      <CopyBlock label="Commande" value={cmd} />
    </div>
  );
}

function JohnBuilder() {
  const [hashfile, setHashfile] = useState("hash.txt");
  const [wordlist, setWordlist] = useState("rockyou.txt");
  const [format, setFormat] = useState("");
  const [f, setF] = useState<Record<string, boolean>>({ "--rules": false, "--incremental": false, "--show": false });
  const toggle = (k: string) => setF((p) => ({ ...p, [k]: !p[k] }));

  const cmd = useMemo(() => {
    const flags = Object.entries(f).filter(([, v]) => v).map(([k]) => k);
    return [
      "john",
      f["--incremental"] ? "" : wordlist ? `--wordlist=${wordlist}` : "",
      format ? `--format=${format}` : "",
      ...flags,
      hashfile || "hash.txt",
    ].filter(Boolean).join(" ");
  }, [hashfile, wordlist, format, f]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Fichier de hash" value={hashfile} onChange={setHashfile} placeholder="hash.txt" />
        <Field label="Wordlist (--wordlist)" value={wordlist} onChange={setWordlist} placeholder="rockyou.txt" />
      </div>
      <Field label="Format (--format)" value={format} onChange={setFormat} placeholder="nt, sha512crypt, krb5tgs… (optionnel)" />
      <div>
        <span className="label mb-2 block">Options</span>
        <FlagRow flags={[["--rules", "règles"], ["--incremental", "brute"], ["--show", "afficher"]]} state={f} onToggle={toggle} />
      </div>
      <CopyBlock label="Commande" value={cmd} />
    </div>
  );
}

function CmdBuilder() {
  const [tool, setTool] = useState<"nmap" | "hashcat" | "john">("nmap");
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["nmap", "hashcat", "john"] as const).map((t) => (
          <Toggle key={t} active={tool === t} onClick={() => setTool(t)}>{t}</Toggle>
        ))}
      </div>
      {tool === "nmap" && <NmapBuilder />}
      {tool === "hashcat" && <HashcatBuilder />}
      {tool === "john" && <JohnBuilder />}
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
