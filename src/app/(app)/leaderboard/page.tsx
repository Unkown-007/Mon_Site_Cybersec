"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/ui";

interface Row {
  email: string;
  name: string;
  avatar?: string;
  handle?: string;
  country?: string;
  score: number;
  solves: { name: string; points: number; at: number }[];
  role: string;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [me, setMe] = useState("");
  const [kv, setKv] = useState(true);

  useEffect(() => {
    fetch("/api/social/leaderboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { rows?: Row[]; me?: string; kvReady?: boolean }) => {
        setRows(d.rows ?? []);
        setMe(d.me ?? "");
        setKv(d.kvReady ?? false);
      })
      .catch(() => setRows([]));
  }, []);

  return (
    <div>
      <PageHeader
        code="LDR // CLASSEMENT"
        title="Leaderboard"
        desc="Classement des opérateurs par points d'unlocks (solves). Ajoute les tiens depuis ton profil."
      />

      {!kv && (
        <div className="card mb-5 border-warning/40 p-4">
          <p className="font-mono text-xs text-warning">
            ⚠ Base Vercel KV non connectée — le classement reste vide tant qu&apos;un store n&apos;est pas branché.
          </p>
        </div>
      )}

      {rows === null ? (
        <p className="font-mono text-body-sm text-muted">Chargement…</p>
      ) : rows.length === 0 ? (
        <div className="card p-8 text-center font-mono text-sm text-muted">[ aucun opérateur classé ]</div>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.email} className={`card flex items-center gap-3 p-3 ${r.email === me ? "border-secondary/60" : ""}`}>
              <span className={`w-8 shrink-0 text-center font-display text-h3 ${i < 3 ? "text-secondary" : "text-muted"}`}>
                {i + 1}
              </span>
              <Avatar src={r.avatar} name={r.name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-mono text-sm text-ink-strong">{r.name}</span>
                  {r.email === me && <Badge variant="signal">toi</Badge>}
                  {r.role === "admin" && <Badge variant="accent">admin</Badge>}
                </div>
                <span className="font-mono text-label text-muted">
                  {r.handle ? `@${r.handle} · ` : ""}
                  {r.solves.length} unlock(s)
                  {r.country ? ` · ${r.country}` : ""}
                </span>
              </div>
              <span className="shrink-0 font-display text-h3 tabular-nums text-secondary">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
