"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { InlineAdmin } from "@/components/InlineAdmin";
import { useToast } from "@/components/Toast";
import {
  RESOURCES,
  DOMAINS,
  RESOURCE_TYPES,
  type Domain,
  type ResourceType,
  type Resource,
} from "@/data/mock";

const DOMAIN_COLOR: Record<Domain, string> = {
  Web: "text-primary border-primary/40",
  Réseau: "text-secondary border-secondary/40",
  Reverse: "text-warning border-warning/40",
  Forensics: "text-success border-success/40",
  OSINT: "text-danger border-danger/40",
  Crypto: "text-secondary border-secondary/40",
  Mobile: "text-primary border-primary/40",
  Cloud: "text-warning border-warning/40",
};

function toMarkdown(r: Resource): string {
  return `# ${r.title}

- **Domaine :** ${r.domain}
- **Type :** ${r.type}
- **Lien :** ${r.url}
- **Ajouté le :** ${r.date}
- **Tags :** ${r.tags.join(", ")}

${r.desc}
`;
}

export default function ResourcesPage() {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<Domain | null>(null);
  const [type, setType] = useState<ResourceType | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (domain && r.domain !== domain) return false;
      if (type && r.type !== type) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, domain, type]);

  const exportMd = (r: Resource) => {
    const blob = new Blob([toMarkdown(r)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    push("ok", `${r.id}.md exporté.`);
  };

  const reset = () => {
    setDomain(null);
    setType(null);
    setQuery("");
  };

  return (
    <div>
      <PageHeader
        code="RES // BASE DE RESSOURCES"
        title="Base de ressources"
        desc="Bibliothèque de connaissances : cheatsheets, notes, liens et outils — indexés et recherchables."
        right={
          <div className="flex items-center gap-1 card p-1">
            <ViewBtn active={view === "grid"} onClick={() => setView("grid")} label="Grille">
              ▦
            </ViewBtn>
            <ViewBtn active={view === "list"} onClick={() => setView("list")} label="Liste">
              ☰
            </ViewBtn>
          </div>
        }
      />

      <InlineAdmin
        collection="resources"
        heading="⊕ RESSOURCES AJOUTÉES"
        fields={[
          { name: "title", label: "Titre", required: true },
          { name: "url", label: "URL (https://…)" },
          { name: "category", label: "Domaine (Web, Réseau…)" },
          { name: "tags", label: "Tags (séparés par des virgules)" },
          { name: "description", label: "Description / notes", kind: "textarea" },
        ]}
      />

      {/* Recherche terminal */}
      <div className="card flex items-center gap-3 px-4 py-3 mb-6">
        <span className="font-mono text-sm text-secondary shrink-0">// SEARCH</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="titre, description, tag…"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none font-mono text-sm text-ink placeholder:text-muted"
          aria-label="Rechercher une ressource"
        />
        {query ? null : <span className="cursor text-secondary" aria-hidden="true" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Filtres latéraux */}
        <aside className="space-y-6">
          <FilterGroup
            label="Domaine"
            options={DOMAINS}
            active={domain}
            onPick={(d) => setDomain(domain === d ? null : (d as Domain))}
          />
          <FilterGroup
            label="Type"
            options={RESOURCE_TYPES}
            active={type}
            onPick={(t) => setType(type === t ? null : (t as ResourceType))}
          />
          {(domain || type || query) && (
            <button onClick={reset} className="btn btn-ghost w-full justify-center !py-2 text-xs">
              Réinitialiser
            </button>
          )}
        </aside>

        {/* Résultats */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="label !text-muted">{filtered.length} résultat(s)</span>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-8 text-center font-mono text-sm text-muted">
              [ aucun résultat ] — ajuste la recherche ou les filtres.
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-3"
              }
            >
              {filtered.map((r) => (
                <article
                  key={r.id}
                  className={`card p-4 group flex flex-col ${view === "list" ? "sm:flex-row sm:items-center sm:gap-4" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-ink group-hover:text-secondary transition-colors truncate"
                      >
                        {r.title} ↗
                      </a>
                      <span
                        className={`shrink-0 text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${DOMAIN_COLOR[r.domain]}`}
                      >
                        {r.domain}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{r.desc}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {r.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono text-muted bg-base/60 border border-line px-1.5 py-0.5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-between gap-2 mt-3 pt-3 border-t border-line ${view === "list" ? "sm:mt-0 sm:pt-0 sm:border-t-0 sm:flex-col sm:items-end sm:w-40 sm:shrink-0" : ""}`}
                  >
                    <span className="text-[10px] font-mono text-muted uppercase tracking-[1px]">
                      {r.type} · {r.date}
                    </span>
                    <button
                      onClick={() => exportMd(r)}
                      className="text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-primary transition-colors"
                      aria-label={`Exporter ${r.title} en Markdown`}
                    >
                      ⬇ .md
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Vue ${label}`}
      aria-pressed={active}
      className={`px-2.5 py-1 font-mono text-sm transition-colors ${
        active ? "text-secondary bg-secondary/10" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  label,
  options,
  active,
  onPick,
}: {
  label: string;
  options: readonly string[];
  active: string | null;
  onPick: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="label mb-3">{label}</h2>
      <ul className="flex flex-col gap-1">
        {options.map((opt) => (
          <li key={opt}>
            <button
              onClick={() => onPick(opt)}
              className={`w-full text-left px-2 py-1.5 font-mono text-xs uppercase tracking-[1px] border-l-2 transition-colors ${
                active === opt
                  ? "border-secondary text-secondary bg-secondary/5"
                  : "border-transparent text-muted hover:text-ink hover:border-line-strong"
              }`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
