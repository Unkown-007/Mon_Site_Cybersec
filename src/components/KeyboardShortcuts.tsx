"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_GROUPS, NAV_ITEMS, navItem } from "@/lib/nav";
import { NavIcon } from "@/components/NavIcon";
import { IconClose } from "@/components/icons";

/*
 * Raccourcis clavier globaux :
 *   g puis <lettre>  → aller à une page (lettres définies dans lib/nav.ts)
 *   ?                → aide (cette fenêtre)
 *   /  ou Ctrl+K     → recherche (palette)
 *   Ctrl+~           → terminal
 * Ignorés pendant la saisie dans un champ.
 */

const LEADER_MS = 1300;

function typing(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [help, setHelp] = useState(false);
  const [leader, setLeader] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stopLeader = () => {
      if (timer.current) clearTimeout(timer.current);
      setLeader(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelp(false);
        stopLeader();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;

      if (leader) {
        const hit = NAV_ITEMS.find((n) => n.key === e.key.toLowerCase());
        stopLeader();
        if (hit) {
          e.preventDefault();
          setHelp(false);
          router.push(hit.href);
        }
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setHelp((h) => !h);
      } else if (e.key === "/") {
        e.preventDefault();
        window.dispatchEvent(new Event("ux077:open-palette"));
      } else if (e.key === "g") {
        setLeader(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setLeader(false), LEADER_MS);
      }
    };
    const onOpen = () => setHelp(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ux077:shortcuts", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ux077:shortcuts", onOpen);
    };
  }, [leader, router]);

  return (
    <>
      {/* Indicateur « g… » pendant la saisie d'un raccourci de navigation */}
      <AnimatePresence>
        {leader && !help && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            className="glass fixed bottom-6 left-1/2 z-[85] -ml-[9.5rem] flex w-[19rem] items-center gap-3 rounded-2xl px-4 py-3"
          >
            <Kbd>g</Kbd>
            <span className="text-sm text-ink">puis une lettre…</span>
            <span className="ml-auto text-xs text-muted">? = aide</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {help && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setHelp(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Raccourcis clavier"
          >
            <motion.div
              className="menu-surface w-full max-w-3xl overflow-hidden rounded-3xl"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 480, damping: 36 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div>
                  <div className="font-display text-lg font-semibold text-ink-strong">Raccourcis clavier</div>
                  <div className="text-xs text-muted">
                    Tape <Kbd>g</Kbd> puis la lettre de la page. Fonctionne partout, sauf dans un champ de saisie.
                  </div>
                </div>
                <button
                  onClick={() => setHelp(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
                  aria-label="Fermer"
                >
                  <IconClose size={16} />
                </button>
              </div>

              <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <section>
                  <div className="label mb-2.5">Général</div>
                  <ul className="space-y-1.5 text-sm">
                    <Row keys={["Ctrl", "K"]} label="Rechercher" />
                    <Row keys={["/"]} label="Rechercher" />
                    <Row keys={["Ctrl", "~"]} label="Terminal" />
                    <Row keys={["?"]} label="Cette aide" />
                    <Row keys={["Échap"]} label="Fermer" />
                    <Row keys={["g", navItem("/").key ?? ""]} label="Dashboard" />
                    <Row keys={["g", navItem("/vault").key ?? ""]} label="Vault" />
                  </ul>
                </section>
                {NAV_GROUPS.map((g) => (
                  <section key={g.id}>
                    <div className="label mb-2.5">{g.label}</div>
                    <ul className="space-y-1.5 text-sm">
                      {g.hrefs.map((h) => {
                        const it = navItem(h);
                        return (
                          <li key={h} className="flex items-center gap-2.5">
                            <NavIcon href={h} size={15} className="shrink-0 text-muted" />
                            <span className="flex-1 truncate text-ink">{it.label}</span>
                            {it.key ? (
                              <span className="flex gap-1">
                                <Kbd>g</Kbd>
                                <Kbd>{it.key}</Kbd>
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Row({ keys, label }: { keys: string[]; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex-1 text-ink">{label}</span>
      <span className="flex gap-1">
        {keys.map((k, i) => (
          <Kbd key={i}>{k}</Kbd>
        ))}
      </span>
    </li>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid min-w-[1.5rem] place-items-center rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-ink-strong shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]">
      {children}
    </kbd>
  );
}
