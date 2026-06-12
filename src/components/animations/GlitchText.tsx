"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Texte avec glitch RGB. Par défaut au survol ; `auto` déclenche
 * périodiquement, `trigger` (clé qui change) force un glitch ponctuel.
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

  const fire = useCallback(() => {
    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 540);
  }, []);

  useEffect(() => {
    if (trigger === undefined) return;
    fire();
  }, [trigger, fire]);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(fire, 3800);
    return () => clearInterval(id);
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
