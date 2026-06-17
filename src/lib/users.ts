import { kvReady, kvGet, kvSet, kvSadd, kvSmembers } from "@/lib/kv";
import type { Role } from "@/lib/session";

/*
 * Comptes utilisateurs persistés (Vercel KV). Un compte est créé
 * automatiquement à la première connexion (OAuth ou credentials). L'admin
 * peut ensuite changer le rôle et bannir.
 */

export type AccountStatus = "active" | "banned";

export interface Account {
  email: string;
  name: string;
  provider: string;
  role: Role;
  status: AccountStatus;
  firstSeen: number; // "qui a rejoint quand"
  lastSeen: number;
  logins: number;
}

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
