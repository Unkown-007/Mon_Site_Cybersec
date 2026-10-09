"use client";

import { useState } from "react";
import { usePins, type Pin } from "@/lib/pins";

/* Étoile d'épinglage : ajoute / retire l'élément des épingles du dashboard. */
export function PinButton({ pin, className = "" }: { pin: Pin; className?: string }) {
  const { isPinned, toggle } = usePins();
  const on = isPinned(pin.id);
  const [pop, setPop] = useState(0);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Retirer « ${pin.title} » des épingles` : `Épingler « ${pin.title} »`}
      title={on ? "Retirer des épingles" : "Épingler sur le dashboard"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(pin);
        setPop((n) => n + 1);
      }}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors focus-ring ${
        on ? "text-warning hover:bg-warning/10" : "text-muted hover:bg-white/[0.06] hover:text-ink-strong"
      } ${className}`}
    >
      <svg
        key={pop}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
        className={pop ? "pin-pop" : undefined}
      >
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    </button>
  );
}
