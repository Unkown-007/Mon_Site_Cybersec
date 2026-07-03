"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { NAV_ITEMS, ADMIN_ITEM } from "@/lib/nav";
import { RESOURCES, WRITEUPS, EXTERNAL_TOOLS, SCRIPTS } from "@/data/mock";
import { usePerf } from "@/lib/perf";
import { useToast } from "@/components/Toast";

interface Item {
  label: string;
  hint: string;
  kind: "Nav" | "Ressource" | "Write-up" | "Outil" | "Action";
  href?: string; // interne (push) ou externe (http)
  action?: () => void;
}

const KIND_COLOR: Record<Item["kind"], string> = {
  Nav: "text-secondary border-secondary/40",
  Ressource: "text-primary border-primary/40",
  "Write-up": "text-warning border-warning/40",
  Outil: "text-success border-success/40",
  Action: "text-danger border-danger/40",
};

const RECENTS_KEY = "ux077:palette-recents";

export function CommandPalette() {
  const router = useRouter();
  const { lite, toggle } = usePerf();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Historique des commandes récentes (persisté).
  useEffect(() => {
    try {
      setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  // Catalogue global indexé.
  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    out.push({
      label: "Ouvrir le terminal",
      hint: "Ctrl+~",
      kind: "Action",
      action: () => window.dispatchEvent(new Event("ux077:open-terminal")),
    });
    out.push({
      label: lite ? "Mode lite : désactiver" : "Mode lite : activer",
      hint: "coupe/rallume les effets lourds",
      kind: "Action",
      action: toggle,
    });
    out.push({
      label: "Pluie matrix",
      hint: "easter egg — plein écran 10s",
      kind: "Action",
      action: () => window.dispatchEvent(new Event("ux077:matrix")),
    });
    out.push({
      label: "Copier l'URL de la page",
      hint: "presse-papiers",
      kind: "Action",
      action: () => {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => push("ok", "URL copiée dans le presse-papiers"))
          .catch(() => push("err", "Copie impossible"));
      },
    });
    [...NAV_ITEMS, ADMIN_ITEM].forEach((n) =>
      out.push({ label: n.label, hint: n.desc, kind: "Nav", href: n.href })
    );
    RESOURCES.forEach((r) =>
      out.push({ label: r.title, hint: `${r.domain} · ${r.type}`, kind: "Ressource", href: r.url })
    );
    WRITEUPS.forEach((w) =>
      out.push({ label: w.name, hint: `${w.platform} · ${w.difficulty}`, kind: "Write-up", href: `/writeups#${w.id}` })
    );
    EXTERNAL_TOOLS.forEach((t) =>
      out.push({ label: t.name, hint: `outil · ${t.phase}`, kind: "Outil", href: t.url })
    );
    SCRIPTS.forEach((s) =>
      out.push({ label: s.name, hint: `script · ${s.phase}`, kind: "Outil", href: "/tools" })
    );
    return out;
  }, [lite, toggle, push]);

  // Recherche floue : tolère fautes de frappe et mots partiels.
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "label", weight: 2 },
          { name: "hint", weight: 1 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
      }),
    [items]
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Récents d'abord, puis le reste du catalogue.
      const recent = recents
        .map((label) => items.find((it) => it.label === label))
        .filter((it): it is Item => Boolean(it));
      const rest = items.filter((it) => !recents.includes(it.label));
      return [...recent, ...rest].slice(0, 8);
    }
    return fuse.search(q, { limit: 40 }).map((r) => r.item);
  }, [items, fuse, query, recents]);

  // Ouverture Ctrl+K / Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => setSel(0), [query]);

  const exec = (it: Item) => {
    setOpen(false);
    // Mémorise la commande en tête des récents (dédupliquée, max 6).
    setRecents((prev) => {
      const next = [it.label, ...prev.filter((l) => l !== it.label)].slice(0, 6);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    if (it.action) it.action();
    else if (it.href?.startsWith("http")) window.open(it.href, "_blank", "noopener");
    else if (it.href) router.push(it.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter" && results[sel]) {
      e.preventDefault();
      exec(results[sel]);
    }
  };

  useEffect(() => {
    listRef.current?.children[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-start justify-center pt-[12vh] px-4 bg-base/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-xl card overflow-hidden"
            style={{ borderColor: "rgba(123,92,240,0.5)", filter: "drop-shadow(0 0 20px rgba(123,92,240,0.55))" }}
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
              <span className="font-mono text-sm text-secondary">{">"}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Rechercher une page, ressource, outil, write-up…"
                spellCheck={false}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none font-mono text-sm text-ink placeholder:text-muted"
                aria-label="Palette de commande"
              />
              <span className="label !text-muted hidden sm:inline">ESC</span>
            </div>

            <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center font-mono text-sm text-muted">
                  [ aucun résultat ]
                </li>
              ) : (
                results.map((it, i) => (
                  <li key={`${it.kind}-${it.label}-${i}`}>
                    <button
                      onMouseEnter={() => setSel(i)}
                      onClick={() => exec(it)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === sel ? "bg-primary/10" : ""
                      }`}
                    >
                      <span
                        className={`shrink-0 text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${KIND_COLOR[it.kind]}`}
                      >
                        {it.kind}
                      </span>
                      <span className="font-mono text-sm text-ink truncate flex-1">
                        {it.label}
                        {!query && recents.includes(it.label) && (
                          <span className="ml-2 text-[9px] uppercase tracking-[1px] text-muted">récent</span>
                        )}
                      </span>
                      <span className="font-mono text-[11px] text-muted truncate hidden sm:block max-w-[40%]">
                        {it.hint}
                      </span>
                      {it.href?.startsWith("http") && <span className="text-muted text-xs">↗</span>}
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="flex items-center gap-4 px-4 py-2 border-t border-line font-mono text-[10px] text-muted">
              <span>↑↓ naviguer</span>
              <span>↵ ouvrir</span>
              <span className="hidden sm:inline text-secondary/70">recherche floue</span>
              <span className="ml-auto">{results.length} résultat(s)</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
