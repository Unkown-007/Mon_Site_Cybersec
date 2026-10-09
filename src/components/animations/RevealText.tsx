/*
 * <RevealText> — les mots apparaissent l'un après l'autre (montée + fondu).
 * 100 % CSS (classe .reveal-word, opacity + transform) : aucun re-render
 * React pendant l'animation. Coupé automatiquement en lite / reduced-motion.
 */

import type { CSSProperties } from "react";

// `wordClassName` s'applique à chaque mot : un dégradé `background-clip: text`
// posé sur le parent ne s'afficherait pas sur des enfants transformés.
export function RevealText({
  text,
  className,
  wordClassName = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className={`reveal-word ${wordClassName}`} style={{ "--i": i + delay } as CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
