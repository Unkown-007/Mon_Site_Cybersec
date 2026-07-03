"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01アカサタナ";

function motionBlocked(): boolean {
  try {
    return (
      localStorage.getItem("ux077:lite") === "1" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

/*
 * Effet « déchiffrement » : les caractères défilent aléatoirement puis se
 * figent de gauche à droite, façon décodage de terminal. Joué une seule
 * fois au mount ; texte statique en mode lite / reduced-motion.
 */
export function DecodeText({ text, className }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const played = useRef(false);

  useEffect(() => {
    if (played.current || motionBlocked()) return;
    played.current = true;
    let frame = 0;
    let raf = 0;
    const total = Math.min(46, Math.max(16, text.length * 2));
    const tick = () => {
      frame++;
      const settled = Math.floor((frame / total) * text.length);
      if (settled >= text.length) {
        setOut(text);
        return;
      }
      setOut(
        text
          .split("")
          .map((c, i) =>
            i < settled || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
