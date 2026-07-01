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
interface Task {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  assignee?: string;
  by: string;
  at: number;
}
const STATUS_NEXT: Record<Task["status"], Task["status"]> = { todo: "doing", doing: "done", done: "todo" };
const STATUS_STYLE: Record<Task["status"], string> = {
  todo: "border-line-strong text-muted",
  doing: "border-warning/50 text-warning",
  done: "border-success/50 text-success",
};
const STATUS_LABEL: Record<Task["status"], string> = { todo: "à faire", doing: "en cours", done: "fait" };

export default function TeamPage() {
  const { push } = useToast();
  const [my, setMy] = useState<{ team: Team; members: Member[] } | null>(null);
  const [teams, setTeams] = useState<TeamLite[]>([]);
  const [kv, setKv] = useState(true);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");

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

  const loadTasks = useCallback(() => {
    fetch("/api/social/tasks", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { tasks?: Task[] }) => setTasks(d.tasks ?? []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (my) loadTasks();
  }, [my, loadTasks]);

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

  const taskAct = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/social/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    setTasks(d.tasks ?? []);
    if (payload.action === "add") setTaskTitle("");
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

          {/* Travaux de groupe */}
          <section>
            <h3 className="label mb-3">
              Travaux de groupe · {tasks.filter((t) => t.status === "done").length}/{tasks.length}
            </h3>
            <div className="card p-5">
              <div className="mb-4 flex gap-2">
                <input
                  className="field"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Nouvelle tâche (ex. Résoudre la box Blue)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && taskTitle.trim()) taskAct({ action: "add", title: taskTitle });
                  }}
                />
                <Button variant="primary" size="sm" onClick={() => taskTitle.trim() && taskAct({ action: "add", title: taskTitle })}>
                  + Tâche
                </Button>
              </div>
              {tasks.length === 0 ? (
                <p className="font-mono text-body-sm text-muted">[ aucune tâche — crée-en pour organiser l&apos;équipe ]</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center gap-2 border-b border-line-subtle py-2 last:border-0">
                      <button
                        onClick={() => taskAct({ action: "update", id: t.id, status: STATUS_NEXT[t.status] })}
                        className={`clip-chamfer-sm border px-2 py-0.5 font-mono text-[10px] uppercase ${STATUS_STYLE[t.status]}`}
                        title="Changer le statut"
                      >
                        {STATUS_LABEL[t.status]}
                      </button>
                      <span className={`min-w-[140px] flex-1 font-mono text-body-sm ${t.status === "done" ? "text-muted line-through" : "text-ink"}`}>
                        {t.title}
                      </span>
                      <select
                        value={t.assignee ?? ""}
                        onChange={(e) => taskAct({ action: "update", id: t.id, assignee: e.target.value })}
                        className="field max-w-[140px] !px-2 !py-1 text-[11px]"
                        title="Assigner"
                      >
                        <option value="">— non assigné</option>
                        {my.members.map((m) => (
                          <option key={m.email} value={m.email} className="bg-surface">{m.name}</option>
                        ))}
                      </select>
                      <button onClick={() => taskAct({ action: "remove", id: t.id })} className="font-mono text-[10px] uppercase text-muted hover:text-danger">
                        suppr
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
