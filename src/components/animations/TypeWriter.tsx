"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (startDelay === 0) return;
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (n >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(t);
    // onDone volontairement hors deps pour ne pas relancer la frappe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, started, text, speed]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      {caret && n < text.length ? <span className="cursor" aria-hidden="true" /> : null}
    </span>
  );
}
