/*
 * Chiffrement côté client pour la zone Vault.
 * AES-GCM 256 bits, clé dérivée du mot de passe maître via PBKDF2 (SHA-256).
 * Le mot de passe maître n'est jamais stocké : seul le blob chiffré l'est.
 * Format stocké (base64) : [ salt(16) | iv(12) | ciphertext ].
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITER = 150_000;

// TS 5.7+ a rendu Uint8Array générique sur ArrayBufferLike, que les APIs
// Web Crypto (BufferSource) refusent. Petit pont de typage.
const buf = (b: Uint8Array): BufferSource => b as unknown as BufferSource;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    buf(enc.encode(password)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: buf(salt), iterations: PBKDF2_ITER, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function toB64(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptJSON(data: unknown, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: buf(iv) },
      key,
      buf(enc.encode(JSON.stringify(data)))
    )
  );
  const blob = new Uint8Array(salt.length + iv.length + ct.length);
  blob.set(salt, 0);
  blob.set(iv, salt.length);
  blob.set(ct, salt.length + iv.length);
  return toB64(blob);
}

export async function decryptJSON<T>(blobB64: string, password: string): Promise<T> {
  const blob = fromB64(blobB64);
  const salt = blob.slice(0, 16);
  const iv = blob.slice(16, 28);
  const ct = blob.slice(28);
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf(iv) }, key, buf(ct));
  return JSON.parse(dec.decode(pt)) as T;
}

/* ════════════════════════════════════════════════════════════════════════
 * Coffre v2 — chiffrement par enveloppe (envelope encryption).
 *
 * Pourquoi : en v1 la clé AES dérivait directement du mot de passe maître, donc
 * « changer / réinitialiser » le mot de passe était impossible sans tout
 * re-saisir, et un oubli = perte définitive. En v2 :
 *
 *   - une CLÉ DE DONNÉES (DEK) aléatoire de 256 bits chiffre les notes ;
 *   - cette DEK est « emballée » DEUX fois indépendamment :
 *       • par une clé dérivée du mot de passe maître (PBKDF2),
 *       • par une clé dérivée d'un CODE DE RÉCUPÉRATION aléatoire.
 *
 * Conséquence : on peut réinitialiser le mot de passe via le code de
 * récupération SANS jamais déchiffrer puis re-chiffrer les notes, et sans que le
 * serveur ne connaisse jamais ni la DEK ni le mot de passe. Le code de
 * récupération est généré côté client et seulement transmis (transitoirement)
 * pour être envoyé par email à son propriétaire.
 * ════════════════════════════════════════════════════════════════════════ */

interface WrappedKey {
  salt: string; // b64 — sel PBKDF2 propre à cet emballage
  iv: string; // b64
  ct: string; // b64 — DEK chiffrée
}

export interface VaultBlobV2 {
  v: 2;
  vault: { iv: string; ct: string }; // notes chiffrées par la DEK
  pw: WrappedKey; // DEK emballée par le mot de passe maître
  rec: WrappedKey; // DEK emballée par le code de récupération
}

export function isVaultV2(blob: string): boolean {
  try {
    const o = JSON.parse(blob) as { v?: unknown };
    return o?.v === 2;
  } catch {
    return false;
  }
}

// Alphabet sans caractères ambigus (0/O, 1/I/L). 32 symboles.
const RECOVERY_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Code de récupération lisible : 4 groupes de 5 (≈100 bits d'entropie). */
export function generateRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const chars = Array.from(bytes, (b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join("")).join("-");
}

/** Normalise un code saisi (retire tirets/espaces, majuscules) avant dérivation. */
export const canonicalRecoveryCode = (code: string) =>
  code.toUpperCase().replace(/[^0-9A-Z]/g, "");

async function importDek(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", buf(raw), "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function wrapKey(dek: Uint8Array, secret: string): Promise<WrappedKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const kek = await deriveKey(secret, salt);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: buf(iv) }, kek, buf(dek)),
  );
  return { salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
}

async function unwrapKey(w: WrappedKey, secret: string): Promise<Uint8Array> {
  const kek = await deriveKey(secret, fromB64(w.salt));
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: buf(fromB64(w.iv)) },
    kek,
    buf(fromB64(w.ct)),
  );
  return new Uint8Array(pt);
}

async function sealNotes(data: unknown, dekRaw: Uint8Array): Promise<{ iv: string; ct: string }> {
  const dek = await importDek(dekRaw);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: buf(iv) },
      dek,
      buf(enc.encode(JSON.stringify(data))),
    ),
  );
  return { iv: toB64(iv), ct: toB64(ct) };
}

async function openNotes<T>(vault: { iv: string; ct: string }, dekRaw: Uint8Array): Promise<T> {
  const dek = await importDek(dekRaw);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: buf(fromB64(vault.iv)) },
    dek,
    buf(fromB64(vault.ct)),
  );
  return JSON.parse(dec.decode(pt)) as T;
}

/**
 * Crée un coffre v2 : génère une DEK + un code de récupération, chiffre les
 * données et renvoie le blob, le code (à montrer/emailer UNE fois) et la DEK
 * (base64, gardée en mémoire pour les sauvegardes suivantes).
 */
export async function createVault<T>(
  data: T,
  password: string,
): Promise<{ blob: string; recoveryCode: string; dek: string }> {
  const dekRaw = crypto.getRandomValues(new Uint8Array(32));
  const recoveryCode = generateRecoveryCode();
  const blobObj: VaultBlobV2 = {
    v: 2,
    vault: await sealNotes(data, dekRaw),
    pw: await wrapKey(dekRaw, password),
    rec: await wrapKey(dekRaw, canonicalRecoveryCode(recoveryCode)),
  };
  return { blob: JSON.stringify(blobObj), recoveryCode, dek: toB64(dekRaw) };
}

/** Déverrouille avec le mot de passe maître. Lève si incorrect. */
export async function unlockVault<T>(
  blob: string,
  password: string,
): Promise<{ data: T; dek: string }> {
  const o = JSON.parse(blob) as VaultBlobV2;
  const dekRaw = await unwrapKey(o.pw, password);
  return { data: await openNotes<T>(o.vault, dekRaw), dek: toB64(dekRaw) };
}

/** Déverrouille avec le code de récupération (mot de passe oublié). */
export async function recoverVault<T>(
  blob: string,
  recoveryCode: string,
): Promise<{ data: T; dek: string }> {
  const o = JSON.parse(blob) as VaultBlobV2;
  const dekRaw = await unwrapKey(o.rec, canonicalRecoveryCode(recoveryCode));
  return { data: await openNotes<T>(o.vault, dekRaw), dek: toB64(dekRaw) };
}

/** Ré-enregistre les notes avec la DEK déjà en mémoire (emballages inchangés). */
export async function resaveVault<T>(blob: string, data: T, dekB64: string): Promise<string> {
  const o = JSON.parse(blob) as VaultBlobV2;
  o.vault = await sealNotes(data, fromB64(dekB64));
  return JSON.stringify(o);
}

/** Ré-emballe la DEK avec un nouveau mot de passe (change / reset). */
export async function rewrapPassword(
  blob: string,
  dekB64: string,
  newPassword: string,
): Promise<string> {
  const o = JSON.parse(blob) as VaultBlobV2;
  o.pw = await wrapKey(fromB64(dekB64), newPassword);
  return JSON.stringify(o);
}
