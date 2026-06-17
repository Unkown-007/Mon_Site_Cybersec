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

export default function AdminPage() {
  const { user } = useAuth();

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
        desc="Comptes & permissions. L'ajout/suppression de contenu se fait désormais directement dans chaque section (bouton « + Ajouter »)."
      />
      <UsersPanel />
    </div>
  );
}

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
      {!kvReady && (
        <div className="card p-3 mb-5 border-warning/40">
          <p className="font-mono text-[11px] text-warning leading-relaxed">
            ⚠ Base de données non connectée. Crée un store{" "}
            <span className="text-ink">Vercel KV</span> (Storage → Create Database → KV) et
            relie-le au projet : comptes et contenus seront alors persistés.
          </p>
        </div>
      )}
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
                        u.status === "banned"
                          ? "btn-ghost"
                          : "btn-ghost !text-danger !border-danger/40"
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
