"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";

const OWNER = "clem.berton.92@gmail.com";

interface Account {
  email: string;
  name: string;
  provider: string;
  role: "admin" | "operator";
  status: "active" | "banned";
  firstSeen: number;
  lastSeen: number;
  logins: number;
}

interface Tool {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  command?: string;
  tags: string[];
  addedBy: string;
  addedAt: number;
}

type Tab = "users" | "tools";

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("users");

  if (user?.role !== "admin") {
    return (
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <StatusDot state="danger" />
          <span className="label text-danger">ACCÈS REFUSÉ — ADM</span>
        </div>
        <h1 className="font-display font-bold text-3xl text-ink mb-3">
          Zone réservée à l&apos;administrateur
        </h1>
        <p className="max-w-2xl text-muted leading-relaxed font-mono text-sm">
          [ERR] 403 — votre session ({user?.role ?? "anonyme"}) ne dispose pas
          des privilèges requis.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        code="ADM // PANNEAU D'ADMINISTRATION"
        title="Administration"
        desc="Gestion des comptes, des permissions et de l'arsenal d'outils."
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {(
          [
            ["users", "Utilisateurs"],
            ["tools", "Outils"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-[1.5px] border transition-colors ${
              tab === id
                ? "border-primary text-primary bg-primary/10"
                : "border-line-strong text-muted hover:text-ink hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "users" ? <UsersPanel /> : <ToolsPanel />}
    </div>
  );
}

function KvWarning() {
  return (
    <div className="card p-3 mb-5 border-warning/40">
      <p className="font-mono text-[11px] text-warning leading-relaxed">
        ⚠ Base de données non connectée. Crée un store <span className="text-ink">Vercel KV</span>{" "}
        (Storage → Create Database → KV) et relie-le au projet : les comptes et outils seront
        alors persistés. Sans elle, la connexion marche mais rien n&apos;est enregistré.
      </p>
    </div>
  );
}

/* ───────────── Utilisateurs ───────────── */

function UsersPanel() {
  const { push } = useToast();
  const [users, setUsers] = useState<Account[]>([]);
  const [kvReady, setKvReady] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/users", { cache: "no-store" });
      const d = await r.json();
      setUsers(d.users ?? []);
      setKvReady(d.kvReady ?? false);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (email: string, body: Record<string, string>) => {
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, ...body }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      push("err", d.error || "Échec de la mise à jour.");
      return;
    }
    push("ok", "Compte mis à jour.");
    load();
  };

  const fmt = (ts: number) => (ts ? new Date(ts).toLocaleString("fr-FR") : "—");

  return (
    <div>
      {!kvReady && <KvWarning />}
      <div className="flex items-center justify-between mb-4">
        <h2 className="label">Comptes ({users.length})</h2>
        <button onClick={load} className="btn btn-ghost !py-1.5 !px-3 text-[11px]">
          ⟳ Rafraîchir
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-muted">chargement…</p>
      ) : users.length === 0 ? (
        <div className="card p-6 text-center font-mono text-sm text-muted">
          [ aucun compte enregistré ] — les comptes apparaissent dès la première connexion.
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const owner = u.email.toLowerCase() === OWNER;
            return (
              <div key={u.email} className="card p-3 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-ink truncate">{u.name}</span>
                    <span
                      className={`text-[9px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${
                        u.role === "admin"
                          ? "text-primary border-primary/40"
                          : "text-muted border-line-strong"
                      }`}
                    >
                      {u.role}
                    </span>
                    {u.status === "banned" && (
                      <span className="text-[9px] font-mono uppercase tracking-[1px] text-danger border border-danger/40 px-1.5 py-0.5">
                        banni
                      </span>
                    )}
                    {owner && (
                      <span className="text-[9px] font-mono uppercase tracking-[1px] text-secondary border border-secondary/40 px-1.5 py-0.5">
                        owner
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-muted truncate">
                    {u.email} · {u.provider}
                  </div>
                  <div className="font-mono text-[10px] text-muted/80 mt-0.5">
                    rejoint {fmt(u.firstSeen)} · vu {fmt(u.lastSeen)} · {u.logins} login(s)
                  </div>
                </div>
                {!owner && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        patch(u.email, { role: u.role === "admin" ? "operator" : "admin" })
                      }
                      className="btn btn-ghost !py-1.5 !px-2.5 text-[10px]"
                    >
                      {u.role === "admin" ? "↓ operator" : "↑ admin"}
                    </button>
                    <button
                      onClick={() =>
                        patch(u.email, { status: u.status === "banned" ? "active" : "banned" })
                      }
                      className={`btn !py-1.5 !px-2.5 text-[10px] ${
                        u.status === "banned" ? "btn-ghost" : "btn-ghost !text-danger !border-danger/40"
                      }`}
                    >
                      {u.status === "banned" ? "réactiver" : "bannir"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────── Outils ───────────── */

const EMPTY = { name: "", url: "", category: "", description: "", command: "", tags: "" };

function ToolsPanel() {
  const { push } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/tools", { cache: "no-store" });
      const d = await r.json();
      setTools(d.tools ?? []);
    } catch {
      setTools([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        push("err", d.error || "Échec de l'ajout.");
        return;
      }
      push("ok", "Outil ajouté.");
      setForm({ ...EMPTY });
      load();
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    const r = await fetch(`/api/admin/tools?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) {
      push("ok", "Outil supprimé.");
      load();
    } else {
      push("err", "Échec de la suppression.");
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      {/* Formulaire d'ajout */}
      <form onSubmit={add} className="card p-4 space-y-3 h-fit">
        <h2 className="label !text-secondary mb-1">Ajouter un outil</h2>
        <input className="field" placeholder="Nom *" value={form.name} onChange={set("name")} required />
        <input className="field" placeholder="URL * (https://…)" value={form.url} onChange={set("url")} required />
        <input className="field" placeholder="Catégorie (ex. Recon, Web…)" value={form.category} onChange={set("category")} />
        <input className="field" placeholder="Commande / exemple (optionnel)" value={form.command} onChange={set("command")} />
        <input className="field" placeholder="Tags (séparés par des virgules)" value={form.tags} onChange={set("tags")} />
        <textarea
          className="field min-h-[100px] resize-y"
          placeholder="Documentation / notes…"
          value={form.description}
          onChange={set("description")}
        />
        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center disabled:opacity-50">
          {busy ? "Ajout…" : "+ Ajouter"}
        </button>
      </form>

      {/* Liste */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="label">Outils ({tools.length})</h2>
          <button onClick={load} className="btn btn-ghost !py-1.5 !px-3 text-[11px]">
            ⟳ Rafraîchir
          </button>
        </div>
        {tools.length === 0 ? (
          <div className="card p-6 text-center font-mono text-sm text-muted">
            [ aucun outil ajouté ] — remplis le formulaire pour en créer un.
          </div>
        ) : (
          <div className="space-y-3">
            {tools.map((t) => (
              <div key={t.id} className="card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm text-ink hover:text-secondary transition-colors"
                    >
                      {t.name} ↗
                    </a>
                    <div className="font-mono text-[10px] text-muted mt-0.5">
                      {t.category}
                      {t.tags.length > 0 && <> · {t.tags.map((x) => `#${x}`).join(" ")}</>}
                    </div>
                  </div>
                  <button
                    onClick={() => del(t.id)}
                    className="text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-danger shrink-0"
                  >
                    suppr.
                  </button>
                </div>
                {t.description && (
                  <p className="mt-2 text-xs text-muted leading-relaxed whitespace-pre-wrap">{t.description}</p>
                )}
                {t.command && (
                  <pre className="mt-2 bg-base/70 border border-line px-2.5 py-1.5 text-[11px] text-secondary/90 overflow-x-auto">
                    {t.command}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
