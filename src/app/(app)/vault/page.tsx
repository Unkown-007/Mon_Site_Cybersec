"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  estimateStrength,
  generatePassword,
  generatePassphrase,
  type GenOptions,
} from "@/lib/passgen";

/* ════════════════════ Modèle ════════════════════ */

type EntryType = "password" | "apikey" | "ssh" | "card" | "wifi" | "note";

interface VaultEntry {
  id: string;
  type: EntryType;
  title: string;
  username?: string;
  secret: string;
  url?: string;
  tags?: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
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

const TYPE_META: Record<EntryType, { label: string; secretLabel: string; accent: string }> = {
  password: { label: "Mot de passe", secretLabel: "Mot de passe", accent: "text-secondary" },
  apikey: { label: "Clé API", secretLabel: "Clé / token", accent: "text-primary" },
  ssh: { label: "Clé SSH", secretLabel: "Clé privée", accent: "text-success" },
  card: { label: "Carte", secretLabel: "Numéro / CVV", accent: "text-warning" },
  wifi: { label: "Wi-Fi", secretLabel: "Clé réseau", accent: "text-secondary" },
  note: { label: "Note", secretLabel: "Contenu", accent: "text-muted" },
};
const TYPE_ORDER: EntryType[] = ["password", "apikey", "ssh", "card", "wifi", "note"];
const credentialTypes = new Set<EntryType>(["password", "apikey", "ssh", "wifi"]);

/* Normalise les anciennes entrées {id,title,secret} vers le modèle enrichi. */
function normalize(raw: Partial<VaultEntry> & { id: string; title: string; secret: string }): VaultEntry {
  const now = Date.now();
  return {
    id: raw.id,
    type: (raw.type as EntryType) ?? "password",
    title: raw.title,
    username: raw.username,
    secret: raw.secret,
    url: raw.url,
    tags: raw.tags,
    notes: raw.notes,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

function relTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

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

const SCORE_BAR = ["bg-danger", "bg-danger", "bg-warning", "bg-secondary", "bg-success"];

const blankDraft = () => ({
  type: "password" as EntryType,
  title: "",
  username: "",
  secret: "",
  url: "",
  tags: "",
  notes: "",
});

export default function VaultPage() {
  const { push } = useToast();
  const [hasVault, setHasVault] = useState(false);
  const [blob, setBlob] = useState<string | null>(null);
  const [dek, setDek] = useState<string | null>(null);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [screen, setScreen] = useState<LockedScreen>("unlock");
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const [lockIn, setLockIn] = useState(300);
  const [pending, setPending] = useState<PendingRecovery | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  // formulaire verrouillé
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");

  // tableau de bord déverrouillé
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<EntryType | "all">("all");
  const [reveal, setReveal] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(blankDraft());
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  // générateur
  const [genMode, setGenMode] = useState<"password" | "passphrase">("password");
  const [genOpts, setGenOpts] = useState<GenOptions>({
    length: 20,
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    avoidAmbiguous: true,
  });
  const [phrase, setPhrase] = useState({ words: 4, sep: "-", caps: true, num: true });
  const [generated, setGenerated] = useState("");

  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const b = localStorage.getItem(STORAGE);
    setBlob(b);
    setHasVault(b !== null);
    setScreen(b !== null ? "unlock" : "setup");
  }, []);

  // Auto-lock après 5 min d'inactivité.
  useEffect(() => {
    if (!dek || opening) return;
    let remaining = 300;
    setLockIn(300);
    const tick = setInterval(() => {
      remaining -= 1;
      setLockIn(remaining);
      if (remaining <= 0) lock();
    }, 1000);
    const r = () => {
      remaining = 300;
      setLockIn(300);
    };
    window.addEventListener("mousemove", r);
    window.addEventListener("keydown", r);
    return () => {
      clearInterval(tick);
      window.removeEventListener("mousemove", r);
      window.removeEventListener("keydown", r);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dek, opening]);

  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (clipTimer.current) clearTimeout(clipTimer.current);
    },
    [],
  );

