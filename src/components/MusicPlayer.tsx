"use client";

import { useEffect, useRef, useState } from "react";
import { music, setMuted } from "@/lib/audio";

/*
 * Lecteur audio — source YouTube (IFrame API).
 *  - Fenêtre vidéo flottante DÉPLAÇABLE (drag), persistante même panneau fermé
 *  - Panneau de contrôle : play/pause/prev/next/volume, stations préréglées,
 *    champ URL/playlist, toggle vidéo, repli synthé hors-ligne.
 */

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  cuePlaylist: (o: unknown) => void;
  loadPlaylist: (o: unknown) => void;
  getVideoData: () => { title?: string };
  setPlaybackQuality: (q: string) => void;
};

// Qualité vidéo minimale : on veut surtout le son + un aperçu, pas du HD.
const LOW_Q = "small"; // 240p

// Stations cyberpunk/synthwave/lofi préréglées — IDs vérifiés (oEmbed 200).
const STATIONS: { name: string; q: string }[] = [
  { name: "Nightcall — Kavinsky", q: "MV_3Dpw-BRY" },
  { name: "Synthwave radio (Lofi Girl)", q: "4xDzrJKXOOY" },
  { name: "Lofi hip hop radio (Lofi Girl)", q: "jfKfPfyJRdk" },
  { name: "Chillhop radio", q: "5yx6BWlEVcY" },
  { name: "Resonance — HOME", q: "8GW6sLrK40k" },
  { name: "Cyberpunk 2077 radio 24/7", q: "YgU261Zlkco" },
  { name: "Phonk radio 24/7", q: "PBF5SsJXCWw" },
  { name: "Dark cyberpunk / darksynth", q: "DbG88GrJO0I" },
  { name: "Retrowave mix (NewRetroWave)", q: "MxGJCjNa-80" },
];

function parseYouTube(input: string): { type: "list" | "video"; id: string } | null {
  const s = input.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    const list = u.searchParams.get("list");
    if (list) return { type: "list", id: list };
    const v = u.searchParams.get("v");
    if (v) return { type: "video", id: v };
    if (u.hostname.includes("youtu.be")) return { type: "video", id: u.pathname.slice(1) };
  } catch {
    if (/^[\w-]{11}$/.test(s)) return { type: "video", id: s };
    if (/^PL[\w-]+$/.test(s)) return { type: "list", id: s };
  }
  return null;
}

