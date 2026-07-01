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

const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM_ACCENT = ["text-warning border-warning/50", "text-muted border-line-strong", "text-primary border-primary/40"];

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

  const top = (rows ?? []).slice(0, 3);
  const rest = (rows ?? []).slice(3);
  const myPos = (rows ?? []).findIndex((r) => r.email === me);

  return (
    <div>
      <PageHeader
        code="LDR // CLASSEMENT"
        title="Leaderboard"
        desc="Classement des opérateurs par points d'unlocks. Ajoute les tiens depuis ton profil."
        right={myPos >= 0 ? <Badge variant="signal" dot>ton rang · #{myPos + 1}</Badge> : undefined}
      />

      {!kv && (
        <div className="card mb-5 border-warning/40 p-4">
          <p className="font-mono text-xs text-warning">⚠ Base Vercel KV non connectée — classement vide sans store.</p>
        </div>
      )}

      {rows === null ? (
        <p className="font-mono text-body-sm text-muted">Chargement…</p>
      ) : rows.length === 0 ? (
        <div className="card p-8 text-center font-mono text-sm text-muted">[ aucun opérateur classé ]</div>
      ) : (
        <>
          {/* Podium */}
          {top.length > 0 && (
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {top.map((r, i) => (
                <div key={r.email} className={`hud-panel flex flex-col items-center p-5 text-center ${r.email === me ? "!border-secondary/60" : ""}`}>
                  <span className="text-3xl">{MEDAL[i]}</span>
                  <Avatar src={r.avatar} name={r.name} size={56} />
                  <span className="mt-2 max-w-full truncate font-mono text-sm text-ink-strong">{r.name}</span>
                  <span className={`font-display text-h2 tabular-nums ${PODIUM_ACCENT[i].split(" ")[0]}`}>{r.score}</span>
                  <span className="font-mono text-label text-muted">{r.solves.length} unlock(s)</span>
                </div>
              ))}
            </div>
          )}

          {/* Reste */}
          {rest.length > 0 && (
            <ol className="space-y-2">
              {rest.map((r, i) => (
                <li key={r.email} className={`card flex items-center gap-3 p-3 ${r.email === me ? "border-secondary/60" : ""}`}>
                  <span className="w-8 shrink-0 text-center font-display text-h3 text-muted">{i + 4}</span>
                  <Avatar src={r.avatar} name={r.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-sm text-ink-strong">{r.name}</span>
                      {r.email === me && <Badge variant="signal">toi</Badge>}
                      {r.role === "admin" && <Badge variant="accent">admin</Badge>}
                    </div>
                    <span className="font-mono text-label text-muted">
                      {r.handle ? `@${r.handle} · ` : ""}{r.solves.length} unlock(s){r.country ? ` · ${r.country}` : ""}
                    </span>
                  </div>
                  <span className="shrink-0 font-display text-h3 tabular-nums text-secondary">{r.score}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