  const resetForm = () => {
    setPwd("");
    setPwd2("");
    setRecoveryInput("");
  };

  /* ──────────── Setup / Unlock / Reset ──────────── */
  const submitSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < MIN_PWD) return push("err", `Mot de passe trop court (min. ${MIN_PWD}).`);
    if (pwd !== pwd2) return push("err", "Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    try {
      const { blob: nb, recoveryCode, dek: nd } = await createVault<VaultEntry[]>([], pwd);
      localStorage.setItem(STORAGE, nb);
      setBlob(nb);
      setHasVault(true);
      setDek(nd);
      setEntries([]);
      const mail = await emailRecoveryCode(recoveryCode, "setup");
      setPending({ code: recoveryCode, emailed: mail.status, to: mail.to });
      resetForm();
    } catch {
      push("err", "Impossible d'initialiser le coffre.");
    } finally {
      setBusy(false);
    }
  };

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
        const { data, dek: nd } = await unlockVault<VaultEntry[]>(b, pwd);
        setBlob(b);
        setDek(nd);
        setEntries(data.map(normalize));
        resetForm();
        setOpening(true);
        push("ok", "Coffre déverrouillé.");
      } else {
        const data = await decryptJSON<VaultEntry[]>(b, pwd);
        const { blob: nb, recoveryCode, dek: nd } = await createVault<VaultEntry[]>(data, pwd);
        localStorage.setItem(STORAGE, nb);
        setBlob(nb);
        setDek(nd);
        setEntries(data.map(normalize));
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

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blob) return;
    if (pwd.length < MIN_PWD) return push("err", `Nouveau mot de passe trop court (min. ${MIN_PWD}).`);
    if (pwd !== pwd2) return push("err", "Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    try {
      const { data, dek: nd } = await recoverVault<VaultEntry[]>(blob, recoveryInput);
      const nb = await rewrapPassword(blob, nd, pwd);
      localStorage.setItem(STORAGE, nb);
      setBlob(nb);
      setDek(nd);
      setEntries(data.map(normalize));
      resetForm();
      setScreen("unlock");
      setOpening(true);
      push("ok", "Mot de passe réinitialisé — coffre récupéré.");
    } catch {
      push("err", "Code de récupération invalide.");
    } finally {
      setBusy(false);
    }
  };

  const lock = () => {
    setDek(null);
    setEntries([]);
    setReveal(null);
    setEditingId(null);
    setDraft(blankDraft());
    setQuery("");
    setFilterType("all");
    setScreen("unlock");
    push("warn", "Coffre verrouillé.");
  };

  const wipeVault = () => {
    localStorage.removeItem(STORAGE);
    setBlob(null);
    setHasVault(false);
    setDek(null);
    setEntries([]);
    setConfirmWipe(false);
    resetForm();
    setScreen("setup");
    push("warn", "Coffre effacé — crée-en un nouveau.");
  };

  const persist = async (next: VaultEntry[]) => {
    if (!blob || !dek) return;
    const nb = await resaveVault<VaultEntry[]>(blob, next, dek);
    localStorage.setItem(STORAGE, nb);
    setBlob(nb);
  };

  /* ──────────── CRUD entrées ──────────── */
  const saveEntry = async () => {
    if (!dek || !draft.title.trim() || !draft.secret.trim()) return;
    const now = Date.now();
    const tags = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const base = {
      type: draft.type,
      title: draft.title.trim(),
      username: draft.username.trim() || undefined,
      secret: draft.secret,
      url: draft.url.trim() || undefined,
      tags: tags.length ? tags : undefined,
      notes: draft.notes.trim() || undefined,
    };
    let next: VaultEntry[];
    if (editingId) {
      next = entries.map((e) => (e.id === editingId ? { ...e, ...base, updatedAt: now } : e));
      push("ok", "Entrée mise à jour.");
    } else {
      next = [{ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...base }, ...entries];
      push("ok", "Entrée chiffrée ajoutée.");
    }
    setEntries(next);
    await persist(next);
    setEditingId(null);
    setDraft(blankDraft());
  };

  const startEdit = (e: VaultEntry) => {
    setEditingId(e.id);
    setReveal(null);
    setDraft({
      type: e.type,
      title: e.title,
      username: e.username ?? "",
      secret: e.secret,
      url: e.url ?? "",
      tags: (e.tags ?? []).join(", "),
      notes: e.notes ?? "",
    });
    asideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const removeEntry = async (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    await persist(next);
    setConfirmDel(null);
    if (reveal === id) setReveal(null);
    if (editingId === id) {
      setEditingId(null);
      setDraft(blankDraft());
    }
    push("warn", "Entrée supprimée.");
  };

  const toggleReveal = (id: string) => {
    if (reveal === id) {
      setReveal(null);
      return;
    }
    setReveal(id);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => setReveal(null), 10000);
  };

  const copySecure = (text: string, label = "Copié") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        push("ok", `${label} — presse-papier auto-effacé (20s).`);
        if (clipTimer.current) clearTimeout(clipTimer.current);
        clipTimer.current = setTimeout(() => navigator.clipboard.writeText(" ").catch(() => {}), 20000);
      })
      .catch(() => push("err", "Copie impossible."));
  };

  const exportBackup = () => {
    if (!blob) return;
    const file = new Blob([blob], { type: "application/octet-stream" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unknownx-vault-${new Date().toISOString().slice(0, 10)}.uxvault`;
    a.click();
    URL.revokeObjectURL(url);
    push("ok", "Sauvegarde chiffrée exportée.");
  };

  /* ──────────── Générateur ──────────── */
  const runGenerate = () => {
    const val =
      genMode === "password"
        ? generatePassword(genOpts)
        : generatePassphrase(phrase.words, phrase.sep, phrase.caps, phrase.num);
    setGenerated(val);
    return val;
  };
  useEffect(() => {
    runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genMode, genOpts, phrase]);

  const useGenerated = () => {
    const v = generated || runGenerate();
    setDraft((d) => ({ ...d, secret: v }));
    push("ok", "Secret injecté dans l'éditeur.");
  };

  /* ──────────── Données dérivées ──────────── */
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of entries) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, [entries]);

  const weakCount = useMemo(
    () => entries.filter((e) => credentialTypes.has(e.type) && estimateStrength(e.secret).score <= 1).length,
    [entries],
  );
  const lastUpdated = useMemo(
    () => (entries.length ? Math.max(...entries.map((e) => e.updatedAt)) : 0),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => filterType === "all" || e.type === filterType)
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          (e.username ?? "").toLowerCase().includes(q) ||
          (e.url ?? "").toLowerCase().includes(q) ||
          (e.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
          TYPE_META[e.type].label.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [entries, filterType, query]);

  /* ════════════════════ Rendus ════════════════════ */

  // 1) Panneau code de récupération (après setup/migration)
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
            ⚠ // C&apos;est le SEUL moyen de réinitialiser ton mot de passe sans
            perdre tes données. Il ne sera plus jamais affiché.
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
              <span className="text-warning">Email non configuré — sauvegarde ce code manuellement.</span>
            ) : (
              <span className="text-danger">Échec de l&apos;envoi email — sauvegarde ce code manuellement.</span>
            )}
          </p>
          <button
            onClick={() => {
              setPending(null);
              setOpening(true);
            }}
            className="btn btn-primary w-full justify-center"
          >
            J&apos;ai sauvegardé mon code — ouvrir le coffre
          </button>
        </div>
      </div>
    );
  }

  // 2) Animation d'ouverture
  if (opening) return <VaultDoor onDone={() => setOpening(false)} />;

  // 3) Écrans verrouillés
  if (!dek) {
    const st = estimateStrength(pwd);
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
            ⚠ // Chiffrement par enveloppe : une clé aléatoire protège tes données,
            emballée par ton mot de passe ET un code de récupération.
          </p>
        </div>

        {screen === "setup" && (
          <form onSubmit={submitSetup} className="card p-6 space-y-4">
            <h2 className="label text-secondary">{"// CRÉATION DU COFFRE"}</h2>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Choisis un mot de passe maître</span>
              <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="field" placeholder="••••••••" autoFocus autoComplete="new-password" />
            </label>
            {pwd.length > 0 && (
              <div>
                <div className="h-1 w-full bg-line rounded overflow-hidden">
                  <div className={`h-full transition-all ${SCORE_BAR[st.score]}`} style={{ width: `${(st.score / 4) * 100}%` }} />
                </div>
                <p className="text-[10px] font-mono text-muted mt-1">
                  robustesse : {st.label} · ~{st.bits} bits
                </p>
              </div>
            )}
            <label className="block">
              <span className="label !text-muted block mb-1.5">Confirme</span>
              <input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} className="field" placeholder="••••••••" autoComplete="new-password" />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
              {busy ? "Chiffrement…" : "Créer le coffre"}
            </button>
            {hasVault && (
              <button type="button" onClick={() => { resetForm(); setScreen("unlock"); }} className="text-[10px] font-mono text-muted hover:text-secondary w-full text-center">
                ← un coffre existe déjà — déverrouiller
              </button>
            )}
          </form>
        )}

        {screen === "unlock" && (
          <form onSubmit={submitUnlock} className="card p-6 space-y-4">
            <h2 className="label text-secondary">{"// DÉVERROUILLAGE"}</h2>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Mot de passe maître</span>
              <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="field" placeholder="••••••••" autoFocus autoComplete="current-password" />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
              {busy ? "Déchiffrement…" : "Déverrouiller"}
            </button>
            <button type="button" onClick={() => { resetForm(); setScreen("reset"); }} className="text-[10px] font-mono text-muted hover:text-secondary w-full text-center">
              Mot de passe oublié ? Réinitialiser avec le code de récupération
            </button>
          </form>
        )}

        {screen === "reset" && (
          <form onSubmit={submitReset} className="card p-6 space-y-4">
            <h2 className="label text-secondary">{"// RÉINITIALISATION"}</h2>
            <p className="text-[11px] font-mono text-muted leading-relaxed">
              Saisis le code de récupération (envoyé par email) puis un nouveau mot de passe. Tes données sont conservées.
            </p>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Code de récupération</span>
              <input type="text" value={recoveryInput} onChange={(e) => setRecoveryInput(e.target.value)} className="field font-mono tracking-[2px]" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autoFocus autoComplete="off" spellCheck={false} />
            </label>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Nouveau mot de passe maître</span>
              <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="field" placeholder="••••••••" autoComplete="new-password" />
            </label>
            <label className="block">
              <span className="label !text-muted block mb-1.5">Confirme</span>
              <input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} className="field" placeholder="••••••••" autoComplete="new-password" />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
              {busy ? "Récupération…" : "Réinitialiser & déverrouiller"}
            </button>
            <button type="button" onClick={() => { resetForm(); setScreen("unlock"); }} className="text-[10px] font-mono text-muted hover:text-secondary w-full text-center">
              ← retour au déverrouillage
            </button>
          </form>
        )}

        {hasVault && screen !== "setup" && (
          <div className="mt-4">
            {!confirmWipe ? (
              <button type="button" onClick={() => setConfirmWipe(true)} className="text-[10px] font-mono text-muted hover:text-danger w-full text-center">
                Tout perdu (mot de passe ET code) ? Effacer le coffre et repartir de zéro
              </button>
            ) : (
              <div className="card p-4 border-danger/40 space-y-3">
                <p className="font-mono text-xs text-danger leading-relaxed">
                  ⚠ // EFFACEMENT DÉFINITIF — les notes chiffrées seront perdues pour toujours.
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setConfirmWipe(false)} className="btn btn-ghost flex-1 justify-center text-xs">Annuler</button>
                  <button type="button" onClick={wipeVault} className="btn flex-1 justify-center text-xs border border-danger text-danger hover:bg-danger hover:text-ink">Effacer définitivement</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ──────────── Écran déverrouillé (tableau de bord) ──────────── */
  const mm = Math.floor(lockIn / 60);
  const ss = String(lockIn % 60).padStart(2, "0");
  const urgent = lockIn <= 60;
  const genStrength = estimateStrength(generated);

  return (
    <div>
      <div aria-hidden className="fixed inset-0 z-[2] pointer-events-none bg-danger/[0.04]" />
      <div className="fixed top-14 inset-x-0 z-[40] h-0.5 bg-line">
        <div
          className={`h-full transition-[width] duration-1000 ${urgent ? "bg-danger animate-pulse" : "bg-gradient-to-r from-primary to-secondary"}`}
          style={{ width: `${(lockIn / 300) * 100}%` }}
        />
      </div>

      <PageHeader
        code="VLT // ZONE CLASSIFIÉE"
        title="Vault"
        desc="Coffre déchiffré en mémoire. Verrouille en quittant."
        state="danger"
        right={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="card px-2 py-1 font-mono text-[10px] text-secondary flex items-center gap-1.5">
              <span className="inline-block animate-[spin_8s_linear_infinite]">🔒</span> AES-256
            </span>
            <span className={`card px-2 py-1 font-mono text-[10px] ${urgent ? "text-danger animate-pulse" : "text-muted"}`}>
              auto-lock {mm}:{ss}
            </span>
            <button onClick={exportBackup} className="btn btn-ghost !py-2 text-xs" title="Exporter une sauvegarde chiffrée">
              ⤓ Backup
            </button>
            <button onClick={lock} className="btn btn-ghost !py-2 text-xs">🔒 Verrouiller</button>
          </div>
        }
      />

      {/* ── HUD stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatTile label="Entrées" value={String(entries.length)} accent="text-ink-strong" />
        <StatTile label="Types" value={String(Object.keys(counts).length)} accent="text-primary" />
        <StatTile label="Secrets faibles" value={String(weakCount)} accent={weakCount ? "text-danger" : "text-success"} sub={weakCount ? "à renforcer" : "tout est solide"} />
        <StatTile label="Dernière MAJ" value={lastUpdated ? relTime(lastUpdated) : "—"} accent="text-secondary" />
      </div>

      {/* ── Barre d'outils ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field !pl-9"
            placeholder="Rechercher (titre, login, url, tag)…"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterChip active={filterType === "all"} onClick={() => setFilterType("all")} label="Tout" count={entries.length} />
          {TYPE_ORDER.filter((t) => counts[t]).map((t) => (
            <FilterChip key={t} active={filterType === t} onClick={() => setFilterType(t)} label={TYPE_META[t].label} count={counts[t]} icon={<TypeIcon type={t} />} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Liste ── */}
        <section>
          <h2 className="label mb-4">
            Entrées · {filtered.length}
            {filtered.length !== entries.length && <span className="text-muted/60"> / {entries.length}</span>}
          </h2>

          {entries.length === 0 ? (
            <EmptyState onAdd={() => asideRef.current?.scrollIntoView({ behavior: "smooth" })} />
          ) : filtered.length === 0 ? (
            <div className="card p-8 text-center font-mono text-sm text-muted">
              [ aucun résultat ] — affine ta recherche.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filtered.map((e, i) => {
                const revealed = reveal === e.id;
                const isCred = credentialTypes.has(e.type);
                const st = isCred ? estimateStrength(e.secret) : null;
                return (
                  <li
                    key={e.id}
                    className={`card corner-frame scan-hover p-4 animate-fade-up ${editingId === e.id ? "border-secondary/60" : ""}`}
                    style={{ animationDelay: `${Math.min(i, 8) * 50}ms`, animationFillMode: "backwards" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 grid place-items-center h-9 w-9 rounded-sm border border-line-strong bg-base/60 ${TYPE_META[e.type].accent}`}>
                        <TypeIcon type={e.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm text-ink-strong truncate">{e.title}</span>
                          <span className="shrink-0 text-[9px] font-mono uppercase tracking-[1px] text-muted">{TYPE_META[e.type].label}</span>
                        </div>
                        {e.username && (
                          <button
                            onClick={() => copySecure(e.username!, "Login copié")}
                            className="mt-0.5 font-mono text-xs text-muted hover:text-secondary truncate block max-w-full"
                            title="Copier le login"
                          >
                            {e.username}
                          </button>
                        )}
                        {e.url && (
                          <a href={/^https?:\/\//.test(e.url) ? e.url : `https://${e.url}`} target="_blank" rel="noreferrer noopener" className="mt-0.5 font-mono text-[11px] text-primary/80 hover:text-primary truncate block max-w-full">
                            ↗ {e.url}
                          </a>
                        )}
                      </div>
                    </div>

                    <pre className="mt-3 font-mono text-xs text-ink/90 whitespace-pre-wrap break-all bg-base/60 border border-line p-2 rounded-sm">
                      {revealed ? e.secret : "•".repeat(Math.min(e.secret.length, 40))}
                    </pre>

                    {st && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-line rounded overflow-hidden">
                          <div className={`h-full ${SCORE_BAR[st.score]}`} style={{ width: `${(st.score / 4) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-muted shrink-0">{st.label} · ~{st.bits}b</span>
                      </div>
                    )}

                    {e.tags && e.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {e.tags.map((t) => (
                          <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 border border-line-strong text-muted rounded-sm">#{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-line-subtle flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono text-muted/70">maj {relTime(e.updatedAt)}</span>
                      <div className="flex items-center gap-2.5">
                        <ActBtn onClick={() => toggleReveal(e.id)} cls="hover:text-secondary">{revealed ? "masquer" : "révéler"}</ActBtn>
                        <ActBtn onClick={() => copySecure(e.secret)} cls="hover:text-primary">copier</ActBtn>
                        <ActBtn onClick={() => startEdit(e)} cls="hover:text-secondary">éditer</ActBtn>
                        {confirmDel === e.id ? (
                          <>
                            <ActBtn onClick={() => removeEntry(e.id)} cls="text-danger hover:text-danger">confirmer ?</ActBtn>
                            <ActBtn onClick={() => setConfirmDel(null)} cls="hover:text-muted">non</ActBtn>
                          </>
                        ) : (
                          <ActBtn onClick={() => setConfirmDel(e.id)} cls="hover:text-danger">suppr</ActBtn>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Aside : éditeur + générateur ── */}
        <aside ref={asideRef} className="space-y-5 lg:sticky lg:top-20 self-start">
          {/* Éditeur */}
          <section className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="label">{editingId ? "Modifier l'entrée" : "Nouvelle entrée"}</h2>
              {editingId && (
                <button onClick={() => { setEditingId(null); setDraft(blankDraft()); }} className="text-[10px] font-mono text-muted hover:text-secondary">
                  + nouvelle
                </button>
              )}
            </div>

            <span className="label !text-muted block mb-1.5">Type</span>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {TYPE_ORDER.map((t) => (
                <button
                  key={t}
                  onClick={() => setDraft((d) => ({ ...d, type: t }))}
                  className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-sm text-[10px] font-mono transition-colors ${
                    draft.type === t ? "border-secondary text-secondary bg-secondary/5" : "border-line-strong text-muted hover:border-line"
                  }`}
                >
                  <TypeIcon type={t} />
                  <span className="truncate">{TYPE_META[t].label}</span>
                </button>
              ))}
            </div>

            <label className="block mb-3">
              <span className="label !text-muted block mb-1.5">Titre</span>
              <input className="field" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="ex. VPN lab" />
            </label>

            {draft.type !== "note" && (
              <label className="block mb-3">
                <span className="label !text-muted block mb-1.5">Login / identifiant</span>
                <input className="field" value={draft.username} onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))} placeholder="ex. root, admin@…" autoComplete="off" />
              </label>
            )}

            <label className="block mb-1">
              <span className="label !text-muted block mb-1.5">{TYPE_META[draft.type].secretLabel}</span>
              <textarea className="field min-h-[88px] resize-y" value={draft.secret} onChange={(e) => setDraft((d) => ({ ...d, secret: e.target.value }))} placeholder="•••••••• / contenu" spellCheck={false} />
            </label>
            {draft.secret && credentialTypes.has(draft.type) && (
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1 flex-1 bg-line rounded overflow-hidden">
                  <div className={`h-full ${SCORE_BAR[estimateStrength(draft.secret).score]}`} style={{ width: `${(estimateStrength(draft.secret).score / 4) * 100}%` }} />
                </div>
                <span className="text-[9px] font-mono text-muted shrink-0">{estimateStrength(draft.secret).label}</span>
              </div>
            )}

            {draft.type !== "note" && (
              <label className="block mb-3">
                <span className="label !text-muted block mb-1.5">URL (optionnel)</span>
                <input className="field" value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} placeholder="ex. lab.local:8443" autoComplete="off" />
              </label>
            )}

            <label className="block mb-4">
              <span className="label !text-muted block mb-1.5">Tags (séparés par des virgules)</span>
              <input className="field" value={draft.tags} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} placeholder="lab, prod, perso" autoComplete="off" />
            </label>

            <div className="flex gap-2">
              {editingId && (
                <button onClick={() => { setEditingId(null); setDraft(blankDraft()); }} className="btn btn-ghost flex-1 justify-center text-xs">
                  Annuler
                </button>
              )}
              <button onClick={saveEntry} disabled={!draft.title.trim() || !draft.secret.trim()} className="btn btn-primary flex-1 justify-center disabled:opacity-50">
                {editingId ? "Mettre à jour" : "Chiffrer & ajouter"}
              </button>
            </div>
          </section>

          {/* Générateur */}
          <section className="card p-5 gui-stream">
            <div className="flex items-center justify-between mb-4">
              <h2 className="label text-secondary">{"// GÉNÉRATEUR"}</h2>
              <div className="flex border border-line-strong rounded-sm overflow-hidden text-[10px] font-mono">
                <button onClick={() => setGenMode("password")} className={`px-2 py-1 ${genMode === "password" ? "bg-secondary/10 text-secondary" : "text-muted"}`}>aléatoire</button>
                <button onClick={() => setGenMode("passphrase")} className={`px-2 py-1 ${genMode === "passphrase" ? "bg-secondary/10 text-secondary" : "text-muted"}`}>phrase</button>
              </div>
            </div>

            <div className="bg-base/60 border border-line p-3 rounded-sm mb-2 min-h-[44px] flex items-center">
              <code className="font-mono text-sm text-ink-strong break-all flex-1">{generated || "—"}</code>
              <button onClick={runGenerate} className="shrink-0 ml-2 text-muted hover:text-secondary" title="Régénérer">↻</button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 flex-1 bg-line rounded overflow-hidden">
                <div className={`h-full ${SCORE_BAR[genStrength.score]}`} style={{ width: `${(genStrength.score / 4) * 100}%` }} />
              </div>
              <span className="text-[9px] font-mono text-muted shrink-0">~{genStrength.bits} bits</span>
            </div>

            {genMode === "password" ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="label !text-muted">Longueur</span>
                    <span className="font-mono text-xs text-secondary">{genOpts.length}</span>
                  </div>
                  <input type="range" min={8} max={64} value={genOpts.length} onChange={(e) => setGenOpts((o) => ({ ...o, length: Number(e.target.value) }))} className="deck-range w-full" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Toggle label="a-z" on={genOpts.lower} onClick={() => setGenOpts((o) => ({ ...o, lower: !o.lower }))} />
                  <Toggle label="A-Z" on={genOpts.upper} onClick={() => setGenOpts((o) => ({ ...o, upper: !o.upper }))} />
                  <Toggle label="0-9" on={genOpts.digits} onClick={() => setGenOpts((o) => ({ ...o, digits: !o.digits }))} />
                  <Toggle label="!@#$" on={genOpts.symbols} onClick={() => setGenOpts((o) => ({ ...o, symbols: !o.symbols }))} />
                  <Toggle label="sans ambigus" on={genOpts.avoidAmbiguous} onClick={() => setGenOpts((o) => ({ ...o, avoidAmbiguous: !o.avoidAmbiguous }))} wide />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="label !text-muted">Mots</span>
                    <span className="font-mono text-xs text-secondary">{phrase.words}</span>
                  </div>
                  <input type="range" min={3} max={8} value={phrase.words} onChange={(e) => setPhrase((p) => ({ ...p, words: Number(e.target.value) }))} className="deck-range w-full" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["-", "_", ".", " "] as const).map((s) => (
                    <Toggle key={s} label={`sép « ${s === " " ? "espace" : s} »`} on={phrase.sep === s} onClick={() => setPhrase((p) => ({ ...p, sep: s }))} />
                  ))}
                  <Toggle label="Majuscules" on={phrase.caps} onClick={() => setPhrase((p) => ({ ...p, caps: !p.caps }))} />
                  <Toggle label="+ chiffre" on={phrase.num} onClick={() => setPhrase((p) => ({ ...p, num: !p.num }))} />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => copySecure(generated)} className="btn btn-ghost flex-1 justify-center text-xs">Copier</button>
              <button onClick={useGenerated} className="btn btn-primary flex-1 justify-center text-xs">Utiliser →</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ════════════════════ Sous-composants ════════════════════ */

