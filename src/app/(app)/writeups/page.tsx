"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WRITEUPS, type Writeup } from "@/data/mock";

const DIFF_COLOR: Record<Writeup["difficulty"], string> = {
  Easy: "text-success border-success/40",
  Medium: "text-warning border-warning/40",
  Hard: "text-danger border-danger/40",
  Insane: "text-primary border-primary/50",
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export default function WriteupsPage() {
  const platforms = useMemo(() => uniq(WRITEUPS.map((w) => w.platform)), []);
  const categories = useMemo(() => uniq(WRITEUPS.map((w) => w.category)), []);
  const difficulties: Writeup["difficulty"][] = ["Easy", "Medium", "Hard", "Insane"];

  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WRITEUPS.filter((w) => {
      if (platform && w.platform !== platform) return false;
      if (difficulty && w.difficulty !== difficulty) return false;
      if (category && w.category !== category) return false;
      if (status && w.status !== status) return false;
      if (!q) return true;
      return (
        w.name.toLowerCase().includes(q) ||
        w.summary.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, platform, difficulty, category, status]);

  const reset = () => {
    setPlatform(null);
    setDifficulty(null);
    setCategory(null);
    setStatus(null);
    setQuery("");
  };

  const active = platform || difficulty || category || status || query;

  return (
    <div>
      <PageHeader
        code="WUP // WRITE-UPS CTF"
        title="Write-ups CTF"
        desc="Comptes-rendus de machines et challenges — HackTheBox, TryHackMe, Root-Me, FCSC."
      />

      {/* Recherche */}
      <div className="card flex items-center gap-3 px-4 py-3 mb-5">
        <span className="font-mono text-sm text-secondary shrink-0">// SEARCH</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="machine, tag, technique…"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none font-mono text-sm text-ink placeholder:text-muted"
          aria-label="Rechercher un write-up"
        />
      </div>

      {/* Filtres */}
      <div className="space-y-3 mb-6">
        <FilterRow label="Plateforme" options={platforms} active={platform} onPick={setPlatform} />
        <FilterRow label="Difficulté" options={difficulties} active={difficulty} onPick={setDifficulty} />
        <FilterRow label="Catégorie" options={categories} active={category} onPick={setCategory} />
        <FilterRow label="Statut" options={["résolu", "en cours"]} active={status} onPick={setStatus} />
        {active && (
          <button onClick={reset} className="btn btn-ghost !py-1.5 !px-3 text-xs">
            Réinitialiser les filtres
          </button>
        )}
      </div>

      <span className="label !text-muted block mb-4">{filtered.length} write-up(s)</span>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center font-mono text-sm text-muted">
          [ aucun write-up ] — ajuste la recherche ou les filtres.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((w) => {
            const isOpen = open === w.id;
            return (
              <li key={w.id} id={w.id} className="card overflow-hidden scroll-mt-20">
                <button
                  onClick={() => setOpen(isOpen ? null : w.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors"
                >
                  <span className="font-mono text-muted text-xs shrink-0">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="font-mono text-sm text-ink flex-1 min-w-0 truncate">
                    {w.name}
                  </span>
                  {w.status === "en cours" && (
                    <span className="text-[10px] font-mono uppercase tracking-[1px] text-warning border border-warning/40 px-1.5 py-0.5">
                      WIP
                    </span>
                  )}
                  <span className="hidden sm:inline font-mono text-xs text-muted">
                    {w.platform}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${DIFF_COLOR[w.difficulty]}`}
                  >
                    {w.difficulty}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-line animate-fade-up">
                    <div className="grid sm:grid-cols-[1fr_180px] gap-4">
                      <div>
                        <p className="text-sm text-ink/90 leading-relaxed">{w.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {w.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-mono text-secondary bg-secondary/5 border border-secondary/30 px-1.5 py-0.5"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <dl className="font-mono text-xs space-y-1.5 text-muted">
                        <Info k="Plateforme" v={w.platform} />
                        <Info k="Catégorie" v={w.category} />
                        <Info k="Difficulté" v={w.difficulty} />
                        <Info k="Statut" v={w.status} />
                        <Info k="Date" v={w.date} />
                      </dl>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  active,
  onPick,
}: {
  label: string;
  options: readonly string[];
  active: string | null;
  onPick: (v: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="label !text-muted w-24 shrink-0">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onPick(active === opt ? null : opt)}
          aria-pressed={active === opt}
          className={`px-2.5 py-1 font-mono text-xs uppercase tracking-[1px] border transition-colors ${
            active === opt
              ? "border-secondary text-secondary bg-secondary/10"
              : "border-line-strong text-muted hover:text-ink hover:border-secondary/40"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line pb-1">
      <dt className="text-muted uppercase tracking-[1px]">{k}</dt>
      <dd className="text-ink text-right">{v}</dd>
    </div>
  );
}
