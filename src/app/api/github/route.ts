import { NextResponse } from "next/server";

/*
 * Profil GitHub en direct depuis l'API publique GitHub.
 * Exécuté côté serveur (pas de CORS, quota plus large), avec cache 1 h.
 * Aucun token requis pour les données publiques.
 * Doc : https://docs.github.com/rest/users
 */

export const revalidate = 3600; // 1 h

const DEFAULT_USER = "Unkown-007";

interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface GhRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

export async function GET(request: Request) {
  const user = new URL(request.url).searchParams.get("user") || DEFAULT_USER;
  const headers: HeadersInit = {
    "User-Agent": "UnknownX-077/0.1",
    Accept: "application/vnd.github+json",
  };
  // Optionnel : si GITHUB_TOKEN est défini, on l'utilise pour relever le quota.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [uRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`, {
        headers,
        signal: controller.signal,
        next: { revalidate },
      }),
      fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`, {
        headers,
        signal: controller.signal,
        next: { revalidate },
      }),
    ]);
    clearTimeout(timeout);

    if (!uRes.ok) throw new Error(`GitHub ${uRes.status}`);
    const u = (await uRes.json()) as GhUser;
    const repos = (rRes.ok ? ((await rRes.json()) as GhRepo[]) : [])
      .filter((r) => !r.fork && !r.archived)
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          b.pushed_at.localeCompare(a.pushed_at),
      )
      .slice(0, 8)
      .map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        pushedAt: r.pushed_at?.slice(0, 10) ?? "",
      }));

    return NextResponse.json({
      source: "github",
      profile: {
        login: u.login,
        name: u.name,
        avatar: u.avatar_url,
        url: u.html_url,
        bio: u.bio,
        company: u.company,
        location: u.location,
        blog: u.blog || null,
        publicRepos: u.public_repos,
        followers: u.followers,
        following: u.following,
      },
      repos,
    });
  } catch (err) {
    return NextResponse.json({
      source: "error",
      reason: err instanceof Error ? err.message : "inconnu",
      profile: null,
      repos: [],
    });
  }
}
