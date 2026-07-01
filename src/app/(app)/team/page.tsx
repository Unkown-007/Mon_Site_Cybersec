"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Badge, Button } from "@/components/ui";
import { useToast } from "@/components/Toast";

interface Member { email: string; name: string; avatar?: string; score: number; solves: { name: string; points: number; cat?: string; at: number }[] }
interface Team { id: string; name: string; tag: string; owner: string; members: string[]; createdAt: number; desc?: string }
interface Standing { team: Team; score: number; unlocks: number }
interface Task { id: string; title: string; status: "todo" | "doing" | "done"; assignee?: string; by: string; at: number }
interface WallMsg { id: string; by: string; text: string; at: number }

const STATUS_NEXT: Record<Task["status"], Task["status"]> = { todo: "doing", doing: "done", done: "todo" };
const STATUS_STYLE: Record<Task["status"], string> = { todo: "border-line-strong text-muted", doing: "border-warning/50 text-warning", done: "border-success/50 text-success" };
const STATUS_LABEL: Record<Task["status"], string> = { todo: "à faire", doing: "en cours", done: "fait" };

function relTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

export default function TeamPage() {
  const { push } = useToast();
  const [my, setMy] = useState<{ team: Team; members: Member[] } | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [me, setMe] = useState("");
  const [myRank, setMyRank] = useState(0);
  const [kv, setKv] = useState(true);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [wall, setWall] = useState<WallMsg[]>([]);
  const [wallText, setWallText] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [eName, setEName] = useState("");
  const [eDesc, setEDesc] = useState("");

  const load = useCallback(() => {
    fetch("/api/social/teams", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { myTeam?: { team: Team; members: Member[] } | null; standings?: Standing[]; me?: string; myRank?: number; kvReady?: boolean }) => {
        setMy(d.myTeam ?? null);
        setStandings(d.standings ?? []);
        setMe(d.me ?? "");
        setMyRank(d.myRank ?? 0);
        setKv(d.kvReady ?? false);
        if (d.myTeam) { setEName(d.myTeam.team.name); setEDesc(d.myTeam.team.desc ?? ""); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const loadTasks = useCallback(() => {
    fetch("/api/social/tasks", { cache: "no-store" }).then((r) => r.json()).then((d: { tasks?: Task[] }) => setTasks(d.tasks ?? [])).catch(() => {});
  }, []);
  const loadWall = useCallback(() => {
    fetch("/api/social/wall", { cache: "no-store" }).then((r) => r.json()).then((d: { messages?: WallMsg[] }) => setWall(d.messages ?? [])).catch(() => {});
  }, []);
  useEffect(() => { if (my) { loadTasks(); loadWall(); } }, [my, loadTasks, loadWall]);

  const act = async (payload: Record<string, unknown>, okMsg?: string) => {
    const res = await fetch("/api/social/teams", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    if (okMsg) push("ok", okMsg);
    setName(""); setTag(""); setEditOpen(false);
    load();
  };
  const taskAct = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/social/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    setTasks(d.tasks ?? []);
    if (payload.action === "add") setTaskTitle("");
  };
  const wallAct = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/social/wall", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    setWall(d.messages ?? []);
    setWallText("");
  };

  const isCaptain = !!my && me === my.team.owner;
  const nameOf = (email: string) => my?.members.find((m) => m.email === email)?.name ?? email.split("@")[0];
  const teamScore = my ? standings.find((s) => s.team.id === my.team.id)?.score ?? 0 : 0;

  return (
    <div>
      <PageHeader
        code="TEAM // ESCOUADE"
        title="Équipe"
        desc="Regroupe-toi pour les CTF : membres, score, tâches, mur d'équipe et classement."
        right={my && myRank ? <Badge variant="signal" dot>rang équipe · #{myRank}</Badge> : undefined}
      />

      {!kv && <div className="card mb-5 border-warning/40 p-4"><p className="font-mono text-xs text-warning">⚠ Base Vercel KV requise pour les équipes.</p></div>}

      {loading ? (
        <p className="font-mono text-body-sm text-muted">Chargement…</p>
      ) : my ? (
        <div className="space-y-6">
          {/* En-tête équipe */}
          <div className="hud-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="clip-chamfer-sm border border-secondary/50 bg-secondary/10 px-2.5 py-1 font-mono text-sm text-secondary">[{my.team.tag}]</span>
                <div>
                  <h2 className="font-display text-h3 text-ink-strong">{my.team.name}</h2>
                  <span className="font-mono text-label text-muted">{my.team.members.length} membre(s){myRank ? ` · rang #${myRank}` : ""}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-display text-h2 tabular-nums text-secondary">{teamScore}</div>
                  <span className="label !text-muted">score équipe</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {isCaptain && <Button variant="ghost" size="sm" onClick={() => setEditOpen((o) => !o)}>{editOpen ? "Fermer" : "Gérer"}</Button>}
                  <Button variant="ghost" size="sm" onClick={() => act({ action: "leave" }, "Équipe quittée.")}>Quitter</Button>
                </div>
              </div>
            </div>
            {my.team.desc && <p className="mt-3 text-body-sm text-ink">{my.team.desc}</p>}

            {isCaptain && editOpen && (
              <div className="mt-4 border-t border-line-subtle pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block"><span className="label !text-muted mb-1.5 block">Nom</span><input className="field" value={eName} onChange={(e) => setEName(e.target.value)} maxLength={40} /></label>
                  <label className="block"><span className="label !text-muted mb-1.5 block">Devise / description</span><input className="field" value={eDesc} onChange={(e) => setEDesc(e.target.value)} maxLength={140} placeholder="On ne recule devant rien." /></label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="signal" size="sm" onClick={() => act({ action: "update", name: eName, desc: eDesc }, "Équipe mise à jour.")}>Enregistrer</Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm("Dissoudre l'équipe ? Irréversible.")) act({ action: "delete" }, "Équipe dissoute."); }}>Dissoudre l&apos;équipe</Button>
                </div>
              </div>
            )}
          </div>

          {/* Membres */}
          <section>
            <h3 className="label mb-3">Membres · unlocks</h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {my.members.map((m) => (
                <div key={m.email} className="card p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <Avatar src={m.avatar} name={m.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-sm text-ink-strong">{m.name}{m.email === my.team.owner && <span className="ml-1.5 text-[9px] text-warning">★ capitaine</span>}</span>
                      <span className="font-mono text-label text-muted">{m.solves.length} unlock(s)</span>
                    </div>
                    <span className="font-display text-h3 tabular-nums text-secondary">{m.score}</span>
                  </div>
                  {m.solves.length > 0 && (
                    <ul className="mb-2 flex flex-wrap gap-1.5">
                      {m.solves.slice(0, 8).map((s) => (<li key={s.at} className="clip-chamfer-sm border border-line-strong px-2 py-0.5 font-mono text-[10px] text-muted" title={`${s.points} pts`}>✓ {s.name}</li>))}
                      {m.solves.length > 8 && <li className="font-mono text-[10px] text-muted">+{m.solves.length - 8}</li>}
                    </ul>
                  )}
                  {isCaptain && m.email !== my.team.owner && (
                    <div className="flex gap-3 border-t border-line-subtle pt-2">
                      <button onClick={() => act({ action: "transfer", target: m.email }, "Capitanat transféré.")} className="font-mono text-[10px] uppercase text-muted hover:text-warning">nommer capitaine</button>
                      <button onClick={() => act({ action: "kick", target: m.email }, "Membre exclu.")} className="font-mono text-[10px] uppercase text-muted hover:text-danger">exclure</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Travaux de groupe */}
          <section>
            <h3 className="label mb-3">Travaux de groupe · {tasks.filter((t) => t.status === "done").length}/{tasks.length}</h3>
            <div className="card p-5">
              <div className="mb-4 flex gap-2">
                <input className="field" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Nouvelle tâche (ex. Résoudre la box Blue)" onKeyDown={(e) => { if (e.key === "Enter" && taskTitle.trim()) taskAct({ action: "add", title: taskTitle }); }} />
                <Button variant="primary" size="sm" onClick={() => taskTitle.trim() && taskAct({ action: "add", title: taskTitle })}>+ Tâche</Button>
              </div>
              {tasks.length === 0 ? (
                <p className="font-mono text-body-sm text-muted">[ aucune tâche — organise l&apos;équipe ]</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center gap-2 border-b border-line-subtle py-2 last:border-0">
                      <button onClick={() => taskAct({ action: "update", id: t.id, status: STATUS_NEXT[t.status] })} className={`clip-chamfer-sm border px-2 py-0.5 font-mono text-[10px] uppercase ${STATUS_STYLE[t.status]}`} title="Changer le statut">{STATUS_LABEL[t.status]}</button>
                      <span className={`min-w-[140px] flex-1 font-mono text-body-sm ${t.status === "done" ? "text-muted line-through" : "text-ink"}`}>{t.title}</span>
                      <select value={t.assignee ?? ""} onChange={(e) => taskAct({ action: "update", id: t.id, assignee: e.target.value })} className="field max-w-[140px] !px-2 !py-1 text-[11px]" title="Assigner">
                        <option value="">— non assigné</option>
                        {my.members.map((m) => (<option key={m.email} value={m.email} className="bg-surface">{m.name}</option>))}
                      </select>
                      <button onClick={() => taskAct({ action: "remove", id: t.id })} className="font-mono text-[10px] uppercase text-muted hover:text-danger">suppr</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Mur d'équipe */}
          <section>
            <h3 className="label mb-3">Mur d&apos;équipe</h3>
            <div className="card p-5">
              <div className="mb-4 flex gap-2">
                <input className="field" value={wallText} onChange={(e) => setWallText(e.target.value)} placeholder="Un message pour l'équipe…" maxLength={300} onKeyDown={(e) => { if (e.key === "Enter" && wallText.trim()) wallAct({ text: wallText }); }} />
                <Button variant="signal" size="sm" onClick={() => wallText.trim() && wallAct({ text: wallText })}>Poster</Button>
              </div>
              {wall.length === 0 ? (
                <p className="font-mono text-body-sm text-muted">[ mur vide — lance la discussion ]</p>
              ) : (
                <ul className="space-y-3">
                  {wall.map((msg) => (
                    <li key={msg.id} className="flex gap-3">
                      <Avatar src={my.members.find((m) => m.email === msg.by)?.avatar} name={nameOf(msg.by)} size={30} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-body-sm text-ink-strong">{nameOf(msg.by)}</span>
                          <span className="font-mono text-[10px] text-muted">{relTime(msg.at)}</span>
                          {(msg.by === me || isCaptain) && <button onClick={() => wallAct({ action: "delete", id: msg.id })} className="ml-auto font-mono text-[9px] uppercase text-muted hover:text-danger">suppr</button>}
                        </div>
                        <p className="whitespace-pre-wrap break-words text-body-sm text-ink">{msg.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Classement des équipes */}
          <TeamStandings standings={standings} myId={my.team.id} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="card h-fit p-5">
              <h2 className="label mb-4">Créer une équipe</h2>
              <label className="mb-3 block"><span className="label !text-muted mb-1.5 block">Nom</span><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Les Fantômes 077" /></label>
              <label className="mb-4 block"><span className="label !text-muted mb-1.5 block">Tag (2-6, A-Z/0-9)</span><input className="field font-mono uppercase" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="GH077" maxLength={6} /></label>
              <Button variant="signal" className="w-full justify-center" onClick={() => act({ action: "create", name, tag }, "Équipe créée.")}>Créer</Button>
            </section>
            <section>
              <h2 className="label mb-4">Rejoindre une équipe · {standings.length}</h2>
              {standings.length === 0 ? (
                <div className="card p-8 text-center font-mono text-sm text-muted">[ aucune équipe — crée la première ]</div>
              ) : (
                <ul className="space-y-2">
                  {standings.map((s) => (
                    <li key={s.team.id} className="card flex items-center gap-3 p-3">
                      <span className="clip-chamfer-sm border border-line-strong px-2 py-0.5 font-mono text-xs text-secondary">[{s.team.tag}]</span>
                      <span className="flex-1 truncate font-mono text-sm text-ink-strong">{s.team.name}</span>
                      <span className="font-mono text-label text-muted">{s.score} pts</span>
                      <Badge variant="neutral">{s.team.members.length}/12</Badge>
                      <Button variant="ghost" size="sm" onClick={() => act({ action: "join", id: s.team.id }, "Équipe rejointe.")}>Rejoindre</Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <TeamStandings standings={standings} myId="" />
        </div>
      )}
    </div>
  );
}

function TeamStandings({ standings, myId }: { standings: Standing[]; myId: string }) {
  if (standings.length === 0) return null;
  return (
    <section>
      <h3 className="label mb-3">Classement des équipes</h3>
      <ol className="space-y-2">
        {standings.map((s, i) => (
          <li key={s.team.id} className={`card flex items-center gap-3 p-3 ${s.team.id === myId ? "border-secondary/60" : ""}`}>
            <span className={`w-7 shrink-0 text-center font-display text-h3 ${i < 3 ? "text-secondary" : "text-muted"}`}>{i + 1}</span>
            <span className="clip-chamfer-sm border border-line-strong px-2 py-0.5 font-mono text-xs text-secondary">[{s.team.tag}]</span>
            <div className="min-w-0 flex-1">
              <span className="block truncate font-mono text-sm text-ink-strong">{s.team.name}</span>
              <span className="font-mono text-label text-muted">{s.team.members.length} membre(s) · {s.unlocks} unlock(s)</span>
            </div>
            <span className="shrink-0 font-display text-h3 tabular-nums text-secondary">{s.score}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
