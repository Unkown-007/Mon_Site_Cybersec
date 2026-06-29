import { NextResponse } from "next/server";

/*
 * Proxy + cache des scores EPSS (Exploit Prediction Scoring System, FIRST.org).
 * EPSS = probabilité d'exploitation dans les 30 jours. Complète le CVSS.
 * Entrée : ?cve=CVE-xxxx-yyyy,CVE-... (max 100, validés). Cache 1 h, timeout 8 s,
 * repli gracieux (scores vides) si la source tombe.
 * Doc : https://www.first.org/epss/api
 */

export const revalidate = 3600; // 1 h

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("cve");
  if (!raw) return NextResponse.json({ source: "error", scores: {} });

  const ids = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^CVE-\d{4}-\d{4,}$/.test(s))
    .slice(0, 100);

  if (ids.length === 0) return NextResponse.json({ source: "error", scores: {} });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.first.org/data/v1/epss?cve=${ids.join(",")}`, {
      signal: controller.signal,
      headers: { "User-Agent": "UnknownX-077/0.1" },
      next: { revalidate },
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`EPSS ${res.status}`);
    const data = (await res.json()) as {
      data?: { cve: string; epss: string; percentile: string }[];
    };

    const scores: Record<string, { epss: number; percentile: number }> = {};
    for (const d of data.data ?? []) {
      scores[d.cve] = { epss: Number(d.epss), percentile: Number(d.percentile) };
    }
    return NextResponse.json({ source: "epss", scores });
  } catch (err) {
    return NextResponse.json({
      source: "error",
      reason: err instanceof Error ? err.message : "inconnu",
      scores: {},
    });
  }
}
