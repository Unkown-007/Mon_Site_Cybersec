"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/*
 * Mode "lite" — coupe les effets lourds (fond animé canvas, curseur viseur,
 * scanlines, animations continues) pour soulager le GPU/CPU.
 * Persisté en localStorage et reflété via la classe `.lite` sur <html>.
 */

interface PerfContextValue {
  lite: boolean;
  toggle: () => void;
  setLite: (v: boolean) => void;
}

const PerfContext = createContext<PerfContextValue | null>(null);
const KEY = "ux077:lite";

export function PerfProvider({ children }: { children: ReactNode }) {
  const [lite, setLite] = useState(false);

  // Lecture de la préférence persistée (client uniquement).
  useEffect(() => {
    try {
      setLite(localStorage.getItem(KEY) === "1");
    } catch {
      /* localStorage indisponible : on reste en mode complet */
    }
  }, []);

  // Persistance + reflet sur <html> pour les règles CSS `.lite`.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, lite ? "1" : "0");
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle("lite", lite);
  }, [lite]);

  return (
    <PerfContext.Provider value={{ lite, toggle: () => setLite((v) => !v), setLite }}>
      {children}
    </PerfContext.Provider>
  );
}

export function usePerf(): PerfContextValue {
  const ctx = useContext(PerfContext);
  // Repli sûr si utilisé hors provider (évite tout crash).
  return ctx ?? { lite: false, toggle: () => {}, setLite: () => {} };
}

import { MotionConfig } from "framer-motion";

export function MotionComplianceConfig({ children }: { children: ReactNode }) {
  const { lite } = usePerf();
  return (
    <MotionConfig reducedMotion={lite ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}

