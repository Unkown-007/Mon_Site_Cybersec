"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";

type TabId = "ports" | "http" | "hash";

const TABS: { id: TabId; label: string; code: string }[] = [
  { id: "ports", label: "Ports", code: "NET" },
  { id: "http", label: "Codes HTTP", code: "WEB" },
  { id: "hash", label: "ID de hash", code: "CRK" },
];

/* ── Data ── */
const PORTS: { port: string; proto: string; service: string; note: string }[] = [
  { port: "21", proto: "tcp", service: "FTP", note: "Transfert de fichiers (souvent anonyme)" },
  { port: "22", proto: "tcp", service: "SSH", note: "Shell distant chiffré" },
  { port: "23", proto: "tcp", service: "Telnet", note: "Shell distant en clair" },
  { port: "25", proto: "tcp", service: "SMTP", note: "Envoi d'emails" },
  { port: "53", proto: "tcp/udp", service: "DNS", note: "Résolution de noms (zone transfer)" },
  { port: "67/68", proto: "udp", service: "DHCP", note: "Attribution d'IP" },
  { port: "80", proto: "tcp", service: "HTTP", note: "Web non chiffré" },
  { port: "88", proto: "tcp", service: "Kerberos", note: "Authentification AD" },
  { port: "110", proto: "tcp", service: "POP3", note: "Récupération d'emails" },
  { port: "111", proto: "tcp/udp", service: "RPCbind", note: "Portmapper (NFS/NIS)" },
  { port: "135", proto: "tcp", service: "MSRPC", note: "RPC Windows" },
  { port: "137-139", proto: "tcp/udp", service: "NetBIOS", note: "Partage Windows hérité" },
  { port: "143", proto: "tcp", service: "IMAP", note: "Boîte mail" },
  { port: "161", proto: "udp", service: "SNMP", note: "Supervision (community strings)" },
  { port: "389", proto: "tcp", service: "LDAP", note: "Annuaire (AD)" },
  { port: "443", proto: "tcp", service: "HTTPS", note: "Web chiffré (TLS)" },
  { port: "445", proto: "tcp", service: "SMB", note: "Partage de fichiers Windows" },
  { port: "464", proto: "tcp", service: "Kpasswd", note: "Changement de mot de passe Kerberos" },
  { port: "500", proto: "udp", service: "IKE", note: "VPN IPsec" },
  { port: "514", proto: "udp", service: "Syslog", note: "Journaux distants" },
  { port: "587", proto: "tcp", service: "SMTP", note: "Soumission d'emails (auth)" },
  { port: "636", proto: "tcp", service: "LDAPS", note: "Annuaire chiffré" },
  { port: "993", proto: "tcp", service: "IMAPS", note: "IMAP chiffré" },
  { port: "1433", proto: "tcp", service: "MSSQL", note: "Base Microsoft SQL Server" },
  { port: "1521", proto: "tcp", service: "Oracle", note: "Base Oracle DB" },
  { port: "2049", proto: "tcp", service: "NFS", note: "Partage de fichiers Unix" },
  { port: "3268", proto: "tcp", service: "LDAP GC", note: "Global Catalog AD" },
  { port: "3306", proto: "tcp", service: "MySQL", note: "Base MySQL/MariaDB" },
  { port: "3389", proto: "tcp", service: "RDP", note: "Bureau à distance Windows" },
  { port: "5060", proto: "tcp/udp", service: "SIP", note: "VoIP" },
  { port: "5432", proto: "tcp", service: "PostgreSQL", note: "Base PostgreSQL" },
  { port: "5900", proto: "tcp", service: "VNC", note: "Bureau à distance" },
  { port: "5985/5986", proto: "tcp", service: "WinRM", note: "Gestion distante Windows (HTTP/HTTPS)" },
  { port: "6379", proto: "tcp", service: "Redis", note: "Cache clé-valeur (souvent sans auth)" },
  { port: "8080", proto: "tcp", service: "HTTP-alt", note: "Proxy / web applicatif" },
  { port: "8443", proto: "tcp", service: "HTTPS-alt", note: "Web admin (Tomcat…)" },
  { port: "9200", proto: "tcp", service: "Elasticsearch", note: "Moteur de recherche/logs" },
  { port: "11211", proto: "tcp/udp", service: "Memcached", note: "Cache (amplification DDoS)" },
  { port: "27017", proto: "tcp", service: "MongoDB", note: "Base NoSQL" },
];

