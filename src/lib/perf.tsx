"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

/* Appareil modeste (peu de cœurs / RAM) ou économie de données demandée. */
function lowEndDevice(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    nav.connection?.saveData === true ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2)
  );
}

export function PerfProvider({ children }: { children: ReactNode }) {
  const [lite, setLiteState] = useState(false);

  // Préférence persistée ; sans préférence, lite d'office sur petit matériel.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      setLiteState(stored === null ? lowEndDevice() : stored === "1");
    } catch {
      /* localStorage indisponible : on reste en mode complet */
    }
  }, []);

  // Reflet sur <html> pour les règles CSS `.lite`.
  useEffect(() => {
    document.documentElement.classList.toggle("lite", lite);
  }, [lite]);

  // Seul un choix explicite de l'utilisateur est mémorisé.
  const setLite = useCallback((v: boolean) => {
    setLiteState(v);
    try {
      localStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = useCallback(() => setLite(!lite), [lite, setLite]);

  const value = useMemo(() => ({ lite, toggle, setLite }), [lite, toggle, setLite]);
  return <PerfContext.Provider value={value}>{children}</PerfContext.Provider>;
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

