import { NextResponse } from "next/server";
import { CVES } from "@/data/mock";

/*
 * Flux CVE en direct depuis l'API NVD (NIST).
 * Exécuté côté serveur (pas de CORS), avec cache 30 min et repli sur les
 * données locales si l'API NVD est indisponible ou limite le débit.
 * Doc : https://nvd.nist.gov/developers/vulnerabilities
 */

export const revalidate = 1800; // 30 min

interface NvdCveItem {
  cve: {
    id: string;
    published: string;
    sourceIdentifier?: string;
    descriptions: { lang: string; value: string }[];
    metrics?: {
      cvssMetricV31?: { cvssData: { baseScore: number }; baseSeverity: string }[];
      cvssMetricV30?: { cvssData: { baseScore: number }; baseSeverity: string }[];
      cvssMetricV2?: { cvssData: { baseScore: number }; baseSeverity?: string }[];
    };
    configurations?: {
      nodes: { cpeMatch: { criteria: string }[] }[];
    }[];
  };
}

interface NormalizedCve {
  id: string;
  score: number;
  severity: string;
  vendor: string;
  summary: string;
  published: string;
}

function normalize(item: NvdCveItem): NormalizedCve {
  const { cve } = item;
  const m =
    cve.metrics?.cvssMetricV31?.[0] ??
    cve.metrics?.cvssMetricV30?.[0] ??
    cve.metrics?.cvssMetricV2?.[0];
  const score = m?.cvssData.baseScore ?? 0;
  const severity =
    (m as { baseSeverity?: string })?.baseSeverity ??
    (score >= 9 ? "CRITICAL" : score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW");

  // Vendor extrait du premier CPE : cpe:2.3:a:<vendor>:<product>:...
  let vendor = "n/a";
  const criteria = cve.configurations?.[0]?.nodes?.[0]?.cpeMatch?.[0]?.criteria;
  if (criteria) {
    const parts = criteria.split(":");
    if (parts[3]) vendor = parts[3].replace(/_/g, " ");
  }

  const summary =
    cve.descriptions.find((d) => d.lang === "en")?.value ??
    cve.descriptions[0]?.value ??
    "—";

  return {
    id: cve.id,
    score,
    severity,
    vendor,
    summary: summary.length > 220 ? summary.slice(0, 217) + "…" : summary,
    published: cve.published?.slice(0, 10) ?? "",
  };
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  let url: string;
  if (id) {
    // Lookup d'un CVE précis (utilisé par la commande terminal `cve`).
    if (!/^CVE-\d{4}-\d{4,}$/i.test(id)) {
      return NextResponse.json({ source: "error", reason: "ID CVE invalide", items: [] });
    }
    url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${id.toUpperCase()}`;
  } else {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
    const params = new URLSearchParams({
      pubStartDate: start.toISOString(),
      pubEndDate: end.toISOString(),
      resultsPerPage: "40",
    });
    url = `https://services.nvd.nist.gov/rest/json/cves/2.0?${params}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "UnknownX-077/0.1" },
      next: { revalidate },
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`NVD ${res.status}`);
    const data = (await res.json()) as { vulnerabilities?: NvdCveItem[] };
    const items = (data.vulnerabilities ?? [])
      .map(normalize)
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score || b.published.localeCompare(a.published));

    if (items.length === 0) {
      if (id) return NextResponse.json({ source: "notfound", items: [] });
      throw new Error("flux vide");
    }
    return NextResponse.json({ source: "nvd", items });
  } catch (err) {
    // Lookup ciblé : pas de repli générique, on signale l'échec.
    if (id) {
      return NextResponse.json({
        source: "error",
        reason: err instanceof Error ? err.message : "inconnu",
        items: [],
      });
    }
    // Flux : repli sur les données locales pour rester fonctionnel hors-ligne.
    const fallback: NormalizedCve[] = CVES.map((c) => ({
      id: c.id,
      score: c.score,
      severity: c.severity,
      vendor: c.vendor,
      summary: c.summary,
      published: c.published,
    }));
    return NextResponse.json({
      source: "fallback",
      reason: err instanceof Error ? err.message : "inconnu",
      items: fallback,
    });
  }
}
