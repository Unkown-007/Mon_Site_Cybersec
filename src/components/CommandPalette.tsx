"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS, ADMIN_ITEM } from "@/lib/nav";
import { RESOURCES, WRITEUPS, EXTERNAL_TOOLS, SCRIPTS } from "@/data/mock";

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

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Catalogue global indexé une fois.
  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    out.push({
      label: "Ouvrir le terminal",
      hint: "Ctrl+~",
      kind: "Action",
      action: () => window.dispatchEvent(new Event("ux077:open-terminal")),
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
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items
      .filter((it) => (it.label + " " + it.hint).toLowerCase().includes(q))
      .slice(0, 40);
  }, [items, query]);

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
            style={{ borderColor: "rgba(123,92,240,0.5)", boxShadow: "0 0 50px -16px #7b5cf0" }}
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
                      <span className="font-mono text-sm text-ink truncate flex-1">{it.label}</span>
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
              <span className="ml-auto">{results.length} résultat(s)</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
