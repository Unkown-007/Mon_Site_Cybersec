/*
 * Génération de secrets + estimation de robustesse — côté client, basé sur
 * crypto.getRandomValues (tirage non biaisé par rejet). Utilisé par le coffre
 * (Vault) et réutilisable ailleurs (toolkit).
 */

export interface GenOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};
const AMBIGUOUS = new Set("O0oIl1|`'\"{}[]()/\\".split(""));

/** Entier aléatoire dans [0, max) sans biais (rejection sampling). */
function randInt(max: number): number {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

export function buildPool(o: GenOptions): string {
  let pool = "";
  if (o.lower) pool += SETS.lower;
  if (o.upper) pool += SETS.upper;
  if (o.digits) pool += SETS.digits;
  if (o.symbols) pool += SETS.symbols;
  if (o.avoidAmbiguous) {
    pool = pool
      .split("")
      .filter((c) => !AMBIGUOUS.has(c))
      .join("");
  }
  return pool;
}

export function generatePassword(o: GenOptions): string {
  const pool = buildPool(o);
  if (!pool) return "";
  const len = Math.max(4, Math.min(o.length, 128));
  let out = "";
  for (let i = 0; i < len; i++) out += pool[randInt(pool.length)];
  return out;
}

// Liste compacte de mots simples (EFF-like réduite) pour les phrases de passe.
const WORDS =
  "acier,orbite,nexus,plasma,vortex,cipher,matrix,neon,proxy,kernel,vector,zenith,pulse,relay,quartz,flux,prism,onyx,cobalt,raven,ember,glitch,phantom,silex,turbo,delta,sigma,omega,helix,quasar,photon,binary,daemon,shadow,cyber,vertex,radon,ozone,echo,nova,argon,karma,lunar,solar,titan,viper,wraith,zephyr,cipher,gamma".split(
    ",",
  );

export function generatePassphrase(
  words: number,
  sep: string,
  capitalize: boolean,
  withNumber: boolean,
): string {
  const n = Math.max(2, Math.min(words, 10));
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    let w = WORDS[randInt(WORDS.length)];
    if (capitalize) w = w[0].toUpperCase() + w.slice(1);
    parts.push(w);
  }
  let out = parts.join(sep);
  if (withNumber) out += sep + randInt(100);
  return out;
}

export interface Strength {
  bits: number;
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

/** Estimation d'entropie : longueur × log2(taille du pool détecté). */
export function estimateStrength(pw: string): Strength {
  if (!pw) return { bits: 0, score: 0, label: "—" };
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 24;
  // pénalise les répétitions / caractères uniques faibles
  const unique = new Set(pw).size;
  const effLen = Math.min(pw.length, unique + (pw.length - unique) * 0.5);
  const bits = Math.round(effLen * Math.log2(pool || 1));
  let score: Strength["score"] = 0;
  if (bits >= 100) score = 4;
  else if (bits >= 75) score = 3;
  else if (bits >= 55) score = 2;
  else if (bits >= 36) score = 1;
  const label = ["très faible", "faible", "correct", "solide", "excellent"][score];
  return { bits, score, label };
}
