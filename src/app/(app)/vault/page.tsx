"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { VaultDoor } from "@/components/VaultDoor";
import { encryptJSON, decryptJSON } from "@/lib/crypto";

interface VaultNote {
  id: string;
  title: string;
  secret: string;
}

const STORAGE = "ux077.vault.blob";

export default function VaultPage() {
  const { push } = useToast();
  const [hasVault, setHasVault] = useState(false);
  const [master, setMaster] = useState<string | null>(null);
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const [lockIn, setLockIn] = useState(300);

  // brouillon d'ajout
  const [title, setTitle] = useState("");
  const [secret, setSecret] = useState("");
  const [reveal, setReveal] = useState<string | null>(null);

  useEffect(() => {
    setHasVault(localStorage.getItem(STORAGE) !== null);
  }, []);

  // Auto-lock après 5 min d'inactivité (réinitialisé à chaque action).
  useEffect(() => {
    if (!master || opening) return;
    let remaining = 300;
    setLockIn(300);
    const tick = setInterval(() => {
      remaining -= 1;
      setLockIn(remaining);
      if (remaining <= 0) lock();
    }, 1000);
    const reset = () => {
      remaining = 300;
      setLockIn(300);
    };
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearInterval(tick);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [master, opening]);

  const persist = async (next: VaultNote[], key: string) => {
    const blob = await encryptJSON(next, key);
    localStorage.setItem(STORAGE, blob);
    setHasVault(true);
  };

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 4) {
      push("err", "Mot de passe maître trop court (min. 4).");
      return;
    }
    setBusy(true);
    try {
      const blob = localStorage.getItem(STORAGE);
      if (blob) {
        const data = await decryptJSON<VaultNote[]>(blob, pwd);
        setNotes(data);
        setMaster(pwd);
        push("ok", "Coffre déverrouillé.");
      } else {
        await persist([], pwd);
        setNotes([]);
        setMaster(pwd);
        push("ok", "Coffre initialisé et chiffré.");
      }
      setOpening(true);
      setPwd("");
    } catch {
      push("err", "Déchiffrement impossible — mot de passe incorrect.");
    } finally {
      setBusy(false);
    }
  };

  const lock = () => {
    setMaster(null);
    setNotes([]);
    setReveal(null);
    push("warn", "Coffre verrouillé.");
  };

  const addNote = async () => {
    if (!master || !title.trim() || !secret.trim()) return;
    const next = [...notes, { id: crypto.randomUUID(), title: title.trim(), secret }];
    setNotes(next);
    await persist(next, master);
    setTitle("");
    setSecret("");
    push("ok", "Entrée chiffrée ajoutée.");
  };

  const removeNote = async (id: string) => {
    if (!master) return;
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    await persist(next, master);
    if (reveal === id) setReveal(null);
    push("warn", "Entrée supprimée.");
  };

  /* ──────────────── Écran verrouillé ──────────────── */
  if (!master) {
    return (
      <div className="max-w-md mx-auto">
        <PageHeader
          code="VLT // ZONE CLASSIFIÉE"
          title="Vault"
          desc="Coffre chiffré côté client. Le mot de passe maître n'est jamais stocké."
          state="danger"
        />

        <div className="card p-4 mb-5 border-danger/40">
          <p className="font-mono text-xs text-danger leading-relaxed">
            ⚠ // ZONE CLASSIFIÉE — chiffrement AES-256-GCM, clé dérivée par PBKDF2.
            Si tu oublies le mot de passe maître, les données sont
            irrécupérables.
          </p>
        </div>

        <form onSubmit={unlock} className="card p-6 space-y-4">
          <label className="block">
            <span className="label !text-muted block mb-1.5">Mot de passe maître</span>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="field"
              placeholder="••••••••"
              autoFocus
              autoComplete="off"
            />
          </label>
          <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
            {busy ? "Déchiffrement…" : hasVault ? "Déverrouiller" : "Créer le coffre"}
          </button>
          <p className="text-[10px] font-mono text-muted text-center">
            {hasVault
              ? "Coffre détecté sur cet appareil."
              : "Aucun coffre — le mot de passe saisi en deviendra la clé."}
          </p>
        </form>
      </div>
    );
  }

  /* ──────────────── Animation d'ouverture ──────────────── */
  if (opening) return <VaultDoor onDone={() => setOpening(false)} />;

  /* ──────────────── Écran déverrouillé ──────────────── */
  const mm = Math.floor(lockIn / 60);
  const ss = String(lockIn % 60).padStart(2, "0");
  const urgent = lockIn <= 60;

  return (
    <div>
      {/* teinte rouge « zone classifiée » */}
      <div aria-hidden className="fixed inset-0 z-[2] pointer-events-none bg-danger/[0.05]" />
      {/* barre d'auto-lock */}
      <div className="fixed top-14 inset-x-0 z-[40] h-0.5 bg-line">
        <div
          className={`h-full transition-[width] duration-1000 ${
            urgent ? "bg-danger animate-pulse" : "bg-gradient-to-r from-primary to-secondary"
          }`}
          style={{ width: `${(lockIn / 300) * 100}%` }}
        />
      </div>

      <PageHeader
        code="VLT // ZONE CLASSIFIÉE"
        title="Vault"
        desc="Notes sensibles déchiffrées en mémoire. Verrouille en quittant."
        state="danger"
        right={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="card px-2 py-1 font-mono text-[10px] text-secondary flex items-center gap-1.5">
              <span className="inline-block animate-[spin_8s_linear_infinite]">🔒</span> AES-256 ACTIVE
            </span>
            <span
              className={`card px-2 py-1 font-mono text-[10px] ${urgent ? "text-danger animate-pulse" : "text-muted"}`}
            >
              auto-lock {mm}:{ss}
            </span>
            <button onClick={lock} className="btn btn-ghost !py-2 text-xs">
              🔒 Verrouiller
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Entrées */}
        <section>
          <h2 className="label mb-4">Entrées · {notes.length}</h2>
          {notes.length === 0 ? (
            <div className="card p-8 text-center font-mono text-sm text-muted">
              [ coffre vide ] — ajoute ta première entrée chiffrée.
            </div>
          ) : (
            <ul className="space-y-2">
              {notes.map((n, i) => (
                <li
                  key={n.id}
                  className="card p-4 animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-sm text-ink truncate">{n.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setReveal(reveal === n.id ? null : n.id)}
                        className="text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-secondary"
                      >
                        {reveal === n.id ? "masquer" : "révéler"}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(n.secret).then(() => push("ok", "Copié."))}
                        className="text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-primary"
                      >
                        copier
                      </button>
                      <button
                        onClick={() => removeNote(n.id)}
                        className="text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-danger"
                      >
                        suppr
                      </button>
                    </div>
                  </div>
                  <pre className="font-mono text-xs text-ink/90 whitespace-pre-wrap break-all bg-base/60 border border-line p-2">
                    {reveal === n.id ? n.secret : "•".repeat(Math.min(n.secret.length, 32))}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Ajout */}
        <aside>
          <section className="card p-5 sticky top-20">
            <h2 className="label mb-4">Nouvelle entrée</h2>
            <label className="block mb-3">
              <span className="label !text-muted block mb-1.5">Titre</span>
              <input
                className="field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex. VPN lab — creds"
              />
            </label>
            <label className="block mb-4">
              <span className="label !text-muted block mb-1.5">Contenu secret</span>
              <textarea
                className="field min-h-[120px] resize-y"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="credentials, clé, config…"
                spellCheck={false}
              />
            </label>
            <button
              onClick={addNote}
              disabled={!title.trim() || !secret.trim()}
              className="btn btn-primary w-full justify-center"
            >
              Chiffrer & ajouter
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
