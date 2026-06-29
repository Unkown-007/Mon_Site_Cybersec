"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { GlitchText } from "@/components/animations/GlitchText";
import { usePerf } from "@/lib/perf";

// Simulated security/firewall breach sequence logs
const ALARM_LOGS = [
  "ERR_SEC_ACCESS_VIOLATION: Vault address not found.",
  "ERR_RESOLVER_LOST: Node routing trace failed.",
  "SHIELD_STATUS: Active firewall blocking anomalous activity.",
  "TRACE_ROUTE: IP logged and telemetry dispatched.",
  "STATUS: Threat level 2 - Access Denied."
];

export default function NotFound() {
  const router = useRouter();
  const { lite } = usePerf();
  const [logs, setLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect prefers-reduced-motion client-side
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Staggered warning logs animation (respects prefers-reduced-motion)
  useEffect(() => {
    if (prefersReducedMotion) {
      // Reveal all logs instantly if user prefers reduced motion
      setLogs(ALARM_LOGS);
      return;
    }

    if (logIndex < ALARM_LOGS.length) {
      const timeout = setTimeout(() => {
        setLogs((prev) => [...prev, ALARM_LOGS[logIndex]]);
        setLogIndex((prev) => prev + 1);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [logIndex, prefersReducedMotion]);

  // Red Matrix Rain Canvas Animation (Respects both .lite mode and prefers-reduced-motion)
  useEffect(() => {
    if (lite || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const font = 14;
    const cols = Math.floor(window.innerWidth / font);
    const drops = Array.from({ length: cols }, () => Math.random() * -window.innerHeight);
    const glyphs = "0101010101010101XYZERRORVOID404".split("");

    const draw = () => {
      // Fading background for trailing effect
      ctx.fillStyle = "rgba(7, 7, 12, 0.15)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.font = `${font}px 'Share Tech Mono', monospace`;
      
      for (let i = 0; i < cols; i++) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * font;
        const y = drops[i];

        // Draw character with alarm red colors (bright red/orange accents, darker red columns)
        const rand = Math.random();
        if (rand > 0.98) {
          ctx.fillStyle = "#ffffff"; // Rare white flash
        } else if (rand > 0.92) {
          ctx.fillStyle = "#ffbc2e"; // Orange/warning flash
        } else {
          ctx.fillStyle = "#ff3d60"; // Base alarm red
        }

        ctx.fillText(char, x, y);

        // Reset drop to top with randomized delay once it hits bottom
        if (y > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] = y + font;
        }
      }
      
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [lite, prefersReducedMotion]);

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-base">
      {/* Visual Effect 1: Red Matrix Rain Background Canvas (only mounted if not lite & motion allowed) */}
      {!lite && !prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          aria-hidden="true"
        />
      )}

      {/* Cyberpunk Danger Alarm Scanlines (colored in alert-red) */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0 z-10 hud-scanlines-danger opacity-75" 
      />

      {/* Main warning interface frame */}
      <div className="relative z-20 max-w-xl w-full border border-danger/30 bg-surface/85 backdrop-blur-md p-8 md:p-10 rounded-md corner-frame-danger shadow-[0_0_24px_rgba(255,61,96,0.15)] flex flex-col items-center">
        {/* Warning Indicator */}
        <div className="flex items-center gap-2 mb-6 px-3 py-1 bg-danger/10 border border-danger/40 text-danger text-xs font-mono tracking-widest uppercase animate-pulse-slow">
          <span className="inline-block w-2 h-2 bg-danger rounded-full animate-ping" />
          <span>[ ALERTE : INTRUSION SEC_404 ]</span>
        </div>

        {/* Visual Effect 2: Aggressive red glitched header */}
        <GlitchText
          as="h1"
          text="404"
          auto
          className="font-display font-black leading-none text-danger text-[96px] sm:text-[128px] tracking-tighter text-glow-danger select-none"
        />

        <p className="font-mono text-danger/80 text-xs sm:text-sm tracking-wide uppercase mt-1">
          {"// SIGNAL_ROUTE_TERMINATED"}
        </p>

        {/* Console Simulated Log Terminal */}
        <div className="w-full bg-base/80 border border-line-strong rounded p-4 my-6 font-mono text-left text-[11px] leading-relaxed text-muted/90 h-[104px] overflow-hidden">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-danger font-semibold">&gt;&gt;</span>
              <span className={index === logs.length - 1 ? "text-ink" : ""}>{log}</span>
            </div>
          ))}
          {!prefersReducedMotion && logIndex < ALARM_LOGS.length && (
            <div className="cursor text-danger inline-block h-3 w-1.5 align-middle" aria-hidden="true" />
          )}
        </div>

        <p className="max-w-md font-mono text-xs text-muted leading-relaxed mb-8">
          La ressource demandée n&apos;existe pas ou a été effacée de ce secteur. Le serveur pare-feu a verrouillé la connexion. Vos identifiants ont été enregistrés par le réseau de surveillance.
        </p>

        {/* Buttons and Routing Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/" 
            className="btn btn-primary-danger group relative overflow-hidden text-center justify-center"
          >
            <span className="relative z-10">← RETOUR AU DASHBOARD</span>
          </Link>
          <button 
            onClick={() => router.back()} 
            className="btn btn-ghost-danger text-center justify-center"
          >
            ↩ PAGE PRÉCÉDENTE
          </button>
        </div>

        {/* Details Footer */}
        <div className="mt-8 font-mono text-[9px] text-muted/60 uppercase flex items-center justify-between w-full border-t border-line/30 pt-4">
          <span>PORT: FAIL_SEC_077</span>
          <span>VAL: 0x00000194</span>
          <span>HOPS: NULL_ROUTE</span>
        </div>
      </div>
    </main>
  );
}
