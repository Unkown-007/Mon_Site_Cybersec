import { NextResponse } from "next/server";

/*
 * Proxy + cache de l'agenda CTFtime (prochains CTF publics, 45 jours).
 * Côté serveur (pas de CORS), cache 1 h, timeout 8 s, repli gracieux
 * (liste vide + source "error") si l'API ne répond pas.
 * Source : https://ctftime.org/api/
 */

export const revalidate = 3600;

interface CtftimeEvent {
  id: number;
  title: string;
  url?: string;
  ctftime_url: string;
  start: string;
  finish: string;
  format?: string;
  weight?: number;
  onsite?: boolean;
  location?: string;
  participants?: number;
  restrictions?: string;
  organizers?: { name: string }[];
}

export interface CtfEvent {
  id: number;
  title: string;
  url: string;
  ctftimeUrl: string;
  start: string;
  finish: string;
  format: string;
  weight: number;
  onsite: boolean;
  location: string;
  participants: number;
  restrictions: string;
  organizer: string;
}

export async function GET() {
  const now = Math.floor(Date.now() / 1000);
  // On part de 3 jours en arrière pour inclure les CTF déjà en cours.
  const params = new URLSearchParams({
    limit: "40",
    start: String(now - 3 * 86400),
    finish: String(now + 45 * 86400),
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://ctftime.org/api/v1/events/?${params}`, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (UnknownX-077 agenda)" },
      next: { revalidate },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`CTFtime ${res.status}`);

    const raw = (await res.json()) as CtftimeEvent[];
    const items: CtfEvent[] = raw
      .filter((e) => new Date(e.finish).getTime() > Date.now())
      .map((e) => ({
        id: e.id,
        title: e.title,
        url: e.url || e.ctftime_url,
        ctftimeUrl: e.ctftime_url,
        start: e.start,
        finish: e.finish,
        format: e.format ?? "",
        weight: e.weight ?? 0,
        onsite: Boolean(e.onsite),
        location: e.location ?? "",
        participants: e.participants ?? 0,
        restrictions: e.restrictions ?? "Open",
        organizer: e.organizers?.[0]?.name ?? "",
      }))
      .sort((a, b) => a.start.localeCompare(b.start));

    return NextResponse.json({ source: "ctftime", items });
  } catch (err) {
    return NextResponse.json({
      source: "error",
      reason: err instanceof Error ? err.message : "inconnu",
      items: [],
    });
  }
}
