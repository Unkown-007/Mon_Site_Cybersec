"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { music, setMuted } from "@/lib/audio";
import { IconClose } from "@/components/icons";

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

  /* API YouTube + player — chargés seulement à la 1re ouverture du lecteur :
     l'iframe YouTube (scripts + décodeur vidéo) pesait sur chaque page même
     quand on n'écoutait rien. */
  const [ytWanted, setYtWanted] = useState(false);
  useEffect(() => {
    if (panelOpen) setYtWanted(true);
  }, [panelOpen]);

  useEffect(() => {
    if (!ytWanted) return;
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
  }, [ytWanted]);

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
        className="glass fixed z-[45] overflow-hidden rounded-2xl"
        style={
          videoOpen
            ? { position: "fixed", left: pos.x, top: pos.y }
            : { position: "fixed", left: -9999, top: 0, opacity: 0, pointerEvents: "none" }
        }
      >
        <div
          onPointerDown={onDown}
          className="flex cursor-move touch-none select-none items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-1.5"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">⠿ Vidéo</span>
          <button
            onClick={() => setVideoOpen(false)}
            data-no-sfx
            className="grid h-6 w-6 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
            aria-label="Réduire la vidéo"
          >
            <IconClose size={14} />
          </button>
        </div>
        <div ref={ytHostRef} className="[&_iframe]:block" />
      </div>

      {/* Lanceur */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        aria-label="Lecteur audio"
        aria-expanded={panelOpen}
        style={{ position: "fixed", bottom: "1.25rem", left: "1.25rem" }}
        className={`glass z-[45] grid h-12 w-12 place-items-center rounded-2xl transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 active:scale-95 ${
          playing ? "text-secondary shadow-[0_10px_30px_-10px_rgba(0,245,212,0.6)]" : "text-ink"
        }`}
      >
        {playing ? (
          <span className="eq" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        ) : (
          <IconMusic />
        )}
      </button>

      {/* Panneau de contrôle */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
            className="glass z-[45] w-[320px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-3xl"
            style={{ position: "fixed", bottom: "5rem", left: "1.25rem", transformOrigin: "bottom left" }}
          >
            {/* En tête : morceau en cours */}
            <div className="flex items-start gap-3 p-4 pb-3">
              <span
                className={`icon-tile h-12 w-12 shrink-0 rounded-2xl ${playing ? "!text-secondary" : ""}`}
                aria-hidden="true"
              >
                <span className={`eq ${playing ? "" : "is-paused"}`}>
                  <i /><i /><i /><i /><i />
                </span>
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="truncate text-sm font-semibold text-ink-strong">
                  {mode === "synth" ? music.track.name : station ?? title}
                </div>
                <div className="mt-0.5 text-xs">
                  {mode === "synth" ? (
                    <span className="text-warning">Synthé local</span>
                  ) : ready ? (
                    <span className="text-success">YouTube · en ligne</span>
                  ) : (
                    <span className="text-muted">Connexion à YouTube…</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleMute}
                  className="grid h-8 w-8 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
                  aria-label={mute ? "Rétablir le son" : "Couper le son"}
                >
                  {mute ? <IconMute /> : <IconVolume />}
                </button>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
                  aria-label="Fermer"
                >
                  <IconClose size={16} />
                </button>
              </div>
            </div>

            <div className="px-4 pb-4">
              {/* Transport */}
              <div className="mb-4 flex items-center justify-center gap-2">
                <TransportBtn label="Précédent" onClick={() => go(-1)}>⏮</TransportBtn>
                <button
                  onClick={toggle}
                  aria-label={playing ? "Pause" : "Lecture"}
                  className="btn btn-primary grid h-12 w-12 place-items-center !rounded-full !p-0 text-base"
                >
                  {playing ? "❚❚" : "▶"}
                </button>
                <TransportBtn label="Suivant" onClick={() => go(1)}>⏭</TransportBtn>
                <TransportBtn label="Afficher/masquer la vidéo" onClick={() => setVideoOpen((v) => !v)} active={videoOpen}>
                  ▣
                </TransportBtn>
              </div>

              {/* Volume */}
              <div className="mb-4 flex items-center gap-3">
                <IconVolume />
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
                    )}%, rgba(255,255,255,0.1) ${Math.round(vol * 100)}%)`,
                  }}
                  aria-label="Volume"
                />
                <span className="w-7 text-right font-mono text-[11px] tabular-nums text-muted">
                  {Math.round(vol * 100)}
                </span>
              </div>

              {/* Stations */}
              <div className="label mb-2">Stations</div>
              <div className="-mr-1 mb-3 flex max-h-44 flex-col gap-0.5 overflow-y-auto pr-1">
                {STATIONS.map((s) => {
                  const active = station === s.name && mode === "yt";
                  return (
                    <button
                      key={s.name}
                      onClick={() => load(s.q, s.name)}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors ${
                        active ? "bg-secondary/10 text-secondary" : "text-ink hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="w-3 shrink-0 text-[10px] opacity-70">
                        {active ? (playing ? "❚❚" : "▶") : "♪"}
                      </span>
                      <span className="truncate">{s.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* URL custom */}
              <div className="mb-3 flex items-center gap-1.5">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && load(url)}
                  placeholder="URL ou playlist YouTube…"
                  spellCheck={false}
                  className="field flex-1 !rounded-xl !px-3 !py-2 !text-xs"
                />
                <button onClick={() => load(url)} className="btn btn-ghost !px-3 !py-2 !text-xs" aria-label="Lire l'URL">
                  ▶
                </button>
              </div>

              <button
                onClick={() => (mode === "yt" ? enterSynth() : setMode("yt"))}
                className="btn btn-ghost w-full !py-2 !text-xs"
              >
                {mode === "yt" ? "Basculer en synthé (hors-ligne)" : "Revenir à YouTube"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TransportBtn({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-full border text-sm transition-colors ${
        active
          ? "border-primary/50 bg-primary/15 text-ink-strong"
          : "border-white/10 bg-white/[0.03] text-ink hover:bg-white/[0.07]"
      }`}
    >
      {children}
    </button>
  );
}

const IconMusic = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
const IconVolume = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-muted">
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </svg>
);
const IconMute = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="m22 9-6 6M16 9l6 6" />
  </svg>
);
