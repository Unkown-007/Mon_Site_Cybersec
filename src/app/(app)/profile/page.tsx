"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Badge, Button } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { fileToAvatar } from "@/lib/avatar";
import { personalAchievements } from "@/lib/personal-stats";
import type { Rarity } from "@/lib/stats";

interface Solve { name: string; points: number; cat?: string; at: number }
interface Account {
  email: string; name: string; role: string;
  displayName?: string; avatar?: string; bio?: string; handle?: string; country?: string;
  score?: number; solves?: Solve[]; teamId?: string; logins?: number; firstSeen?: number;
}
interface Profile { email: string; name: string; avatar?: string; handle?: string }
interface Friends { friends: Profile[]; incoming: Profile[]; outgoing: Profile[] }

const RARITY: Record<Rarity, { text: string; border: string; dot: string }> = {
  commun: { text: "text-muted", border: "border-line-strong", dot: "bg-muted" },
  rare: { text: "text-secondary", border: "border-secondary/50", dot: "bg-secondary" },
  épique: { text: "text-primary", border: "border-primary/50", dot: "bg-primary" },
  légendaire: { text: "text-warning", border: "border-warning/60", dot: "bg-warning" },
};

export default function ProfilePage() {
  const { push } = useToast();
  const [session, setSession] = useState<{ email: string; name: string; role: string } | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [kv, setKv] = useState(true);
  const [draft, setDraft] = useState({ displayName: "", handle: "", country: "", bio: "", avatar: "" });
  const [friends, setFriends] = useState<Friends>({ friends: [], incoming: [], outgoing: [] });
  const [rank, setRank] = useState<{ pos: number; total: number } | null>(null);
  const [solve, setSolve] = useState({ name: "", points: "100", cat: "" });
  const [addEmail, setAddEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyAccount = (a: Account | null, s?: { email: string; name: string; role: string }) => {
    setAccount(a);
    setDraft({
      displayName: a?.displayName ?? s?.name ?? "",
      handle: a?.handle ?? "",
      country: a?.country ?? "",
      bio: a?.bio ?? "",
      avatar: a?.avatar ?? "",
    });
  };

  const loadProfile = useCallback(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { account?: Account | null; session?: { email: string; name: string; role: string }; kvReady?: boolean }) => {
        setSession(d.session ?? null);
        setKv(d.kvReady ?? false);
        applyAccount(d.account ?? null, d.session);
      })
      .catch(() => {});
  }, []);
  const loadFriends = useCallback(() => {
    fetch("/api/social/friends", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Friends) => setFriends({ friends: d.friends ?? [], incoming: d.incoming ?? [], outgoing: d.outgoing ?? [] }))
      .catch(() => {});
  }, []);
  const loadRank = useCallback(() => {
    fetch("/api/social/leaderboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { rows?: { email: string }[]; me?: string }) => {
        const rows = d.rows ?? [];
        const i = rows.findIndex((r) => r.email === d.me);
        if (i >= 0) setRank({ pos: i + 1, total: rows.length });
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadProfile();
    loadFriends();
    loadRank();
  }, [loadProfile, loadFriends, loadRank]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const url = await fileToAvatar(f);
      setDraft((d) => ({ ...d, avatar: url }));
      push("ok", "Photo prête — clique Enregistrer.");
    } catch {
      push("err", "Image illisible.");
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return push("err", d.error ?? "Échec de l'enregistrement.");
      applyAccount(d.account);
      setEditOpen(false);
      push("ok", "Profil enregistré.");
    } finally {
      setBusy(false);
    }
  };

  const addSolve = async () => {
    if (!solve.name.trim()) return;
    const res = await fetch("/api/social/solves", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: solve.name, points: Number(solve.points) || 0, cat: solve.cat }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    setAccount(d.account);
    setSolve({ name: "", points: "100", cat: "" });
    loadRank();
    push("ok", "Unlock ajouté.");
  };
  const removeSolve = async (at: number) => {
    const res = await fetch(`/api/social/solves?at=${at}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (d.account) setAccount(d.account);
    loadRank();
  };

  const friendAction = async (action: string, email: string) => {
    const res = await fetch("/api/social/friends", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, email }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    if (action === "request") { push("ok", "Demande envoyée."); setAddEmail(""); }
    loadFriends();
  };

  const score = account?.score ?? 0;
  const solves = account?.solves ?? [];
  const displayName = account?.displayName || session?.name || "Opérateur";

  const achievements = personalAchievements({
    solves, score, avatar: account?.avatar, bio: account?.bio, handle: account?.handle,
    country: account?.country, teamId: account?.teamId, logins: account?.logins,
    firstSeen: account?.firstSeen, friends: friends.friends.length,
  });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div>
      <PageHeader code="PRF // OPÉRATEUR" title="Mon profil" desc="Ton identité, ta photo, tes unlocks, tes relations et tes succès." />

      {!kv && (
        <div className="card mb-5 border-warning/40 p-4">
          <p className="font-mono text-xs text-warning">⚠ Base Vercel KV non connectée — profil / unlocks / amis ne persistent pas sans store KV.</p>
        </div>
      )}

      {/* ── Bannière profil ── */}
      <div className="hud-panel mb-6 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar src={account?.avatar} name={displayName} size={84} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-h2 text-ink-strong">{displayName}</h2>
              {account?.role === "admin" && <Badge variant="accent">admin</Badge>}
            </div>
            <p className="mt-0.5 font-mono text-label text-muted">
              {account?.handle ? `@${account.handle}` : session?.email}
              {account?.country ? ` · ${account.country}` : ""}
            </p>
            {account?.bio && <p className="mt-2 max-w-xl text-body-sm text-ink">{account.bio}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditOpen((o) => !o)}>
            {editOpen ? "Fermer" : "Éditer le profil"}
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MiniStat label="Score" value={score} accent="text-secondary" />
          <MiniStat label="Unlocks" value={solves.length} />
          <MiniStat label="Amis" value={friends.friends.length} />
          <MiniStat label="Succès" value={unlockedCount} sub={`/ ${achievements.length}`} />
          <MiniStat label="Rang" value={rank ? rank.pos : 0} sub={rank ? `/ ${rank.total}` : ""} prefix="#" accent="text-primary" />
          <MiniStat label="Équipe" text={account?.teamId ? "oui" : "—"} />
        </div>
      </div>

      {/* ── Édition (repliable) ── */}
      {editOpen && (
        <section className="card mb-6 p-5">
          <div className="mb-4 flex items-center gap-4">
            <Avatar src={draft.avatar} name={draft.displayName || displayName} size={64} />
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>Changer la photo</Button>
              {draft.avatar && <button onClick={() => setDraft((d) => ({ ...d, avatar: "" }))} className="ml-2 font-mono text-[10px] uppercase text-muted hover:text-danger">retirer</button>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom affiché" value={draft.displayName} onChange={(v) => setDraft((d) => ({ ...d, displayName: v }))} placeholder={session?.name} />
            <Field label="Pseudo (@handle)" value={draft.handle} onChange={(v) => setDraft((d) => ({ ...d, handle: v }))} placeholder="ghost077" mono />
            <Field label="Pays / ville" value={draft.country} onChange={(v) => setDraft((d) => ({ ...d, country: v }))} placeholder="Villejuif, FR" />
            <label className="block sm:col-span-2">
              <span className="label !text-muted mb-1.5 block">Bio</span>
              <textarea className="field min-h-[70px] resize-y" value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} maxLength={280} placeholder="Red teamer en devenir…" />
            </label>
          </div>
          <Button variant="signal" className="mt-4" onClick={save} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</Button>
        </section>
      )}

      {/* ── Succès personnels ── */}
      <section className="mb-6">
        <h2 className="label mb-4">Succès · {unlockedCount}/{achievements.length}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((a) => {
            const st = RARITY[a.rarity];
            return (
              <div key={a.id} className={`card flex items-start gap-3 p-3.5 ${a.unlocked ? st.border : "opacity-45"}`}>
                <span className={`text-xl ${a.unlocked ? st.text : "text-muted"}`}>{a.glyph}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm text-ink-strong">{a.name}</span>
                    {a.unlocked && <span className="text-[9px] text-success">✓</span>}
                  </div>
                  <p className="mt-0.5 text-label text-muted">{a.desc}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-[8px] font-mono uppercase tracking-[1px] ${st.text}`}>{a.rarity}</span>
                    <span className="font-mono text-[9px] text-muted">{a.progress}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Unlocks ── */}
        <section className="card p-5">
          <h2 className="label mb-4">Mes unlocks · {solves.length} · {score} pts</h2>
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_80px_100px_auto]">
            <input className="field" value={solve.name} onChange={(e) => setSolve((s) => ({ ...s, name: e.target.value }))} placeholder="ex. Blue (HTB)" />
            <input className="field" type="number" value={solve.points} onChange={(e) => setSolve((s) => ({ ...s, points: e.target.value }))} placeholder="pts" />
            <input className="field" value={solve.cat} onChange={(e) => setSolve((s) => ({ ...s, cat: e.target.value }))} placeholder="catégorie" />
            <Button variant="primary" size="sm" onClick={addSolve}>+</Button>
          </div>
          {solves.length === 0 ? (
            <p className="font-mono text-body-sm text-muted">[ aucun unlock — ajoute tes machines/challenges ]</p>
          ) : (
            <ul className="space-y-1.5">
              {solves.map((s) => (
                <li key={s.at} className="flex items-center gap-3 border-b border-line-subtle py-1.5 last:border-0">
                  <span className="text-success">✓</span>
                  <span className="flex-1 truncate font-mono text-body-sm text-ink">{s.name}</span>
                  {s.cat && <span className="text-[10px] font-mono uppercase text-muted">{s.cat}</span>}
                  <span className="font-mono text-body-sm tabular-nums text-secondary">{s.points}</span>
                  <button onClick={() => removeSolve(s.at)} className="font-mono text-[10px] uppercase text-muted hover:text-danger">suppr</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Amis ── */}
        <section className="card p-5">
          <h2 className="label mb-4">Amis · {friends.friends.length}</h2>
          <div className="mb-4 flex gap-2">
            <input className="field" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email de l'opérateur" />
            <Button variant="ghost" size="sm" onClick={() => friendAction("request", addEmail)}>Ajouter</Button>
          </div>
          {friends.incoming.length > 0 && (
            <div className="mb-3">
              <span className="label !text-muted">Demandes reçues</span>
              <ul className="mt-2 space-y-1.5">
                {friends.incoming.map((f) => (
                  <li key={f.email} className="flex items-center gap-2">
                    <Avatar src={f.avatar} name={f.name} size={28} />
                    <span className="flex-1 truncate font-mono text-body-sm text-ink">{f.name}</span>
                    <button onClick={() => friendAction("accept", f.email)} className="font-mono text-[10px] uppercase text-success hover:underline">accepter</button>
                    <button onClick={() => friendAction("decline", f.email)} className="font-mono text-[10px] uppercase text-muted hover:text-danger">refuser</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {friends.friends.length === 0 && friends.incoming.length === 0 ? (
            <p className="font-mono text-body-sm text-muted">[ pas encore d&apos;amis ]</p>
          ) : (
            <ul className="space-y-1.5">
              {friends.friends.map((f) => (
                <li key={f.email} className="flex items-center gap-2">
                  <Avatar src={f.avatar} name={f.name} size={28} />
                  <span className="flex-1 truncate font-mono text-body-sm text-ink">{f.name}{f.handle && <span className="text-muted"> @{f.handle}</span>}</span>
                  <button onClick={() => friendAction("remove", f.email)} className="font-mono text-[10px] uppercase text-muted hover:text-danger">retirer</button>
                </li>
              ))}
            </ul>
          )}
          {friends.outgoing.length > 0 && <p className="mt-3 font-mono text-label text-muted">En attente : {friends.outgoing.map((f) => f.name).join(", ")}</p>}
        </section>
      </div>
    </div>
  );
}

function MiniStat({ label, value, text, sub, prefix, accent = "text-ink-strong" }: { label: string; value?: number; text?: string; sub?: string; prefix?: string; accent?: string }) {
  return (
    <div className="clip-chamfer-sm border border-line-strong bg-base/40 px-3 py-2.5 text-center">
      <div className={`font-display text-h3 tabular-nums ${accent}`}>
        {prefix}
        {text ?? value}
        {sub && <span className="text-body-sm text-muted"> {sub}</span>}
      </div>
      <div className="label mt-0.5 justify-center">{label}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="label !text-muted mb-1.5 block">{label}</span>
      <input className={`field ${mono ? "font-mono" : ""}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
