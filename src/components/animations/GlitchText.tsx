"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePerf } from "@/lib/perf";

/**
 * Texte avec glitch RGB. Au survol par défaut ; `auto` déclenche UNE fois au
 * mount (titre clé), `trigger` (clé qui change) force un glitch ponctuel.
 * Plus de boucle permanente — l'effet reste rare et impactant.
 */
export function GlitchText({
  text,
  className,
  as: Tag = "span",
  auto = false,
  trigger,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3";
  auto?: boolean;
  trigger?: unknown;
}) {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lite } = usePerf();

  const fire = useCallback(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reducedMotion) return;

    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 540);
  }, [lite]);

  useEffect(() => {
    if (trigger === undefined) return;
    fire();
  }, [trigger, fire]);

  useEffect(() => {
    if (!auto) return;
    // Un seul glitch au mount (plus de boucle permanente).
    fire();
  }, [auto, fire]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <Tag
      className={`glitch ${on ? "is-glitching" : ""} ${className ?? ""}`}
      data-text={text}
      onMouseEnter={fire}
    >
      {text}
    </Tag>
  );
}
