"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Badge, Button } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { fileToAvatar } from "@/lib/avatar";

interface Solve { name: string; points: number; cat?: string; at: number }
interface Account {
  email: string;
  name: string;
  role: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  handle?: string;
  country?: string;
  score?: number;
  solves?: Solve[];
  teamId?: string;
}
interface Profile { email: string; name: string; avatar?: string; handle?: string }
interface Friends { friends: Profile[]; incoming: Profile[]; outgoing: Profile[] }

export default function ProfilePage() {
  const { push } = useToast();
  const [session, setSession] = useState<{ email: string; name: string; role: string } | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [kv, setKv] = useState(true);
  const [draft, setDraft] = useState({ displayName: "", handle: "", country: "", bio: "", avatar: "" });
  const [friends, setFriends] = useState<Friends>({ friends: [], incoming: [], outgoing: [] });
  const [solve, setSolve] = useState({ name: "", points: "100", cat: "" });
  const [addEmail, setAddEmail] = useState("");
  const [busy, setBusy] = useState(false);
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
  useEffect(() => {
    loadProfile();
    loadFriends();
  }, [loadProfile, loadFriends]);

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
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return push("err", d.error ?? "Échec de l'enregistrement.");
      applyAccount(d.account);
      push("ok", "Profil enregistré.");
    } finally {
      setBusy(false);
    }
  };

  const addSolve = async () => {
    if (!solve.name.trim()) return;
    const res = await fetch("/api/social/solves", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: solve.name, points: Number(solve.points) || 0, cat: solve.cat }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    setAccount(d.account);
    setSolve({ name: "", points: "100", cat: "" });
    push("ok", "Unlock ajouté.");
  };
  const removeSolve = async (at: number) => {
    const res = await fetch(`/api/social/solves?at=${at}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (d.account) setAccount(d.account);
  };

  const friendAction = async (action: string, email: string) => {
    const res = await fetch("/api/social/friends", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, email }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return push("err", d.error ?? "Échec.");
    if (action === "request") {
      push("ok", "Demande envoyée.");
      setAddEmail("");
    }
    loadFriends();
  };

  const score = account?.score ?? 0;
  const solves = account?.solves ?? [];

  return (
    <div>
      <PageHeader
        code="PRF // OPÉRATEUR"
        title="Mon profil"
        desc="Gère ton identité, ta photo, tes unlocks et tes relations."
        right={<Badge variant="signal" dot>{score} pts</Badge>}
      />

      {!kv && (
        <div className="card mb-5 border-warning/40 p-4">
          <p className="font-mono text-xs text-warning">
            ⚠ Base Vercel KV non connectée — l&apos;édition du profil / unlocks / amis nécessite un store KV.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* ── Édition profil ── */}
        <section className="card h-fit p-5">
          <div className="mb-4 flex items-center gap-4">
            <Avatar src={draft.avatar} name={draft.displayName || session?.name || "?"} size={72} />
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                Changer la photo
              </Button>
              {draft.avatar && (
                <button
                  onClick={() => setDraft((d) => ({ ...d, avatar: "" }))}
                  className="ml-2 font-mono text-[10px] uppercase text-muted hover:text-danger"
                >
                  retirer
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Field label="Nom affiché" value={draft.displayName} onChange={(v) => setDraft((d) => ({ ...d, displayName: v }))} placeholder={session?.name} />
            <Field label="Pseudo (@handle)" value={draft.handle} onChange={(v) => setDraft((d) => ({ ...d, handle: v }))} placeholder="ghost077" mono />
            <Field label="Pays / ville" value={draft.country} onChange={(v) => setDraft((d) => ({ ...d, country: v }))} placeholder="Villejuif, FR" />
            <label className="block">
              <span className="label !text-muted mb-1.5 block">Bio</span>
              <textarea className="field min-h-[80px] resize-y" value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} maxLength={280} placeholder="Red teamer en devenir…" />
            </label>
          </div>
          <Button variant="signal" className="mt-4 w-full justify-center" onClick={save} disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <p className="mt-2 font-mono text-[10px] text-muted">
            {session?.email} · rôle {session?.role}
          </p>
        </section>

        <div className="space-y-6">
          {/* ── Unlocks / solves ── */}
          <section className="card p-5">
            <h2 className="label mb-4">Mes unlocks · {solves.length} · {score} pts</h2>
            <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_90px_110px_auto]">
              <input className="field" value={solve.name} onChange={(e) => setSolve((s) => ({ ...s, name: e.target.value }))} placeholder="ex. Blue (HTB)" />
              <input className="field" type="number" value={solve.points} onChange={(e) => setSolve((s) => ({ ...s, points: e.target.value }))} placeholder="pts" />
              <input className="field" value={solve.cat} onChange={(e) => setSolve((s) => ({ ...s, cat: e.target.value }))} placeholder="catégorie" />
              <Button variant="primary" size="sm" onClick={addSolve}>+ Unlock</Button>
            </div>
            {solves.length === 0 ? (
              <p className="font-mono text-body-sm text-muted">[ aucun unlock — ajoute tes machines/challenges résolus ]</p>
            ) : (
              <ul className="space-y-1.5">
                {solves.map((s) => (
                  <li key={s.at} className="flex items-center gap-3 border-b border-line-subtle py-1.5 last:border-0">
                    <span className="text-success">✓</span>
                    <span className="flex-1 truncate font-mono text-body-sm text-ink">{s.name}</span>
                    {s.cat && <span className="text-[10px] font-mono uppercase text-muted">{s.cat}</span>}
                    <span className="font-mono text-body-sm tabular-nums text-secondary">{s.points}</span>
                    <button onClick={() => removeSolve(s.at)} className="font-mono text-[10px] uppercase text-muted hover:text-danger">
                      suppr
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Amis ── */}
          <section className="card p-5">
            <h2 className="label mb-4">Amis · {friends.friends.length}</h2>
            <div className="mb-4 flex gap-2">
              <input className="field" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email de l'opérateur à ajouter" />
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
              <p className="font-mono text-body-sm text-muted">[ pas encore d&apos;amis — ajoute-en par email ]</p>
            ) : (
              <ul className="space-y-1.5">
                {friends.friends.map((f) => (
                  <li key={f.email} className="flex items-center gap-2">
                    <Avatar src={f.avatar} name={f.name} size={28} />
                    <span className="flex-1 truncate font-mono text-body-sm text-ink">
                      {f.name}
                      {f.handle && <span className="text-muted"> @{f.handle}</span>}
                    </span>
                    <button onClick={() => friendAction("remove", f.email)} className="font-mono text-[10px] uppercase text-muted hover:text-danger">retirer</button>
                  </li>
                ))}
              </ul>
            )}
            {friends.outgoing.length > 0 && (
              <p className="mt-3 font-mono text-label text-muted">En attente : {friends.outgoing.map((f) => f.name).join(", ")}</p>
            )}
          </section>
        </div>
      </div>
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
