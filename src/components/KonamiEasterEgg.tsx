"use client";

import { useEffect, useState } from "react";
import { MatrixOverlay } from "@/components/MatrixOverlay";
import { useToast } from "@/components/Toast";
import { celebrate } from "@/lib/confetti";

const SEQ = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright",
  "b", "a",
];

/*
 * Easter egg : le code Konami (↑↑↓↓←→←→BA) déclenche confettis + pluie
 * matrix + toast "GOD MODE". Également déclenchable via l'événement
 * `ux077:matrix` (palette de commande).
 */
export function KonamiEasterEgg() {
  const [matrix, setMatrix] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      idx = k === SEQ[idx] ? idx + 1 : k === SEQ[0] ? 1 : 0;
      if (idx === SEQ.length) {
        idx = 0;
        void celebrate(true);
        push("ok", "CODE KONAMI accepté — GOD MODE engagé");
        setMatrix(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [push]);

  useEffect(() => {
    const open = () => setMatrix(true);
    window.addEventListener("ux077:matrix", open);
    return () => window.removeEventListener("ux077:matrix", open);
  }, []);

  return matrix ? <MatrixOverlay onDone={() => setMatrix(false)} /> : null;
}
