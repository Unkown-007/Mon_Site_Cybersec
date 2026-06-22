"use client";

import { useEffect, useState } from "react";
import { StatusDot } from "@/components/StatusDot";
import { Panel, Button } from "@/components/ui";

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
        <span className="text-label text-muted">profils externes</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* GitHub */}
        <Panel>
          <div className="flex items-center justify-between mb-4">
            <span className="label">// GITHUB</span>
            <StatusDot
              state={loading ? "idle" : ok ? "online" : "warn"}
              label={loading ? "sync…" : ok ? "connecté" : "injoignable"}
            />
          </div>

          {loading ? (
            <p className="font-mono text-body-sm text-muted">
              récupération du profil<span className="cursor" aria-hidden="true" />
            </p>
          ) : !ok ? (
            <p className="font-mono text-body-sm text-muted">
              GitHub injoignable.{" "}
              <a
                href="https://github.com/Unkown-007"
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-sm text-muted underline-offset-2 transition-colors duration-fast ease-out-soft hover:text-secondary"
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
                className="focus-ring group flex items-center gap-3 rounded-sm"
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
                  <div className="text-body-sm text-ink transition-colors duration-fast ease-out-soft group-hover:text-primary">
                    {p.name ?? p.login}
                  </div>
                  <div className="truncate font-mono text-label text-muted">
                    @{p.login}
                    {p.company ? ` · ${p.company}` : ""}
                    {p.location ? ` · ${p.location}` : ""}
                  </div>
                </div>
              </a>

              <div className="mt-4 grid grid-cols-3 gap-px border border-line-strong bg-line-strong text-center">
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
                        className="focus-ring block rounded-md border border-line bg-base p-3 transition-[transform,border-color] duration-base ease-out-soft hover:-translate-y-0.5 hover:border-line-strong"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-body-sm text-ink">{r.name}</span>
                          <span className="shrink-0 font-mono text-label text-muted">
                            {r.language ?? "—"}
                            {r.stars > 0 ? ` · ★ ${r.stars}` : ""}
                          </span>
                        </div>
                        {r.description && (
                          <p className="mt-1 line-clamp-2 text-body-sm text-muted">
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
        </Panel>

        {/* TryHackMe */}
        <Panel>
          <div className="flex items-center justify-between mb-4">
            <span className="label">// TRYHACKME</span>
            <StatusDot state="idle" label="lien" />
          </div>
          <p className="font-mono text-body-sm text-muted">
            TryHackMe ne propose pas d&apos;API publique synchronisable
            (protection anti-bot). Profil consultable directement :
          </p>
          <Button
            variant="ghost"
            href={THM_PROFILE}
            target="_blank"
            rel="noreferrer"
            className="mt-4 w-full"
          >
            Ouvrir le profil TryHackMe →
          </Button>
          <a
            href={THM_PROFILE}
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-3 rounded-sm text-center font-mono text-label text-muted transition-colors duration-fast ease-out-soft hover:text-secondary"
          >
            tryhackme.com/p/ThalesX01
          </a>
        </Panel>
      </div>
    </section>
  );
}

function Mini({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-surface px-2 py-3">
      <div className="font-display text-h3 font-bold tabular-nums text-ink-strong">{value}</div>
      <div className="label mt-0.5 justify-center">{label}</div>
    </div>
  );
}
