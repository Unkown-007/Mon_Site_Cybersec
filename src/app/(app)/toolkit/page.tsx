"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { SHELLS, LISTENERS, fillTpl, type ShellTpl } from "@/lib/revshells";
import { md5, sha } from "@/lib/hashing";

type Tab = "revshell" | "codec" | "hash" | "jwt";
const TABS: { id: Tab; label: string }[] = [
  { id: "revshell", label: "Reverse Shell" },
  { id: "codec", label: "Encodeur / Décodeur" },
  { id: "hash", label: "Hash" },
  { id: "jwt", label: "JWT" },
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
      {tab === "codec" && <Codec />}
      {tab === "hash" && <HashTool />}
      {tab === "jwt" && <JwtTool />}
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

/* ───────────── 1. Reverse shell ───────────── */

function RevShell() {
  const [ip, setIp] = useState("10.10.14.1");
  const [port, setPort] = useState("4444");
  const [os, setOs] = useState<ShellTpl["os"] | "All">("All");

  const shells = useMemo(
    () => SHELLS.filter((s) => os === "All" || s.os === os),
    [os]
  );

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
        <label className="block">
          <span className="label !text-muted block mb-1.5">LHOST (ton IP)</span>
          <input className="field" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.10.14.1" />
        </label>
        <label className="block">
          <span className="label !text-muted block mb-1.5">LPORT</span>
          <input className="field" value={port} onChange={(e) => setPort(e.target.value)} placeholder="4444" />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "Linux", "Windows", "Multi"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOs(o)}
            className={`px-2.5 py-1 font-mono text-xs uppercase tracking-[1px] border transition-colors ${
              os === o ? "border-secondary text-secondary bg-secondary/10" : "border-line-strong text-muted hover:text-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {shells.map((s) => (
          <div key={s.name} className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm text-ink">{s.name}</span>
              <span className="text-[10px] font-mono uppercase tracking-[1px] text-muted border border-line px-1.5 py-0.5">
                {s.os}
              </span>
            </div>
            <CopyBlock value={fillTpl(s.parts, ip, port)} />
          </div>
        ))}
      </div>

      <div>
        <h2 className="label mb-3">Listeners</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {LISTENERS.map((l) => (
            <div key={l.name} className="card p-3">
              <div className="font-mono text-sm text-ink mb-2">{l.name}</div>
              <CopyBlock value={fillTpl(l.parts, ip, port)} />
            </div>
          ))}
        </div>
      </div>
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