const HTTP: { code: string; name: string; tone: string; note: string }[] = [
  { code: "200", name: "OK", tone: "text-success", note: "Succès" },
  { code: "201", name: "Created", tone: "text-success", note: "Ressource créée" },
  { code: "204", name: "No Content", tone: "text-success", note: "Succès sans corps" },
  { code: "301", name: "Moved Permanently", tone: "text-secondary", note: "Redirection permanente" },
  { code: "302", name: "Found", tone: "text-secondary", note: "Redirection temporaire" },
  { code: "304", name: "Not Modified", tone: "text-secondary", note: "Cache valide" },
  { code: "307", name: "Temporary Redirect", tone: "text-secondary", note: "Redirection (méthode conservée)" },
  { code: "308", name: "Permanent Redirect", tone: "text-secondary", note: "Redirection perm. (méthode conservée)" },
  { code: "400", name: "Bad Request", tone: "text-warning", note: "Requête malformée" },
  { code: "401", name: "Unauthorized", tone: "text-warning", note: "Authentification requise" },
  { code: "403", name: "Forbidden", tone: "text-warning", note: "Accès refusé (fuzzing utile)" },
  { code: "404", name: "Not Found", tone: "text-warning", note: "Ressource absente" },
  { code: "405", name: "Method Not Allowed", tone: "text-warning", note: "Verbe HTTP interdit" },
  { code: "408", name: "Request Timeout", tone: "text-warning", note: "Délai dépassé" },
  { code: "409", name: "Conflict", tone: "text-warning", note: "Conflit d'état" },
  { code: "418", name: "I'm a teapot", tone: "text-muted", note: "Easter egg RFC 2324" },
  { code: "429", name: "Too Many Requests", tone: "text-warning", note: "Rate limiting" },
  { code: "500", name: "Internal Server Error", tone: "text-danger", note: "Erreur serveur (stack traces ?)" },
  { code: "501", name: "Not Implemented", tone: "text-danger", note: "Verbe non supporté" },
  { code: "502", name: "Bad Gateway", tone: "text-danger", note: "Proxy en amont KO" },
  { code: "503", name: "Service Unavailable", tone: "text-danger", note: "Surcharge / maintenance" },
  { code: "504", name: "Gateway Timeout", tone: "text-danger", note: "Amont trop lent" },
];

const HASHES: { name: string; sig: string; example: string }[] = [
  { name: "MD5", sig: "32 hex", example: "5f4dcc3b5aa765d61d8327deb882cf99" },
  { name: "NTLM", sig: "32 hex", example: "b4b9b02e6f09a9bd760f388b67351e2b" },
  { name: "SHA-1", sig: "40 hex", example: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8" },
  { name: "MySQL 4.1+", sig: "40 hex, préfixe *", example: "*2470C0C06DEE42FD1618BB99005ADCA2EC9D1E19" },
  { name: "SHA-256", sig: "64 hex", example: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b…" },
  { name: "SHA-512", sig: "128 hex", example: "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980…" },
  { name: "bcrypt", sig: "$2a$ / $2b$ / $2y$", example: "$2b$12$R9h/cIPz0gi.URNNX3kh2O…" },
  { name: "sha256crypt", sig: "$5$", example: "$5$rounds=5000$salt$hash" },
  { name: "sha512crypt", sig: "$6$", example: "$6$salt$hash…" },
  { name: "Argon2", sig: "$argon2id$", example: "$argon2id$v=19$m=65536,t=3,p=4$…" },
  { name: "NetNTLMv2", sig: "user::domain:…", example: "admin::LAB:1122…:hash:blob" },
  { name: "Kerberos 5 TGS", sig: "$krb5tgs$23$", example: "$krb5tgs$23$*user$REALM*…" },
];

export default function ReferencePage() {
  const [tab, setTab] = useState<TabId>("ports");
  const [q, setQ] = useState("");

  const ports = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PORTS;
    return PORTS.filter((p) => `${p.port} ${p.service} ${p.note}`.toLowerCase().includes(s));
  }, [q]);

  return (
    <div>
      <PageHeader
        code="REF // MÉMENTO"
        title="Référence"
        desc="Aide-mémoire pentest : ports & services, codes HTTP, identification de hash."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`hud-tab hud-tab--chip focus-ring px-3.5 py-1.5 font-mono text-xs ${
                tab === t.id ? "is-active text-secondary" : "text-muted hover:text-ink"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-[9px] text-muted">{t.code}</span>
                {t.label}
              </span>
            </button>
          ))}
        </div>
        {tab === "ports" && (
          <input
            className="field ml-auto max-w-[220px]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="filtrer un port/service…"
            spellCheck={false}
          />
        )}
      </div>

      {tab === "ports" && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ports.map((p) => (
            <div key={p.port + p.service} className="card p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-sm text-secondary">{p.port}</span>
                <span className="text-[9px] font-mono uppercase text-muted">{p.proto}</span>
              </div>
              <div className="font-mono text-sm text-ink-strong">{p.service}</div>
              <p className="mt-0.5 text-label text-muted leading-snug">{p.note}</p>
            </div>
          ))}
          {ports.length === 0 && (
            <div className="card p-6 text-center font-mono text-sm text-muted sm:col-span-2 lg:col-span-3">
              [ aucun port ]
            </div>
          )}
        </div>
      )}

      {tab === "http" && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {HTTP.map((h) => (
            <li key={h.code} className="card flex items-center gap-3 p-3">
              <span className={`font-display text-h3 ${h.tone}`}>{h.code}</span>
              <div className="min-w-0">
                <div className="font-mono text-sm text-ink-strong">{h.name}</div>
                <p className="text-label text-muted">{h.note}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "hash" && (
        <div className="grid gap-2 lg:grid-cols-2">
          {HASHES.map((h) => (
            <div key={h.name} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-ink-strong">{h.name}</span>
                <span className="clip-chamfer-sm border border-line-strong px-2 py-0.5 text-[10px] font-mono text-secondary">
                  {h.sig}
                </span>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-sm border border-line bg-base/60 p-2 font-mono text-[11px] text-muted">
                {h.example}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