function StatTile({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) {
  return (
    <div className="card corner-frame p-3">
      <p className="label !text-muted mb-1">{label}</p>
      <p className={`font-display text-xl ${accent}`}>{value}</p>
      {sub && <p className="text-[9px] font-mono text-muted/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function FilterChip({ active, onClick, label, count, icon }: { active: boolean; onClick: () => void; label: string; count: number; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-sm text-[10px] font-mono uppercase tracking-[1px] transition-colors ${
        active ? "border-secondary text-secondary bg-secondary/5" : "border-line-strong text-muted hover:border-line hover:text-ink"
      }`}
    >
      {icon}
      {label}
      <span className={active ? "text-secondary/70" : "text-muted/50"}>{count}</span>
    </button>
  );
}

function Toggle({ label, on, onClick, wide }: { label: string; on: boolean; onClick: () => void; wide?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1.5 border rounded-sm text-[10px] font-mono transition-colors ${wide ? "col-span-2" : ""} ${
        on ? "border-primary text-primary bg-primary/5" : "border-line-strong text-muted hover:border-line"
      }`}
    >
      {on ? "◉" : "○"} {label}
    </button>
  );
}

function ActBtn({ onClick, cls, children }: { onClick: () => void; cls: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`text-[10px] font-mono uppercase tracking-[1px] text-muted ${cls}`}>
      {children}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card p-10 text-center">
      <div className="text-4xl mb-3 opacity-40">🗝️</div>
      <p className="font-mono text-sm text-muted mb-4">
        [ coffre vide ] — ajoute ta première entrée chiffrée.
      </p>
      <button onClick={onAdd} className="btn btn-primary justify-center text-xs lg:hidden">
        + Nouvelle entrée
      </button>
    </div>
  );
}

function TypeIcon({ type }: { type: EntryType }) {
  const common = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "password":
      return (<svg {...common}><circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 21 2m-4 0 3 3m-6 0 3 3" /></svg>);
    case "apikey":
      return (<svg {...common}><path d="m8 16-4-4 4-4m8 0 4 4-4 4M14 4l-4 16" /></svg>);
    case "ssh":
      return (<svg {...common}><rect x="3" y="4" width="18" height="16" rx="1" /><path d="m7 9 3 3-3 3m5 0h4" /></svg>);
    case "card":
      return (<svg {...common}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>);
    case "wifi":
      return (<svg {...common}><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="0.5" fill="currentColor" /></svg>);
    case "note":
      return (<svg {...common}><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4M9 13h6M9 17h6" /></svg>);
  }
}
