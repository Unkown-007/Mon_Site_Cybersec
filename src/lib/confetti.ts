"use client";

/*
 * Confettis thématiques (cyan / violet) pour les célébrations : succès,
 * easter eggs, unlocks. `canvas-confetti` est importé dynamiquement pour
 * ne peser sur le bundle qu'au moment du tir.
 */

const COLORS = ["#00f5d4", "#7b5cf0", "#e8e6f0"];

function motionBlocked(): boolean {
  try {
    return (
      document.documentElement.classList.contains("lite") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

export async function celebrate(intense = false): Promise<void> {
  if (motionBlocked()) return;
  const confetti = (await import("canvas-confetti")).default;
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 95 };
  confetti({ ...base, particleCount: intense ? 160 : 80, spread: 75, origin: { y: 0.7 } });
  if (intense) {
    setTimeout(() => confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } }), 250);
    setTimeout(() => confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } }), 450);
  }
}
