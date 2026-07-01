"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Badge, Button } from "@/components/ui";
import { useToast } from "@/components/Toast";

interface Member {
  email: string;
  name: string;
  avatar?: string;
  score: number;
  solves: { name: string; points: number; cat?: string; at: number }[];
}
interface Team {
  id: string;
  name: string;
  tag: string;
  owner: string;
  members: string[];
  createdAt: number;
}
interface TeamLite {
  id: string;
  name: string;
  tag: string;
  members: string[];
}

export default function TeamPage() {
  const { push } = useToast();
  const [my, setMy] = useState<{ team: Team; members: Member[] } | null>(null);
  const [teams, setTeams] = useState<TeamLite[]>([]);
  const [kv, setKv] = useState(true);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");

  const load = useCallback(() => {
    fetch("/api/social/teams", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { myTeam?: { team: Team; members: Member[] } | null; teams?: TeamLite[]; kvReady?: boolean }) => {
        setMy(d.myTeam ?? null);
        setTeams(d.teams ?? []);
        setKv(d.kvReady ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const act = async (payload: Record<string, unknown>, okMsg: string) => {
    const res = await fetch("/api/social/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    push("ok", okMsg);
    setName("");
    setTag("");
    load();
  };

  return (
    <div>
      <PageHeader
        code="TEAM // ESCOUADE"
        title="Équipe"
        desc="Regroupe-toi pour les CTF : membres, points, et visualisation des unlocks de chacun."
      />

      {!kv && (
        <div className="card mb-5 border-warning/40 p-4">
          <p className="font-mono text-xs text-warning">⚠ Base Vercel KV requise pour les équipes.</p>
        </div>
      )}

      {loading ? (
        <p className="font-mono text-body-sm text-muted">Chargement…</p>
      ) : my ? (
        <div className="space-y-6">
          <div className="hud-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="clip-chamfer-sm border border-secondary/50 bg-secondary/10 px-2.5 py-1 font-mono text-sm text-secondary">
                  [{my.team.tag}]
                </span>
                <div>
                  <h2 className="font-display text-h3 text-ink-strong">{my.team.name}</h2>
                  <span className="font-mono text-label text-muted">{my.team.members.length} membre(s)</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => act({ action: "leave" }, "Équipe quittée.")}>
                Quitter l&apos;équipe
              </Button>
            </div>
          </div>

          <section>
            <h3 className="label mb-3">Membres · unlocks</h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {my.members.map((m) => (
                <div key={m.email} className="card p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <Avatar src={m.avatar} name={m.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-sm text-ink-strong">{m.name}</span>
                      <span className="font-mono text-label text-muted">{m.email === my.team.owner ? "capitaine · " : ""}{m.solves.length} unlock(s)</span>
                    </div>
                    <span className="font-display text-h3 tabular-nums text-secondary">{m.score}</span>
                  </div>
                  {m.solves.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                      {m.solves.slice(0, 8).map((s) => (
                        <li key={s.at} className="clip-chamfer-sm border border-line-strong px-2 py-0.5 font-mono text-[10px] text-muted" title={`${s.points} pts`}>
                          ✓ {s.name}
                        </li>
                      ))}
                      {m.solves.length > 8 && <li className="font-mono text-[10px] text-muted">+{m.solves.length - 8}</li>}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="card h-fit p-5">
            <h2 className="label mb-4">Créer une équipe</h2>
            <label className="mb-3 block">
              <span className="label !text-muted mb-1.5 block">Nom</span>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Les Fantômes 077" />
            </label>
            <label className="mb-4 block">
              <span className="label !text-muted mb-1.5 block">Tag (2-6, A-Z/0-9)</span>
              <input className="field font-mono uppercase" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="GH077" maxLength={6} />
            </label>
            <Button variant="signal" className="w-full justify-center" onClick={() => act({ action: "create", name, tag }, "Équipe créée.")}>
              Créer
            </Button>
          </section>

          <section>
            <h2 className="label mb-4">Rejoindre une équipe · {teams.length}</h2>
            {teams.length === 0 ? (
              <div className="card p-8 text-center font-mono text-sm text-muted">[ aucune équipe — crée la première ]</div>
            ) : (
              <ul className="space-y-2">
                {teams.map((t) => (
                  <li key={t.id} className="card flex items-center gap-3 p-3">
                    <span className="clip-chamfer-sm border border-line-strong px-2 py-0.5 font-mono text-xs text-secondary">[{t.tag}]</span>
                    <span className="flex-1 truncate font-mono text-sm text-ink-strong">{t.name}</span>
                    <Badge variant="neutral">{t.members.length}/12</Badge>
                    <Button variant="ghost" size="sm" onClick={() => act({ action: "join", id: t.id }, "Équipe rejointe.")}>
                      Rejoindre
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
