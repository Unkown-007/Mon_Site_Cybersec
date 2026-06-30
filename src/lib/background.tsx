"use client";

/*
 * Sélecteur de fond d'écran — choix persisté (localStorage), appliqué via
 * <BackgroundLayer>. Visuel uniquement : aucun impact sur le contenu/SSR.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type BgId = "akira" | "matrix" | "grid" | "void";

export const BACKGROUNDS: {
  id: BgId;
  label: string;
  desc: string;
  swatch: string;
}[] = [
  {
    id: "akira",
    label: "Neo-Tokyo",
    desc: "Ville cyberpunk animée (Akira)",
    swatch: "linear-gradient(135deg,#250a1e,#7b5cf0 60%,#e23b54)",
  },
  {
    id: "matrix",
    label: "Matrix",
    desc: "Pluie de code verte — hacker / Kali",
    swatch: "linear-gradient(135deg,#021a08,#00ff66)",
  },
  {
    id: "grid",
    label: "Synthwave",
    desc: "Grille néon en perspective",
    swatch: "linear-gradient(135deg,#1a0b22,#00f5d4 55%,#ff3d60)",
  },
  {
    id: "void",
    label: "Void",
    desc: "Minimal — aucun fond animé",
    swatch: "linear-gradient(135deg,#07070c,#15151f)",
  },
];

const STORAGE = "ux077.bg";
const VALID: BgId[] = ["akira", "matrix", "grid", "void"];

const Ctx = createContext<{ bg: BgId; setBg: (b: BgId) => void } | null>(null);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [bg, setBgState] = useState<BgId>("akira");

  useEffect(() => {
    const s = localStorage.getItem(STORAGE);
    if (s && (VALID as string[]).includes(s)) setBgState(s as BgId);
  }, []);

  const setBg = (b: BgId) => {
    setBgState(b);
    try {
      localStorage.setItem(STORAGE, b);
    } catch {
      /* stockage indisponible */
    }
  };

  return <Ctx.Provider value={{ bg, setBg }}>{children}</Ctx.Provider>;
}

export function useBackground() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBackground doit être utilisé dans <BackgroundProvider>");
  return c;
}
