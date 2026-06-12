import { NextResponse } from "next/server";
import { countryCoords } from "@/lib/country-coords";

/*
 * Threat intel réel et géolocalisé.
 * Source primaire : SANS ISC / DShield — top des IP sources d'attaques du jour
 *   https://isc.sans.edu/api/sources/attacks/100/today?json
 * Géolocalisation : ip-api.com (batch, gratuit, sans clé, 1 req/100 IP).
 * Repli : Feodo Tracker (abuse.ch) C2 botnets. Repli final : simulation client.
 * Exécuté côté serveur (pas de CORS), cache 10 min.
 */

export const revalidate = 600;

export interface ThreatNode {
  ip: string;
  label: string; // type / famille
  country: string; // ISO-2
  info: string; // détail (cibles, ASN…)
  lng: number;
  lat: number;
}

const UA = "UnknownX-077/0.1 (threat-map research)";

async function fetchJSON(url: string, opts: RequestInit = {}, ms = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "application/json", ...(opts.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

const cleanIp = (ip: string) =>
  ip
    .split(".")
    .map((o) => String(parseInt(o, 10)))
    .join(".");

/* ── Source 1 : DShield top attackers + ip-api geoloc ── */
async function fromDShield(): Promise<ThreatNode[]> {
  const data = (await fetchJSON(
    "https://isc.sans.edu/api/sources/attacks/100/today?json"
  )) as { ip: string; attacks: number; count: number }[];

  const top = data
    .filter((d) => d.ip)
    .slice(0, 90)
    .map((d) => ({ ip: cleanIp(d.ip), attacks: d.attacks ?? 0 }));
  if (top.length === 0) throw new Error("DShield vide");

  // ip-api.com batch (HTTP, gratuit) — 1 requête pour tout le lot.
  const geo = (await fetchJSON(
    "http://ip-api.com/batch?fields=status,countryCode,lat,lon,query,isp",
    { method: "POST", body: JSON.stringify(top.map((t) => t.ip)) },
    9000
  )) as {
    status: string;
    countryCode?: string;
    lat?: number;
    lon?: number;
    query: string;
    isp?: string;
  }[];

  const byIp = new Map(top.map((t) => [t.ip, t.attacks]));
  const nodes: ThreatNode[] = [];
  for (const g of geo) {
    if (g.status !== "success" || g.lat == null || g.lon == null) continue;
    nodes.push({
      ip: g.query,
      label: "Source d'attaque",
      country: (g.countryCode ?? "??").toUpperCase(),
      info: `${byIp.get(g.query) ?? "?"} cibles · ${g.isp ?? "n/a"}`,
      lng: g.lon,
      lat: g.lat,
    });
  }
  if (nodes.length === 0) throw new Error("géoloc vide");
  return nodes;
}

/* ── Source 2 (repli) : Feodo Tracker C2 ── */
async function fromFeodo(): Promise<ThreatNode[]> {
  const data = (await fetchJSON(
    "https://feodotracker.abuse.ch/downloads/ipblocklist.json"
  )) as { ip_address: string; country?: string; as_name?: string; malware?: string }[];

  const nodes: ThreatNode[] = [];
  for (const e of data) {
    const c = countryCoords(e.country ?? "");
    if (!c) continue;
    nodes.push({
      ip: e.ip_address,
      label: e.malware ?? "C2",
      country: (e.country ?? "??").toUpperCase(),
      info: e.as_name ?? "C2 botnet",
      lng: c[0] + (Math.random() - 0.5) * 6,
      lat: c[1] + (Math.random() - 0.5) * 6,
    });
  }
  if (nodes.length === 0) throw new Error("Feodo vide");
  return nodes;
}

export async function GET() {
  try {
    const nodes = await fromDShield();
    return NextResponse.json({ source: "dshield", count: nodes.length, nodes });
  } catch {
    try {
      const nodes = await fromFeodo();
      return NextResponse.json({ source: "feodo", count: nodes.length, nodes });
    } catch (err) {
      return NextResponse.json({
        source: "fallback",
        reason: err instanceof Error ? err.message : "inconnu",
        count: 0,
        nodes: [],
      });
    }
  }
}
