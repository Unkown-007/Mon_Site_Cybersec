"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * <ScrollReveal> — élément qui apparaît élégamment au scroll.
 * Utilise IntersectionObserver pour déclencher une animation CSS d'entrée
 * (fade + slide + blur) quand l'élément entre dans le viewport.
 * Respecte prefers-reduced-motion : affichage instantané.
 */

type Direction = "up" | "down" | "left" | "right" | "none";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;       // ms
  duration?: number;    // ms
  distance?: number;    // px
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  threshold?: number;
  once?: boolean;
};

const TRANSFORMS: Record<Direction, (d: number) => string> = {
  up: (d) => `translateY(${d}px)`,
  down: (d) => `translateY(-${d}px)`,
  left: (d) => `translateX(${d}px)`,
  right: (d) => `translateX(-${d}px)`,
  none: () => "none",
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 24,
  className = "",
  as: Tag = "div",
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion, threshold, once]);

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : TRANSFORMS[direction](distance),
        filter: visible ? "blur(0px)" : "blur(4px)",
        transition: reducedMotion
          ? "none"
          : `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform, filter",
      }}
    >
      {children}
    </Component>
  );
}
