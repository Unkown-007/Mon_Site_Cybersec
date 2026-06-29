import { NextResponse } from "next/server";

/*
 * Proxy + cache du catalogue CISA KEV (Known Exploited Vulnerabilities).
 * Exécuté côté serveur (pas de CORS). On ne renvoie que les identifiants CVE
 * (+ flag ransomware) pour garder une charge utile légère côté client.
 * Cache 6 h, timeout 8 s, repli gracieux (liste vide) si la source tombe.
 * Source : https://www.cisa.gov/known-exploited-vulnerabilities-catalog
 */

export const revalidate = 21600; // 6 h

const KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

interface KevEntry {
  cveID: string;
  knownRansomwareCampaignUse?: string;
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(KEV_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "UnknownX-077/0.1" },
      next: { revalidate },
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`KEV ${res.status}`);
    const data = (await res.json()) as { vulnerabilities?: KevEntry[] };
    const entries = data.vulnerabilities ?? [];

    const ids = entries.map((e) => e.cveID);
    const ransomware = entries
      .filter((e) => e.knownRansomwareCampaignUse === "Known")
      .map((e) => e.cveID);

    return NextResponse.json({ source: "kev", count: ids.length, ids, ransomware });
  } catch (err) {
    return NextResponse.json({
      source: "error",
      reason: err instanceof Error ? err.message : "inconnu",
      count: 0,
      ids: [],
      ransomware: [],
    });
  }
}
