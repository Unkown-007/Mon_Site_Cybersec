"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GUIPanel } from "@/components/GUIPanel";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useToast } from "@/components/Toast";

const PHASES = ["Recon", "Enum", "Foothold", "PrivEsc", "Root"];

interface Active {
  machine: string;
  platform: string;
  link: string;
  objective: string;
  progress: number;
}

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
};

export default function LabPage() {
  const { push } = useToast();
  const [active, setActive] = useLocalStorage<Active>("ux077.lab.active", {
    machine: "",
    platform: "HackTheBox",
    link: "",
    objective: "",
    progress: 0,
  });
  const [notes, setNotes, notesHydrated] = useLocalStorage<string>("ux077.lab.notes", "");
  const [elapsed, setElapsed] = useLocalStorage<number>("ux077.lab.timer", 0);
  const [running, setRunning] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // Chrono
  useEffect(() => {
    if (running) {
      tick.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running, setElapsed]);

  // Indicateur de sauvegarde des notes (debounce visuel)
  useEffect(() => {
    if (!notesHydrated) return;
    const t = setTimeout(
      () => setSavedAt(new Date().toLocaleTimeString("fr-FR")),
      400
    );
    return () => clearTimeout(t);
  }, [notes, notesHydrated]);

  const resetTimer = () => {
    setRunning(false);
    setElapsed(0);
    push("warn", "Chrono remis à zéro.");
  };

  return (
    <div>
      <PageHeader
        code="LAB // ENVIRONNEMENT D'EXPÉRIMENTATION"
        title="Lab"
        desc="Machine active, objectif du jour, chrono de session et bloc-notes auto-sauvegardé."
      />

      {/* GUI panels */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <GUIPanel title="// SESSION_ACTIVE" size="lg" animated className="!w-full">
          <div className="space-y-1">
            <div>MACHINE: <span className="text-ink">{active.machine || "—"}</span></div>
            <div>PLATEFORME: <span className="text-ink">{active.platform}</span></div>
            <div>CHRONO: <span className={running ? "text-success" : "text-muted"}>{fmt(elapsed)}</span></div>
            <div>STATUT: {running ? <span className="text-success">● en cours</span> : <span className="text-muted">○ pause</span>}</div>
          </div>
        </GUIPanel>

        <GUIPanel title="// ATTACK_PHASES" size="lg" animated className="!w-full">
          <div className="space-y-1">
            {PHASES.map((p, i) => {
              const idx = Math.min(4, Math.floor(active.progress / 20));
              const done = i < idx;
              const cur = i === idx;
              return (
                <div key={p} className={`flex items-center gap-2 ${cur ? "text-secondary" : done ? "text-success" : "text-muted"}`}>
                  <span>{done ? "✓" : cur ? "▸" : "·"}</span>
                  {p}
                </div>
              );
            })}
          </div>
        </GUIPanel>

        <GUIPanel title="// NOTES_STATUS" size="lg" animated className="!w-full">
          <div className="space-y-1">
            <div>LIGNES: <span className="text-ink">{notes.trim() ? notes.split(/\n+/).filter(Boolean).length : 0}</span></div>
            <div>TAILLE: <span className="text-ink">{notes.length} car.</span></div>
            <div>SAUVEGARDE: <span className="text-ink">{savedAt ?? "—"}</span></div>
            <div>SYNC: <span className="text-success">● local</span></div>
          </div>
        </GUIPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* En cours */}
          <section className="card p-5">
            <h2 className="label mb-4">En cours</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Labelled label="Machine">
                <input
                  className="field"
                  value={active.machine}
                  onChange={(e) => setActive((a) => ({ ...a, machine: e.target.value }))}
                  placeholder="ex. Manager"
                />
              </Labelled>
              <Labelled label="Plateforme">
                <select
                  className="field"
                  value={active.platform}
                  onChange={(e) => setActive((a) => ({ ...a, platform: e.target.value }))}
                >
                  {["HackTheBox", "TryHackMe", "Root-Me", "FCSC", "VulnHub", "Autre"].map((p) => (
                    <option key={p} value={p} className="bg-surface">
                      {p}
                    </option>
                  ))}
                </select>
              </Labelled>
            </div>
            <div className="mt-3">
              <Labelled label="Lien direct">
                <input
                  className="field"
                  value={active.link}
                  onChange={(e) => setActive((a) => ({ ...a, link: e.target.value }))}
                  placeholder="https://app.hackthebox.com/machines/…"
                />
              </Labelled>
            </div>
            <div className="mt-3">
              <Labelled label="Objectif du jour">
                <input
                  className="field"
                  value={active.objective}
                  onChange={(e) => setActive((a) => ({ ...a, objective: e.target.value }))}
                  placeholder="ex. obtenir le foothold via l'API"
                />
              </Labelled>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="label !text-muted">Progression</span>
                <span className="font-mono text-xs text-secondary">{active.progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={active.progress}
                onChange={(e) => setActive((a) => ({ ...a, progress: Number(e.target.value) }))}
                className="w-full accent-[#7b5cf0]"
                aria-label="Progression"
              />
              <div className="mt-2 h-2 bg-base border border-line-strong overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                  style={{ width: `${active.progress}%` }}
                />
              </div>
            </div>

            {active.link && (
              <a
                href={active.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost mt-4 !py-2 text-xs"
              >
                Ouvrir la machine ↗
              </a>
            )}
          </section>

          {/* Notes brouillon */}
          <section className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="label">Notes de session</h2>
              <span className="font-mono text-[10px] text-muted">
                {savedAt ? `✓ sauvegardé ${savedAt}` : "…"}
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="$ notes brutes de la session — sauvegarde automatique dans le navigateur…"
              spellCheck={false}
              className="field min-h-[280px] resize-y leading-relaxed"
              aria-label="Notes de session"
            />
          </section>
        </div>

        {/* Chrono */}
        <aside>
          <section className="card p-5 text-center sticky top-20">
            <h2 className="label mb-4">Chrono de session</h2>
            <div className="font-display text-4xl text-ink tabular-nums mb-1">
              {fmt(elapsed)}
            </div>
            <div className="label !text-muted mb-5 justify-center">
              {running ? "● en cours" : "○ en pause"}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className={running ? "btn btn-ghost justify-center" : "btn btn-primary justify-center"}
              >
                {running ? "⏸ Pause" : "▶ Démarrer"}
              </button>
              <button onClick={resetTimer} className="btn btn-ghost justify-center !py-2 text-xs">
                ⟲ Réinitialiser
              </button>
            </div>
            <p className="mt-4 text-[10px] font-mono text-muted leading-relaxed">
              Le temps et les notes sont stockés localement dans ce navigateur.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label !text-muted block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