export function MusicPlayer() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [mode, setMode] = useState<"yt" | "synth">("yt");
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("YouTube — synthwave");
  const [vol, setVol] = useState(0.6);
  const [mute, setMute] = useState(false);
  const [url, setUrl] = useState("");
  const [station, setStation] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 20, y: 120 });

  const playerRef = useRef<YTPlayer | null>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  /* position initiale de la fenêtre vidéo (au-dessus du lanceur) */
  useEffect(() => {
    setPos({ x: 20, y: Math.max(20, window.innerHeight - 340) });
  }, []);

  /* API YouTube + player */
  useEffect(() => {
    const w = window as unknown as {
      YT?: { Player: new (el: string | HTMLElement, o: unknown) => YTPlayer };
      onYouTubeIframeAPIReady?: () => void;
    };
    const create = () => {
      if (!w.YT || playerRef.current || !ytHostRef.current) return;
      // Nœud monté MANUELLEMENT (hors arbre React) : YouTube va le remplacer
      // par une iframe sans que React tente de le réconcilier (évite les
      // crashs removeChild lors des re-rendus → le panneau s'ouvre bien).
      const target = document.createElement("div");
      ytHostRef.current.appendChild(target);
      playerRef.current = new w.YT.Player(target, {
        height: "150",
        width: "266",
        // vq=small : suggère la basse qualité dès le départ.
        playerVars: { controls: 1, modestbranding: 1, rel: 0, playsinline: 1, vq: LOW_Q },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            setReady(true);
            e.target.cuePlaylist({
              playlist: ["MV_3Dpw-BRY", "4xDzrJKXOOY", "jfKfPfyJRdk", "8GW6sLrK40k", "YgU261Zlkco"],
              suggestedQuality: LOW_Q,
            });
            e.target.setVolume(Math.round(vol * 100));
            e.target.setPlaybackQuality?.(LOW_Q);
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            setPlaying(e.data === 1);
            // YouTube réinitialise parfois la qualité : on la re-force au play.
            if (e.data === 1) e.target.setPlaybackQuality?.(LOW_Q);
            const d = e.target.getVideoData?.();
            if (d?.title) setTitle(d.title);
          },
        },
      });
    };
    if (w.YT && w.YT.Player) create();
    else {
      w.onYouTubeIframeAPIReady = create;
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* drag de la fenêtre vidéo */
  const onMove = (e: PointerEvent) => {
    if (!drag.current) return;
    const x = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - drag.current.dx));
    const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - drag.current.dy));
    setPos({ x, y });
  };
  const onUp = () => {
    drag.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
  const onDown = (e: React.PointerEvent) => {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const enterSynth = () => {
    setMode("synth");
    music.setVolume(vol * 0.7);
    music.play();
    setPlaying(true);
  };

  const toggle = () => {
    if (mode === "synth") {
      if (music.playing) {
        music.pause();
        setPlaying(false);
      } else {
        music.play();
        setPlaying(true);
      }
      return;
    }
    const p = playerRef.current;
    if (!p) return enterSynth();
    playing ? p.pauseVideo() : p.playVideo();
  };

  const go = (d: number) => {
    if (mode === "synth") return d > 0 ? music.next() : music.prev();
    const p = playerRef.current;
    if (p) d > 0 ? p.nextVideo() : p.previousVideo();
  };

  const changeVol = (v: number) => {
    setVol(v);
    if (mode === "synth") music.setVolume(v * 0.7);
    else playerRef.current?.setVolume(Math.round(v * 100));
  };

  const toggleMute = () => {
    const m = !mute;
    setMute(m);
    setMuted(m);
    const p = playerRef.current;
    if (p) (m ? p.mute() : p.unMute());
  };

  const load = (input: string, name?: string) => {
    const parsed = parseYouTube(input);
    const p = playerRef.current;
    if (!parsed || !p) return;
    setMode("yt");
    setVideoOpen(true);
    setStation(name ?? null);
    if (parsed.type === "list")
      p.loadPlaylist({ list: parsed.id, listType: "playlist", suggestedQuality: LOW_Q });
    else p.loadPlaylist({ playlist: [parsed.id], suggestedQuality: LOW_Q });
    p.setPlaybackQuality?.(LOW_Q);
  };

  return (
    <>
      {/* Fenêtre vidéo flottante déplaçable (toujours montée → lecture continue) */}
      <div
        className="fixed z-[9999] rounded-sm border border-primary/40 bg-base overflow-hidden shadow-[0_0_24px_-6px_#7b5cf0]"
        style={
          videoOpen
            ? { position: "fixed", left: pos.x, top: pos.y }
            : { position: "fixed", left: -9999, top: 0, opacity: 0, pointerEvents: "none" }
        }
      >
        <div
          onPointerDown={onDown}
          className="flex items-center justify-between gap-2 px-2 py-1 bg-surface border-b border-line cursor-move select-none touch-none"
        >
          <span className="label !text-secondary">⠿ // VIDEO</span>
          <button
            onClick={() => setVideoOpen(false)}
            data-no-sfx
            className="text-muted hover:text-danger font-mono text-xs"
            aria-label="Réduire la vidéo"
          >
            ▁
          </button>
        </div>
        <div ref={ytHostRef} />
      </div>

      {/* Lanceur */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        aria-label="Lecteur audio"
        style={{ position: "fixed", bottom: "1.25rem", left: "1.25rem" }}
        className={`z-[9999] h-11 w-11 grid place-items-center card text-secondary hover:text-ink transition-colors ${
          playing ? "shadow-[0_0_22px_-3px_#00f5d4]" : "shadow-[0_0_18px_-4px_#7b5cf0]"
        }`}
      >
        {playing ? (
          <span className="eq" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        ) : (
          <span>♪</span>
        )}
      </button>

      {/* Panneau de contrôle */}
      {panelOpen && (
        <div
          className="z-[9999] w-[300px] max-w-[calc(100vw-2.5rem)] card corner-frame animate-fade-up shadow-[0_0_40px_-12px_#7b5cf0] before:opacity-100 backdrop-blur-md bg-surface/70"
          style={{ position: "fixed", bottom: "5rem", left: "1.25rem" }}
        >
          {/* En-tête */}
          <div className="gui-stream flex items-center justify-between gap-2 px-4 py-2.5 border-b border-line-strong bg-base/40">
            <span className="label !text-secondary">AUDIO_DECK</span>
            <div className="flex items-center gap-3">
              <button onClick={toggleMute} className="text-muted hover:text-secondary text-xs transition-colors" aria-label="Couper le son">
                {mute ? "🔇" : "🔊"}
              </button>
              <button onClick={() => setPanelOpen(false)} className="text-muted hover:text-danger text-xs transition-colors" aria-label="Fermer">
                ✕
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* En lecture */}
            <div className="flex items-center gap-3 mb-4 border border-line-strong bg-base/50 px-3 py-2.5">
              <span className={`eq shrink-0 ${playing ? "" : "is-paused"}`} aria-hidden="true">
                <i /><i /><i /><i /><i />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs text-ink truncate">
                  {mode === "synth" ? music.track.name : station ?? title}
                </div>
                <div className="font-mono text-[10px] mt-0.5">
                  {mode === "synth" ? (
                    <span className="text-warning">◆ synthé local</span>
                  ) : ready ? (
                    <span className="text-success holo-flicker">● YouTube · en ligne</span>
                  ) : (
                    <span className="text-muted">connexion YouTube<span className="cursor" aria-hidden="true" /></span>
                  )}
                </div>
              </div>
            </div>

            {/* Transport */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button onClick={() => go(-1)} aria-label="Précédent" className="h-9 w-9 grid place-items-center btn btn-ghost !px-0 text-sm">⏮</button>
              <button
                onClick={toggle}
                aria-label={playing ? "Pause" : "Lecture"}
                className="h-12 w-12 grid place-items-center btn btn-primary !px-0 text-lg rounded-full"
              >
                {playing ? "⏸" : "▶"}
              </button>
              <button onClick={() => go(1)} aria-label="Suivant" className="h-9 w-9 grid place-items-center btn btn-ghost !px-0 text-sm">⏭</button>
              <button
                onClick={() => setVideoOpen((v) => !v)}
                aria-label="Afficher/masquer la vidéo"
                className={`h-9 w-9 grid place-items-center btn !px-0 text-sm ${videoOpen ? "btn-primary" : "btn-ghost"}`}
                title="Fenêtre vidéo"
              >
                📺
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className="font-mono text-[10px] text-muted w-7 shrink-0">VOL</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vol}
                onChange={(e) => changeVol(Number(e.target.value))}
                className="deck-range flex-1"
                style={{
                  background: `linear-gradient(90deg, var(--secondary) ${Math.round(
                    vol * 100,
                  )}%, var(--line-strong) ${Math.round(vol * 100)}%)`,
                }}
                aria-label="Volume"
              />
              <span className="font-mono text-[10px] text-secondary w-7 text-right tabular-nums">
                {Math.round(vol * 100)}
              </span>
            </div>

            {/* Stations */}
            <span className="label !text-muted block mb-2">Stations</span>
            <div className="flex flex-col gap-0.5 max-h-44 overflow-y-auto -mr-1 pr-1 mb-3">
              {STATIONS.map((s) => {
                const active = station === s.name && mode === "yt";
                return (
                  <button
                    key={s.name}
                    onClick={() => load(s.q, s.name)}
                    className={`group flex items-center gap-2 text-left font-mono text-[11px] border-l-2 pl-2 py-1 transition-colors ${
                      active
                        ? "border-secondary text-secondary bg-secondary/5"
                        : "border-transparent text-muted hover:text-ink hover:border-primary/50"
                    }`}
                  >
                    <span className="shrink-0">
                      {active ? (playing ? "▮▮" : "▶") : "▸"}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>

            {/* URL custom */}
            <div className="flex items-center gap-1.5 mb-3">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(url)}
                placeholder="coller une URL / playlist YouTube…"
                spellCheck={false}
                className="field !py-1.5 !px-2 text-[11px] flex-1"
              />
              <button onClick={() => load(url)} className="btn btn-ghost !py-1.5 !px-2.5 text-[11px]">▶</button>
            </div>

            <button
              onClick={() => (mode === "yt" ? enterSynth() : setMode("yt"))}
              className="w-full btn btn-ghost !py-1.5 text-[10px]"
            >
              {mode === "yt" ? "⚡ Basculer en synthé (hors-ligne)" : "↩ Revenir à YouTube"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
