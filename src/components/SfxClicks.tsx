"use client";

import { useEffect } from "react";
import { sfx, isAudioActive } from "@/lib/audio";

const INTERACTIVE =
  "button, a, [role='button'], summary, input[type='checkbox'], input[type='range']";

/* Sons d'interface : clic sur tout élément interactif, tick discret au survol,
 * et grondement de tonnerre synchronisé sur les éclairs du fond. */
export function SfxClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest(INTERACTIVE);
      if (el && !el.hasAttribute("data-no-sfx")) sfx("click");
    };

    // Survol : throttlé + ignoré tant que l'audio n'est pas débloqué (pas de
    // spam au chargement, et on n'unlock pas le contexte juste pour un hover).
    let lastHover = 0;
    let lastEl: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (!isAudioActive()) return;
      const el = (e.target as HTMLElement | null)?.closest(INTERACTIVE);
      if (!el || el === lastEl || el.hasAttribute("data-no-sfx")) return;
      const now = performance.now();
      if (now - lastHover < 60) return;
      lastHover = now;
      lastEl = el;
      sfx("hover");
    };
    const onOut = () => {
      lastEl = null;
    };

    // Tonnerre : déclenché par le fond animé, seulement si l'audio est actif.
    const onLightning = () => {
      if (isAudioActive()) sfx("thunder");
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);
    window.addEventListener("ux077:lightning", onLightning);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);
      window.removeEventListener("ux077:lightning", onLightning);
    };
  }, []);
  return null;
}
