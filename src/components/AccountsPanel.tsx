"use client";

import { useEffect, useState } from "react";
import { StatusDot } from "@/components/StatusDot";

/*
 * Panneau "Comptes" — données GitHub réelles (via /api/github) + lien TryHackMe.
 * TryHackMe n'expose pas d'API publique libre (anti-bot), d'où un simple lien
 * vers le profil plutôt qu'une synchro automatique.
 */

const THM_PROFILE = "https://tryhackme.com/p/ThalesX01";

interface Repo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
}

interface Profile {
  login: string;
  name: string | null;
  avatar: string;
  url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  publicRepos: number;
  followers: number;
  following: number;
}

interface GithubData {
  source: string;
  profile: Profile | null;
  repos: Repo[];
}

export function AccountsPanel() {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => r.json())
      .then((d: GithubData) => setData(d))
      .catch(() => setData({ source: "error", profile: null, repos: [] }))
      .finally(() => setLoading(false));
  }, []);

  const p = data?.profile ?? null;
  const ok = !!p;

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <h2 className="label">COMPTES</h2>
        <span className="font-mono text-[11px] text-muted">profils externes</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* GitHub */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="label !text-secondary">// GITHUB</span>
            <StatusDot
              state={loading ? "idle" : ok ? "online" : "warn"}
              label={loading ? "sync…" : ok ? "connecté" : "injoignable"}
            />
          </div>

          {loading ? (
            <p className="font-mono text-xs text-muted">
              récupération du profil<span className="cursor" aria-hidden="true" />
            </p>
          ) : !ok ? (
            <p className="font-mono text-xs text-muted">
              GitHub injoignable.{" "}
              <a
                href="https://github.com/Unkown-007"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-primary"
              >
                Voir le profil →
              </a>
            </p>
          ) : (
            <>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar}
                  alt={p.login}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full border border-line-strong"
                />
                <div className="min-w-0">
                  <div className="text-ink text-sm group-hover:text-primary transition-colors">
                    {p.name ?? p.login}
                  </div>
                  <div className="font-mono text-[11px] text-muted truncate">
                    @{p.login}
                    {p.company ? ` · ${p.company}` : ""}
                    {p.location ? ` · ${p.location}` : ""}
                  </div>
                </div>
              </a>

              <div className="mt-4 grid grid-cols-3 gap-px bg-line-strong border border-line-strong text-center">
                <Mini value={p.publicRepos} label="repos" />
                <Mini value={p.followers} label="followers" />
                <Mini value={p.following} label="following" />
              </div>

              {data!.repos.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {data!.repos.map((r) => (
                    <li key={r.name}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="card block p-3 hover:border-secondary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-ink truncate">{r.name}</span>
                          <span className="font-mono text-[10px] text-muted shrink-0">
                            {r.language ?? "—"}
                            {r.stars > 0 ? ` · ★ ${r.stars}` : ""}
                          </span>
                        </div>
                        {r.description && (
                          <p className="mt-1 text-xs text-muted leading-snug line-clamp-2">
                            {r.description}
                          </p>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* TryHackMe */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="label !text-secondary">// TRYHACKME</span>
            <StatusDot state="idle" label="lien" />
          </div>
          <p className="font-mono text-xs text-muted leading-relaxed flex-1">
            TryHackMe ne propose pas d&apos;API publique synchronisable
            (protection anti-bot). Profil consultable directement :
          </p>
          <a
            href={THM_PROFILE}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost w-full justify-center mt-4"
          >
            Ouvrir le profil TryHackMe →
          </a>
          <a
            href="https://tryhackme.com/p/ThalesX01"
            target="_blank"
            rel="noreferrer"
            className="mt-3 font-mono text-[11px] text-muted text-center hover:text-secondary"
          >
            tryhackme.com/p/ThalesX01
          </a>
        </div>
      </div>
    </section>
  );
}

function Mini({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-surface px-2 py-3">
      <div className="font-display font-bold text-lg tabular-nums text-secondary">{value}</div>
      <div className="label mt-0.5 justify-center !text-[9px]">{label}</div>
    </div>
  );
}
