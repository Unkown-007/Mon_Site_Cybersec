import { NextResponse } from "next/server";
import { kvReady, kvIncr, kvExpire, kvTtl } from "@/lib/kv";

/*
 * Briques de sécurité serveur réutilisables :
 *   - clientIp        : IP réelle derrière le proxy Vercel
 *   - sameOrigin      : protection CSRF (l'Origin/Referer doit matcher l'hôte)
 *   - rateLimit       : limiteur de débit fenêtre fixe, adossé à Vercel KV
 * Conçues sans dépendance, compatibles runtime Node ET Edge.
 */

/** Extrait l'IP cliente depuis les en-têtes proxy (x-forwarded-for en tête). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Vrai si la requête provient bien de notre propre origine (anti-CSRF).
 * Un navigateur envoie toujours `Origin` sur les POST cross-site : si présent,
 * il DOIT correspondre à l'hôte. En l'absence d'Origin et de Referer (clients
 * non-navigateur, server-to-server), on laisse passer pour ne rien casser.
 */
export function sameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return true;
  const expected = host.toLowerCase();
  const check = (u: string | null): boolean | null => {
    if (!u) return null;
    try {
      return new URL(u).host.toLowerCase() === expected;
    } catch {
      return false;
    }
  };
  const byOrigin = check(req.headers.get("origin"));
  if (byOrigin !== null) return byOrigin;
  const byReferer = check(req.headers.get("referer"));
  if (byReferer !== null) return byReferer;
  return true;
}

/** Réponse 403 standard pour origine refusée (CSRF). */
export function forbiddenOrigin() {
  return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // secondes
}

/**
 * Limiteur de débit à fenêtre fixe (INCR + EXPIRE atomiques côté KV).
 * Sans store KV connecté, on n'enferme pas l'utilisateur (fail-open) : la
 * disponibilité prime, les autres défenses (délai anti-bruteforce, mots de
 * passe forts, sessions signées) restent actives.
 */
export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<RateResult> {
  if (!kvReady) return { ok: true, remaining: opts.limit, retryAfter: 0 };
  const k = `rl:${opts.key}`;
  const n = (await kvIncr(k)) ?? 1;
  if (n === 1) await kvExpire(k, opts.windowSec);
  if (n > opts.limit) {
    const ttl = (await kvTtl(k)) ?? opts.windowSec;
    return { ok: false, remaining: 0, retryAfter: ttl > 0 ? ttl : opts.windowSec };
  }
  return { ok: true, remaining: Math.max(0, opts.limit - n), retryAfter: 0 };
}

/** Réponse 429 standard avec en-tête Retry-After. */
export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: "Trop de requêtes — réessaie plus tard." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfter)) } },
  );
}
