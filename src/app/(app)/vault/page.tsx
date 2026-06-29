"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { VaultDoor } from "@/components/VaultDoor";
import {
  createVault,
  unlockVault,
  recoverVault,
  resaveVault,
  rewrapPassword,
  isVaultV2,
  decryptJSON,
} from "@/lib/crypto";

interface VaultNote {
  id: string;
  title: string;
  secret: string;
}

const STORAGE = "ux077.vault.blob";
const MIN_PWD = 8;

type LockedScreen = "unlock" | "setup" | "reset";

interface PendingRecovery {
  code: string;
  emailed: "sent" | "not_configured" | "failed";
  to?: string;
  migrated?: boolean;
}

/** Envoie le code de récupération par email (à l'adresse de la session). */
async function emailRecoveryCode(
  code: string,
  context: "setup" | "reset",
): Promise<{ status: PendingRecovery["emailed"]; to?: string }> {
  try {
    const res = await fetch("/api/vault/recovery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, context }),
    });
    const d = (await res.json()) as { sent?: boolean; to?: string };
    if (d.sent) return { status: "sent", to: d.to };
    return { status: "not_configured" };
  } catch {
    return { status: "failed" };
  }
}

/** Score grossier de robustesse (0-4) pour le retour visuel. */
function pwdScore(p: string): number {
  let s = 0;
  if (p.length >= MIN_PWD) s++;
  if (p.length >= 14) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

export default function VaultPage() {
  const { push } = useToast();
  const [hasVault, setHasVault] = useState(false);
  const [blob, setBlob] = useState<string | null>(null);
  const [dek, setDek] = useState<string | null>(null); // clé de données en mémoire
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [screen, setScreen] = useState<LockedScreen>("unlock");
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const [lockIn, setLockIn] = useState(300);
  const [pending, setPending] = useState<PendingRecovery | null>(null);

  // champs de formulaire (verrouillé)
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");

  // brouillon d'ajout
  const [title, setTitle] = useState("");
  const [secret, setSecret] = useState("");
  const [reveal, setReveal] = useState<string | null>(null);

  useEffect(() => {
    const b = localStorage.getItem(STORAGE);
    setBlob(b);
    setHasVault(b !== null);
    setScreen(b !== null ? "unlock" : "setup");
  }, []);

  // Auto-lock après 5 min d'inactivité (réinitialisé à chaque action).
  useEffect(() => {
    if (!dek || opening) return;
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
  }, [dek, opening]);

  const resetForm = () => {
    setPwd("");
    setPwd2("");
    setRecoveryInput("");
  };

  /* ──────────────── Setup : choix du mot de passe maître ──────────────── */
  const submitSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < MIN_PWD) {
      push("err", `Mot de passe maître trop court (min. ${MIN_PWD}).`);
      return;
    }
    if (pwd !== pwd2) {
      push("err", "Les deux mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    try {
      const { blob: newBlob, recoveryCode, dek: newDek } = await createVault<VaultNote[]>([], pwd);
      localStorage.setItem(STORAGE, newBlob);
      setBlob(newBlob);
      setHasVault(true);
      setDek(newDek);
      setNotes([]);
      const mail = await emailRecoveryCode(recoveryCode, "setup");
      setPending({ code: recoveryCode, emailed: mail.status, to: mail.to });
      resetForm();
    } catch {
      push("err", "Impossible d'initialiser le coffre.");
    } finally {
      setBusy(false);
    }
  };

  /* ──────────────── Déverrouillage (mot de passe par défaut) ──────────────── */
  const submitUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 1) return;
    setBusy(true);
    try {
      const b = localStorage.getItem(STORAGE);
      if (!b) {
        setScreen("setup");
        return;
      }
      if (isVaultV2(b)) {
        const { data, dek: newDek } = await unlockVault<VaultNote[]>(b, pwd);
        setBlob(b);
        setDek(newDek);
        setNotes(data);
        resetForm();
        setOpening(true);
        push("ok", "Coffre déverrouillé.");
      } else {
        // Coffre v1 hérité → on déchiffre puis on migre vers l'enveloppe v2.
        const data = await decryptJSON<VaultNote[]>(b, pwd);
        const { blob: newBlob, recoveryCode, dek: newDek } = await createVault<VaultNote[]>(
          data,
          pwd,
        );
        localStorage.setItem(STORAGE, newBlob);
        setBlob(newBlob);
        setDek(newDek);
        setNotes(data);
        resetForm();
        const mail = await emailRecoveryCode(recoveryCode, "setup");
        setPending({ code: recoveryCode, emailed: mail.status, to: mail.to, migrated: true });
      }
    } catch {
      push("err", "Déchiffrement impossible — mot de passe incorrect.");
    } finally {
      setBusy(false);
    }
  };

  /* ──────────────── Reset via code de récupération ──────────────── */
  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blob) return;
    if (pwd.length < MIN_PWD) {
      push("err", `Nouveau mot de passe trop court (min. ${MIN_PWD}).`);
      return;
    }
    if (pwd !== pwd2) {
      push("err", "Les deux mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    try {
      const { data, dek: newDek } = await recoverVault<VaultNote[]>(blob, recoveryInput);
      const newBlob = await rewrapPassword(blob, newDek, pwd);
      localStorage.setItem(STORAGE, newBlob);
      setBlob(newBlob);
      setDek(newDek);
      setNotes(data);
      resetForm();
      setScreen("unlock");
      setOpening(true);
      push("ok", "Mot de passe maître réinitialisé — coffre récupéré.");
    } catch {
      push("err", "Code de récupération invalide.");
    } finally {
      setBusy(false);
    }
  };

  const lock = () => {
    setDek(null);
    setNotes([]);
    setReveal(null);
    setScreen("unlock");
    push("warn", "Coffre verrouillé.");
  };

  const persist = async (next: VaultNote[]) => {
    if (!blob || !dek) return;
    const newBlob = await resaveVault<VaultNote[]>(blob, next, dek);
    localStorage.setItem(STORAGE, newBlob);
    setBlob(newBlob);
  };

  const addNote = async () => {
    if (!dek || !title.trim() || !secret.trim()) return;
    const next = [...notes, { id: crypto.randomUUID(), title: title.trim(), secret }];
    setNotes(next);
    await persist(next);
    setTitle("");
    setSecret("");
    push("ok", "Entrée chiffrée ajoutée.");
  };

  const removeNote = async (id: string) => {
    if (!dek) return;
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    await persist(next);
    if (reveal === id) setReveal(null);
    push("warn", "Entrée supprimée.");
  };

  /* ──────────────── Panneau « code de récupération » (après setup) ─────── */
  if (pending) {
    const downloadCode = () => {
      const file = new Blob(
        [
          "UnknownX-077 — Code de récupération du coffre (Vault)\n",
          "Conserve ce code en lieu sûr. Seul moyen de réinitialiser ton\n",
          "mot de passe maître sans perdre tes données.\n\n",
          `CODE : ${pending.code}\n`,
        ],
        { type: "text/plain" },
      );
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = "unknownx-vault-recovery.txt";
      a.click();
      URL.revokeObjectURL(url);
    };

    const proceed = () => {
      setPending(null);
      setOpening(true);
    };

    return (
      <div className="max-w-md mx-auto">
        <PageHeader
          code="VLT // CLÉ DE SECOURS"
          title="Code de récupération"
          desc={
            pending.migrated
              ? "Coffre migré vers le chiffrement par enveloppe. Voici ta clé de secours."
              : "Coffre chiffré et initialisé. Note bien ce code."
          }
          state="danger"
        />

        <div className="card p-4 mb-5 border-danger/40">
          <p className="font-mono text-xs text-danger leading-relaxed">
            ⚠ // C&apos;est le SEUL moyen de réinitialiser ton mot de passe maître
            sans perdre tes données. Il ne sera plus jamais affiché. Personne ne
            peut le régénérer.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="font-mono text-xl tracking-[3px] text-secondary text-center bg-base/60 border border-line p-4 break-all select-all">
            {pending.code}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(pending.code).then(() => push("ok", "Code copié."))}
              className="btn btn-ghost flex-1 justify-center text-xs"
            >
              Copier
            </button>
            <button onClick={downloadCode} className="btn btn-ghost flex-1 justify-center text-xs">
              Télécharger .txt
            </button>
          </div>

          <p className="text-[10px] font-mono text-center leading-relaxed">
            {pending.emailed === "sent" ? (
              <span className="text-success">✓ Envoyé par email à {pending.to}.</span>
            ) : pending.emailed === "not_configured" ? (
              <span className="text-warn">
                Email non configuré — sauvegarde ce code manuellement.
              </span>
            ) : (
              <span className="text-danger">
                Échec de l&apos;envoi email — sauvegarde ce code manuellement.
              </span>
            )}
          </p>

          <button onClick={proceed} className="btn btn-primary w-full justify-center">
            J&apos;ai sauvegardé mon code — ouvrir le coffre
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────── Animation d'ouverture ──────────────── */
  if (opening) return <VaultDoor onDone={() => setOpening(false)} />;

  /* ──────────────── Écrans verrouillés ──────────────── */
  if (!dek) {
    const score = pwdScore(pwd);
    const scoreLabel = ["très faible", "faible", "correct", "solide", "excellent"][score];
    const scoreColor = ["bg-danger", "bg-danger", "bg-warn", "bg-secondary", "bg-success"][score];

    return (
      <div className="max-w-md mx-auto">
        <PageHeader
          code="VLT // ZONE CLASSIFIÉE"
          title="Vault"
          desc="Coffre chiffré côté client (AES-256-GCM). Le mot de passe maître n'est jamais stocké."
          state="danger"
        />

        <div className="card p-4 mb-5 border-danger/40">
          <p className="font-mono text-xs text-danger leading-relaxed">
            ⚠ // ZONE CLASSIFIÉE — chiffrement par enveloppe : une clé aléatoire
            protège tes données, emballée par ton mot de passe ET un code de
            récupération. Oubli du mot de passe → reset possible via le code.
          </p>
        </div>

        {/* ─── Setup ─── */}
        {screen === "setup" && (
          <form onSubmit={submitSetup} className="card p-6 space-y-4">
            <h2 className="label text-secondary">{"// CRÉATION DU COFFRE"}</h2>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Choisis un mot de passe maître</span>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="field"
                placeholder="••••••••"
                autoFocus
                autoComplete="new-password"
              />
            </label>
            {pwd.length > 0 && (
              <div>
                <div className="h-1 w-full bg-line rounded overflow-hidden">
                  <div
                    className={`h-full transition-all ${scoreColor}`}
                    style={{ width: `${(score / 4) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-muted mt-1">robustesse : {scoreLabel}</p>
              </div>
            )}
            <label className="block">
              <span className="label !text-muted block mb-1.5">Confirme</span>
              <input
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                className="field"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
              {busy ? "Chiffrement…" : "Créer le coffre"}
            </button>
            {hasVault && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setScreen("unlock");
                }}
                className="text-[10px] font-mono text-muted hover:text-secondary w-full text-center"
              >
                ← un coffre existe déjà — déverrouiller
              </button>
            )}
          </form>
        )}

        {/* ─── Unlock (défaut) ─── */}
        {screen === "unlock" && (
          <form onSubmit={submitUnlock} className="card p-6 space-y-4">
            <h2 className="label text-secondary">{"// DÉVERROUILLAGE"}</h2>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Mot de passe maître</span>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="field"
                placeholder="••••••••"
                autoFocus
                autoComplete="current-password"
              />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
              {busy ? "Déchiffrement…" : "Déverrouiller"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setScreen("reset");
              }}
              className="text-[10px] font-mono text-muted hover:text-secondary w-full text-center"
            >
              Mot de passe oublié ? Réinitialiser avec le code de récupération
            </button>
          </form>
        )}

        {/* ─── Reset ─── */}
        {screen === "reset" && (
          <form onSubmit={submitReset} className="card p-6 space-y-4">
            <h2 className="label text-secondary">{"// RÉINITIALISATION"}</h2>
            <p className="text-[11px] font-mono text-muted leading-relaxed">
              Saisis le code de récupération (envoyé par email à la création) puis
              choisis un nouveau mot de passe maître. Tes données sont conservées.
            </p>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Code de récupération</span>
              <input
                type="text"
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value)}
                className="field font-mono tracking-[2px]"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Nouveau mot de passe maître</span>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="field"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Confirme</span>
              <input
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                className="field"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
              {busy ? "Récupération…" : "Réinitialiser & déverrouiller"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setScreen("unlock");
              }}
              className="text-[10px] font-mono text-muted hover:text-secondary w-full text-center"
            >
              ← retour au déverrouillage
            </button>
          </form>
        )}
      </div>
    );
  }

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
