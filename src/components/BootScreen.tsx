"use client";

import { useEffect, useState } from "react";
import { usePerf } from "@/lib/perf";
import { AsciiLogo } from "@/components/AsciiLogo";

interface BootScreenProps {
  onComplete?: () => void;
}

const BIOS_INFO = [
  "UNKNOWNX-077 SECURE SYSTEM BOOTSTRAP V4.8.2",
  "(C) 2026 UNKNOWNX CORP. ALL RIGHTS RESERVED.",
  "",
  "CPU  : QUANTUM-NEURAL CORE @ 5.40 GHz",
  "SPEED: Hyper-threading enabled // 16 Cores",
  "RAM  : 65,536 MB (ECC DDR5-6400, Dual Channel)",
  "DISK : SECURE STORAGE BLOCK DEV-077 (NVMe / RAID-1)",
  "NET  : SAT-LINK UPLINK ACTIVE [IP: 10.99.12.77]",
  "",
  "--- POWER ON SELF TEST (POST) ---",
];

const DIAGNOSTIC_STEPS = [
  { text: "Initializing kernel subsystems...", triggerProgress: 15 },
  { text: "Mounting secure virtual filesystem /vault...", triggerProgress: 30 },
  { text: "Loading cryptographic modules (AES-256-GCM)...", triggerProgress: 45 },
  { text: "Establishing secure uplink to satellite network...", triggerProgress: 60 },
  { text: "Starting sandboxed virtualization layer...", triggerProgress: 75 },
  { text: "Loading firewall rulesets and IDS/IPS modules...", triggerProgress: 90 },
  { text: "Decrypting user environment credentials...", triggerProgress: 100 },
];

export function BootScreen({ onComplete }: BootScreenProps) {
  const { lite } = usePerf();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const isFastMode = lite || reducedMotion;

  useEffect(() => {
    if (isFastMode) {
      setProgress(100);
      onComplete?.();
      return;
    }

    // Standard animation running under 4 seconds (e.g., 2.5 seconds total)
    // We increment progress by 1% every 25ms (2.5 seconds total)
    const duration = 2500;
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step, 100);
        if (next >= 100) {
          clearInterval(interval);
          // Wait 300ms at 100% for user satisfaction, then call onComplete
          setTimeout(() => {
            onComplete?.();
          }, 300);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isFastMode, onComplete]);

  // Listen for Escape key to skip animation
  useEffect(() => {
    if (isFastMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProgress(100);
        onComplete?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFastMode, onComplete]);

  // Determine which diagnostics to show based on progress
  const currentProgressInt = Math.floor(progress);
  const visibleSteps = DIAGNOSTIC_STEPS.filter(
    (step) => currentProgressInt >= step.triggerProgress
  );

  const getProgressBar = (prog: number) => {
    const totalBlocks = 20;
    const filledBlocks = Math.floor((prog / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return `[${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)}] ${Math.floor(prog)}%`;
  };

  return (
    <div className="min-h-screen bg-base bg-diagonal flex items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-primary/30">
      <div className={`font-mono text-[10px] sm:text-xs w-full max-w-2xl bg-surface/50 border p-4 sm:p-6 rounded relative shadow-2xl transition-all duration-500 ${
        !lite && !reducedMotion
          ? "hud-scanlines shadow-[0_0_30px_rgba(0,245,212,0.15)] border-secondary/30 text-glow-secondary"
          : "border-line-strong"
      }`}>
        {/* HUD corners */}
        <span aria-hidden className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-secondary/50" />
        <span aria-hidden className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-secondary/50" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-secondary/50" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-secondary/50" />

        {/* BIOS Header */}
        <div className="text-muted/80 space-y-0.5 mb-4">
          {BIOS_INFO.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>

        {/* Ascii Logo */}
        <div className="my-6 py-2 border-y border-line-subtle bg-base/30">
          <AsciiLogo tagline={false} />
        </div>

        {/* Diagnostic Sequence */}
        <div className="space-y-1 min-h-[140px] text-muted">
          {visibleSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-success">[  OK  ]</span>
              <span>{step.text}</span>
            </div>
          ))}
          {/* Active step loader */}
          {currentProgressInt < 100 && DIAGNOSTIC_STEPS.length > visibleSteps.length && (
            <div className="flex items-center gap-2 text-secondary animate-pulse">
              <span>[ WAIT ]</span>
              <span>{DIAGNOSTIC_STEPS[visibleSteps.length].text}</span>
            </div>
          )}
        </div>

        {/* Progress Bar Container */}
        <div className="mt-8 pt-4 border-t border-line">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span>SECURE SYSTEM LOAD SEQUENCE</span>
            <span>{currentProgressInt}%</span>
          </div>
          <div className="text-success font-bold text-xs sm:text-sm tracking-wider">
            {getProgressBar(progress)}
          </div>
        </div>

        {/* Cursor & Action Hint */}
        <div className="mt-4 flex items-center justify-between text-muted text-[9px] sm:text-[10px]">
          <div className="flex items-center">
            <span className="text-secondary mr-2">SYS_LOAD:~$</span>
            <span className="cursor" />
          </div>
          {!isFastMode && (
            <button
              onClick={() => {
                setProgress(100);
                onComplete?.();
              }}
              className="text-secondary/70 hover:text-secondary underline cursor-pointer"
            >
              [ SKIP DIAGNOSTICS (ESC) ]
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
