"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { MatrixOverlay } from "@/components/MatrixOverlay";
import {
  runCommand,
  COMMAND_NAMES,
  type OutLine,
  type CmdContext,
} from "@/lib/terminal/commands";

const BANNER: OutLine[] = [
  { text: "UnknownX-077 // shell v1.0 — `help` pour la liste, Ctrl+~ pour basculer", tone: "accent" },
];

const TONE: Record<NonNullable<OutLine["tone"]>, string> = {
  out: "text-muted",
  ok: "text-success",
  err: "text-danger",
  warn: "text-warning",
  cmd: "text-secondary",
  accent: "text-primary",
};

/** Terminal global : Ctrl+~ pour basculer, ou évènement `ux077:open-terminal`. */
export function Terminal() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [matrix, setMatrix] = useState(false);
  const [lines, setLines] = useState<OutLine[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histPos, setHistPos] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Raccourci global Ctrl+~ / Ctrl+`  + évènement d'ouverture
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "`" || e.key === "~")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && !matrix) setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ux077:open-terminal", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ux077:open-terminal", onOpen);
    };
  }, [matrix]);

  const print = useCallback((next: OutLine[]) => setLines((prev) => [...prev, ...next]), []);

  const submit = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      print([{ text: `root@vault:~$ ${cmd}`, tone: "cmd" }]);
      setHistory((h) => [...h, cmd]);
      setHistPos(-1);

      const ctx: CmdContext = {
        user,
        navigate: (href) => router.push(href),
        close: () => setOpen(false),
        clear: () => setLines([]),
        startMatrix: () => setMatrix(true),
        history,
      };
      const result = runCommand(cmd, ctx);
      if (result instanceof Promise) {
        const lines = await result;
        if (lines) print(lines);
      } else if (Array.isArray(result)) {
        print(result);
      }
    },
    [print, router, user, history]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const pos = histPos < 0 ? history.length - 1 : Math.max(0, histPos - 1);
      setHistPos(pos);
      setInput(history[pos]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histPos < 0) return;
      const pos = histPos + 1;
      if (pos >= history.length) {
        setHistPos(-1);
        setInput("");
      } else {
        setHistPos(pos);
        setInput(history[pos]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMAND_NAMES.filter((n) => n.startsWith(input.trim()));
      if (match.length === 1) setInput(match[0] + " ");
      else if (match.length > 1) print([{ text: match.join("   "), tone: "out" }]);
    }
  };

  return (
    <>
      {matrix && <MatrixOverlay onDone={() => setMatrix(false)} />}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-2 bottom-2 z-[70] flex h-[78vh] flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07070d]/[0.97] sm:inset-x-4 sm:bottom-4"
            style={{ boxShadow: "0 -30px 80px -30px rgba(123,92,240,0.55), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            exit={{ y: "105%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            {/* header */}
            <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-muted">root@vault — zsh</span>
              <kbd className="ml-auto hidden rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
                Ctrl ~
              </kbd>
              <button
                onClick={() => setOpen(false)}
                className="ml-2 grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
                aria-label="Fermer le terminal"
              >
                ✕
              </button>
            </div>

            {/* output */}
            <div
              ref={scrollRef}
              onClick={() => inputRef.current?.focus()}
              className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs sm:text-sm leading-relaxed"
            >
              {lines.map((l, i) => (
                <div key={i} className={`whitespace-pre-wrap ${TONE[l.tone ?? "out"]}`}>
                  {l.text}
                </div>
              ))}
            </div>

            {/* input */}
            <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.06] px-4 py-3">
              <span className="text-success font-mono text-xs sm:text-sm shrink-0">root@vault:~$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none font-mono text-xs sm:text-sm text-ink"
                placeholder="help"
                aria-label="Entrée terminal"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
