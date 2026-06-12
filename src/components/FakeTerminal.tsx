"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";

interface Line {
  text: string;
  tone?: "out" | "ok" | "err" | "cmd";
}

const BANNER: Line[] = [
  { text: "UnknownX-077 // shell v0.1 — tape `help`", tone: "out" },
];

export function FakeTerminal() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const print = (next: Line[]) => setLines((prev) => [...prev, ...next]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    print([{ text: `root@vault:~$ ${cmd}`, tone: "cmd" }]);

    const [name, ...args] = cmd.split(/\s+/);
    switch (name) {
      case "help":
        print([
          { text: "commandes disponibles :", tone: "out" },
          { text: "  help            cette aide", tone: "out" },
          { text: "  ls              liste les modules", tone: "out" },
          { text: "  cd <module>     navigue vers un module", tone: "out" },
          { text: "  whoami          session courante", tone: "out" },
          { text: "  clear           nettoie l'écran", tone: "out" },
        ]);
        break;
      case "ls":
        print(
          NAV_ITEMS.map((it) => ({
            text: `  ${it.href.padEnd(14)} ${it.desc}`,
            tone: "out" as const,
          }))
        );
        break;
      case "cd": {
        const target = args[0]?.replace(/^\/+/, "") ?? "";
        const match = NAV_ITEMS.find(
          (it) => it.href === `/${target}` || it.label.toLowerCase() === target.toLowerCase()
        );
        if (!target || target === "~" || target === "/") {
          router.push("/");
          print([{ text: "→ /", tone: "ok" }]);
        } else if (match) {
          router.push(match.href);
          print([{ text: `→ ${match.href}`, tone: "ok" }]);
        } else {
          print([{ text: `cd: ${target}: module introuvable`, tone: "err" }]);
        }
        break;
      }
      case "whoami":
        print([{ text: "operator @ unknownx-077", tone: "out" }]);
        break;
      case "clear":
        setLines(BANNER);
        break;
      default:
        print([{ text: `${name}: commande inconnue — \`help\``, tone: "err" }]);
    }
  };

  const toneClass = (tone?: Line["tone"]) =>
    tone === "ok"
      ? "text-success"
      : tone === "err"
        ? "text-danger"
        : tone === "cmd"
          ? "text-secondary"
          : "text-muted";

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-line bg-base/50">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="label ml-2">TERMINAL</span>
      </div>
      <div
        ref={scrollRef}
        className="h-52 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
      >
        {lines.map((l, i) => (
          <div key={i} className={toneClass(l.tone)}>
            {l.text}
          </div>
        ))}
      </div>
      <form
        className="flex items-center gap-2 px-4 py-2 border-t border-line"
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
          setValue("");
        }}
      >
        <span className="text-success font-mono text-xs">root@vault:~$</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-transparent outline-none font-mono text-xs text-ink"
          placeholder="help"
          spellCheck={false}
          autoComplete="off"
          aria-label="Entrée terminal"
        />
      </form>
    </div>
  );
}
