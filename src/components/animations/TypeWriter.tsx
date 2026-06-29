"use client";

import { useEffect, useState } from "react";
import { usePerf } from "@/lib/perf";

/** Effet machine à écrire. Appelle onDone quand la frappe est terminée. */
export function TypeWriter({
  text,
  speed = 40,
  startDelay = 0,
  className,
  caret = true,
  onDone,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  caret?: boolean;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(startDelay === 0);
  const { lite } = usePerf();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reducedMotion) {
      setN(text.length);
      setStarted(true);
      onDone?.();
    }
  }, [lite, text.length, onDone]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reducedMotion) return;
    if (startDelay === 0) return;
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay, lite]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lite || reducedMotion) return;
    if (!started) return;
    if (n >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(t);
    // onDone volontairement hors deps pour ne pas relancer la frappe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, started, text, speed, lite]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      {caret && n < text.length ? <span className="cursor" aria-hidden="true" /> : null}
    </span>
  );
}
