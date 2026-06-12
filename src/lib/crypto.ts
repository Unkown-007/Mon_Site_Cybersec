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
