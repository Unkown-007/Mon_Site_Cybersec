import { NextResponse } from "next/server";

/*
 * Agrégateur de news cybersécurité en direct — flux RSS publics réels.
 * Exécuté côté serveur (pas de CORS), cache 15 min, repli par flux.
 */

export const revalidate = 900;

const FEEDS: { source: string; url: string }[] = [
  { source: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" },
  { source: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/" },
  { source: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
  { source: "Dark Reading", url: "https://www.darkreading.com/rss.xml" },
  { source: "SANS ISC", url: "https://isc.sans.edu/rssfeed.xml" },
];

interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string; // ISO
  ts: number;
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();

function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const b of blocks) {
    const title = b.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
    const link =
      b.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ??
      b.match(/<link[^>]*href="([^"]+)"/i)?.[1];
    const pub = b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1];
    if (!title || !link) continue;
    const ts = pub ? Date.parse(pub) : Date.now();
    items.push({
      title: decode(title),
      link: decode(link),
      source,
      date: isNaN(ts) ? new Date().toISOString() : new Date(ts).toISOString(),
      ts: isNaN(ts) ? Date.now() : ts,
    });
  }
  return items;
}

async function fetchFeed(source: string, url: string): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "UnknownX-077/0.1", Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate },
    });
    if (!res.ok) return [];
    return parseRss(await res.text(), source).slice(0, 12);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f.source, f.url)));
  const items = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 45);

  const sources = Array.from(new Set(items.map((i) => i.source)));
  return NextResponse.json({
    ok: items.length > 0,
    count: items.length,
    sources,
    items,
  });
}
