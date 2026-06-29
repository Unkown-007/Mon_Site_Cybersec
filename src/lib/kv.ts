/*
 * Client base de données minimal — Vercel KV / Upstash Redis via API REST.
 * Aucune dépendance (fetch only). Si les variables d'env ne sont pas là
 * (store non connecté), tout devient no-op : l'app continue de fonctionner,
 * sans persistance. Connecte un store Vercel KV pour activer la persistance.
 */

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvReady = Boolean(URL_ && TOKEN);

async function redis<T = unknown>(command: (string | number)[]): Promise<T | null> {
  if (!kvReady) return null;
  try {
    const res = await fetch(URL_!, {
      method: "POST",
      headers: {
        authorization: `Bearer ${TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { result?: T };
    return (j.result ?? null) as T | null;
  } catch {
    return null;
  }
}

export const kvGet = (key: string) => redis<string | null>(["GET", key]);
export const kvSet = (key: string, value: string) => redis(["SET", key, value]);
export const kvDel = (key: string) => redis(["DEL", key]);
export const kvSadd = (set: string, member: string) => redis(["SADD", set, member]);
export const kvSrem = (set: string, member: string) => redis(["SREM", set, member]);
export const kvSmembers = (set: string) => redis<string[]>(["SMEMBERS", set]);

// Compteurs atomiques — utilisés par le limiteur de débit (rate limiting).
export const kvIncr = (key: string) => redis<number>(["INCR", key]);
export const kvExpire = (key: string, seconds: number) => redis<number>(["EXPIRE", key, seconds]);
export const kvTtl = (key: string) => redis<number>(["TTL", key]);
