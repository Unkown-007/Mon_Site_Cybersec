"use client";

import { useEffect, useRef, useState } from "react";
import { useBackground, BACKGROUNDS } from "@/lib/background";

/*
 * Sélecteur de fond d'écran flottant (sous le toggle FX). Ouvre un panneau
 * avec aperçu + libellé de chaque fond. Choix persisté via useBackground.
 */
export function WallpaperPicker() {
  const { bg, setBg } = useBackground();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} style={{ position: "fixed", top: "8.6rem", right: "0.75rem" }} className="z-[60]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Changer le fond d'écran"
        className="clip-chamfer-sm flex items-center gap-1.5 border border-line-strong bg-base/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[1px] text-muted backdrop-blur-sm transition-colors hover:border-secondary/40 hover:text-secondary"
      >
        <span aria-hidden>▦</span> FOND
      </button>

      {open && (
        <div className="hud-panel absolute right-0 mt-2 w-60 p-2 backdrop-blur-md animate-fade-up">
          <p className="label !text-muted px-1.5 pb-2 pt-1">Fond d&apos;écran</p>
          <ul className="space-y-1">
            {BACKGROUNDS.map((b) => {
              const active = bg === b.id;
              return (
                <li key={b.id}>
                  <button
                    onClick={() => {
                      setBg(b.id);
                      setOpen(false);
                    }}
                    className={`clip-chamfer-sm flex w-full items-center gap-2.5 px-2 py-1.5 text-left transition-colors ${
                      active ? "bg-secondary/10 text-secondary" : "text-ink hover:bg-primary/5"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-7 w-10 shrink-0 border border-line-strong clip-chamfer-sm"
                      style={{ background: b.swatch }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs">{b.label}</span>
                      <span className="block truncate font-mono text-[9px] text-muted">{b.desc}</span>
                    </span>
                    {active && <span className="text-xs text-secondary">●</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
