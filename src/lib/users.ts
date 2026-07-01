import { kvReady, kvGet, kvSet, kvSadd, kvSmembers } from "@/lib/kv";
import type { Role } from "@/lib/session";

/*
 * Comptes utilisateurs persistés (Vercel KV). Un compte est créé
 * automatiquement à la première connexion (OAuth ou credentials). L'admin
 * peut ensuite changer le rôle et bannir.
 */

export type AccountStatus = "active" | "banned";

/** Un "unlock" / résolution de challenge (CTF, box, etc.). */
export interface Solve {
  name: string;
  points: number;
  cat?: string;
  at: number;
}

export interface Account {
  email: string;
  name: string;
  provider: string;
  role: Role;
  status: AccountStatus;
  firstSeen: number; // "qui a rejoint quand"
  lastSeen: number;
  logins: number;
  // ── Profil social (optionnel) ──
  displayName?: string;
  avatar?: string; // data URL (photo redimensionnée) ou URL https
  bio?: string;
  handle?: string;
  country?: string;
  score?: number; // somme des points des solves (classement)
  teamId?: string;
  solves?: Solve[];
}

/** Champs de profil éditables par l'utilisateur lui-même. */
export type ProfilePatch = Partial<Pick<Account, "displayName" | "avatar" | "bio" | "handle" | "country">>;

const keyFor = (email: string) => `user:${email.toLowerCase()}`;
const SET = "users";

export async function getAccount(email: string): Promise<Account | null> {
  if (!kvReady) return null;
  const raw = await kvGet(keyFor(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Account;
  } catch {
    return null;
  }
}

/** Crée le compte au 1er login, sinon met à jour lastSeen / logins. */
export async function recordLogin(input: {
  email: string;
  name: string;
  provider: string;
  defaultRole: Role;
}): Promise<Account> {
  const now = Date.now();
  const fresh: Account = {
    email: input.email,
    name: input.name,
    provider: input.provider,
    role: input.defaultRole,
    status: "active",
    firstSeen: now,
    lastSeen: now,
    logins: 1,
  };
  if (!kvReady) return fresh; // pas de DB → compte éphémère, login OK quand même

  const existing = await getAccount(input.email);
  const rec: Account = existing
    ? {
        ...existing,
        name: input.name,
        provider: input.provider,
        lastSeen: now,
        logins: existing.logins + 1,
      }
    : fresh;

  await kvSet(keyFor(input.email), JSON.stringify(rec));
  await kvSadd(SET, input.email.toLowerCase());
  return rec;
}

export async function listAccounts(): Promise<Account[]> {
  if (!kvReady) return [];
  const emails = (await kvSmembers(SET)) ?? [];
  const out: Account[] = [];
  for (const e of emails) {
    const a = await getAccount(e);
    if (a) out.push(a);
  }
  return out.sort((a, b) => b.lastSeen - a.lastSeen);
}

export async function updateAccount(
  email: string,
  patch: Partial<Pick<Account, "role" | "status">>,
): Promise<Account | null> {
  if (!kvReady) return null;
  const a = await getAccount(email);
  if (!a) return null;
  const next: Account = { ...a, ...patch };
  await kvSet(keyFor(email), JSON.stringify(next));
  return next;
}

/** Patch interne générique (score, teamId, solves…) — réservé au serveur. */
export async function patchAccount(email: string, patch: Partial<Account>): Promise<Account | null> {
  if (!kvReady) return null;
  const a = await getAccount(email);
  if (!a) return null;
  const next: Account = { ...a, ...patch };
  await kvSet(keyFor(email), JSON.stringify(next));
  return next;
}

/** Mise à jour du profil par l'utilisateur (champs texte + avatar). */
export async function updateProfile(email: string, patch: ProfilePatch): Promise<Account | null> {
  const clean: ProfilePatch = {};
  const cap = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : undefined);
  if (patch.displayName !== undefined) clean.displayName = cap(patch.displayName, 40);
  if (patch.bio !== undefined) clean.bio = cap(patch.bio, 280);
  if (patch.handle !== undefined) clean.handle = cap(patch.handle, 30)?.replace(/[^\w.-]/g, "");
  if (patch.country !== undefined) clean.country = cap(patch.country, 40);
  if (patch.avatar !== undefined) {
    const a = patch.avatar;
    // data URL image (≤ ~200 KB) ou URL https
    if (typeof a === "string" && (/^data:image\/(png|jpe?g|webp);base64,/.test(a) ? a.length <= 200_000 : /^https:\/\//.test(a))) {
      clean.avatar = a;
    }
  }
  return patchAccount(email, clean);
}
