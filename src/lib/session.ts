/*
 * Session signée côté serveur — token type JWT (HMAC-SHA256) fabriqué avec
 * la Web Crypto API native : aucune dépendance, compatible runtime Edge
 * (middleware) ET Node (route handlers). Le secret vit côté serveur
 * uniquement (AUTH_SECRET) ; le cookie est httpOnly, donc infalsifiable
 * depuis le navigateur — contrairement à l'ancienne session localStorage.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

/*
 * Secret de signature. En production il est OBLIGATOIRE et fort (≥16 car.) :
 * à défaut on refuse de signer/vérifier (fail-closed) plutôt que d'utiliser un
 * secret connu — ce qui permettrait à n'importe qui de forger une session admin.
 * En dev seulement, un repli générique non sensible est toléré.
 */
function resolveSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-insecure-secret-change-me";
  throw new Error("AUTH_SECRET manquant ou trop court (<16) en production");
}
export const SESSION_COOKIE = "ux077_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  const bin = atob(s + "=".repeat(pad));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(resolveSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i];
  return r === 0;
}

export type Role = "admin" | "operator";

export interface SessionPayload {
  email: string;
  name: string;
  role: Role;
}

interface TokenBody extends SessionPayload {
  iat: number;
  exp: number;
}

export interface VerifiedSession extends SessionPayload {
  since: number; // ms (pour `uptime`)
}

export async function signSession(
  payload: SessionPayload,
  maxAgeSec = SESSION_MAX_AGE,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const body: TokenBody = { ...payload, iat: now, exp: now + maxAgeSec };
  const payloadStr = b64urlEncode(enc.encode(JSON.stringify(body)));
  const key = await hmacKey();
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr)));
  return `${payloadStr}.${b64urlEncode(sig)}`;
}

export async function verifySession(
  token: string | undefined | null,
): Promise<VerifiedSession | null> {
  if (!token || !token.includes(".")) return null;
  const [payloadStr, sigStr] = token.split(".");
  try {
    const key = await hmacKey();
    const expected = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr)),
    );
    if (!timingSafeEqual(expected, b64urlDecode(sigStr))) return null;
    const body = JSON.parse(dec.decode(b64urlDecode(payloadStr))) as TokenBody;
    if (typeof body.exp !== "number" || body.exp < Math.floor(Date.now() / 1000)) return null;
    if (!body.email || !body.role) return null;
    return {
      email: body.email,
      name: body.name,
      role: body.role,
      since: (body.iat || 0) * 1000,
    };
  } catch {
    return null;
  }
}
