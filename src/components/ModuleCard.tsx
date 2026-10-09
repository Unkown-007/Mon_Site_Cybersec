"use client";

import Link from "next/link";
import { useRef, type ReactNode, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { usePerf } from "@/lib/perf";

const MotionLink = motion.create(Link);

const DEFAULT_ICONS: Record<string, ReactNode> = {
  RES: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  ),
  WUP: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  TLS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  INT: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
};

/*
 * <ModuleCard> — carte de module du dashboard.
 * Inclinaison 3D qui suit le curseur (MotionValues + ressort : aucun
 * re-render React) et halo lumineux sous le pointeur (variables CSS).
 * Coupé en lite / prefers-reduced-motion.
 */
export function ModuleCard({
  href,
  code,
  title,
  desc,
  meta,
  accent = "primary",
  icon,
}: {
  href: string;
  code: string;
  title: string;
  desc: string;
  meta?: string;
  accent?: "primary" | "secondary";
  icon?: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const { lite } = usePerf();
  const still = Boolean(reduce) || lite;

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), spring);

  const spotColor = accent === "primary" ? "rgba(140, 112, 255, 0.16)" : "rgba(0, 245, 212, 0.13)";
  const resolvedIcon = icon ?? DEFAULT_ICONS[code] ?? <span>→</span>;

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--spot-x", `${x}px`);
    el.style.setProperty("--spot-y", `${y}px`);
    if (!still) {
      mx.set(x / rect.width);
      my.set(y / rect.height);
    }
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <MotionLink
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="spotlight-card card group block h-full p-5 focus-ring"
      style={{
        rotateX: still ? 0 : rotateX,
        rotateY: still ? 0 : rotateY,
        transformPerspective: 900,
        // le transform est piloté par le ressort : pas de transition CSS dessus
        transition: "border-color .3s, box-shadow .35s",
        ["--spot-color" as string]: spotColor,
      }}
    >
      <div className="mb-5 flex items-start justify-between">
        <span
          className={`icon-tile transition-transform duration-500 ease-out-soft group-hover:-translate-y-0.5 group-hover:scale-105 ${
            accent === "secondary" ? "!text-secondary" : ""
          }`}
        >
          {resolvedIcon}
        </span>
        <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted">{code}</span>
      </div>
      <h3 className="mb-1.5 font-display text-lg font-semibold text-ink-strong">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{desc}</p>
      {meta ? (
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3.5 text-xs text-muted">
          <span className="font-mono">{meta}</span>
          <span
            className={`grid h-7 w-7 place-items-center rounded-full border border-white/10 transition-all duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:border-transparent ${
              accent === "secondary"
                ? "group-hover:bg-secondary group-hover:text-[#06060b]"
                : "group-hover:bg-primary group-hover:text-white"
            }`}
          >
            →
          </span>
        </div>
      ) : null}
    </MotionLink>
  );
}
