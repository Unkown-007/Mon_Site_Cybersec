"use client";

/*
 * Sélecteur de fond d'écran — choix persisté (localStorage), appliqué via
 * <BackgroundLayer>. Visuel uniquement : aucun impact sur le contenu/SSR.
 * Le coût est indiqué pour chaque fond : « halo », « aurora », « grid » et
 * « void » sont 100 % CSS (GPU), les autres dessinent sur un canvas.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type BgId = "halo" | "akira" | "matrix" | "grid" | "stars" | "aurora" | "void";

export const BACKGROUNDS: {
  id: BgId;
  label: string;
  desc: string;
  swatch: string;
}[] = [
  {
    id: "halo",
    label: "Halo",
    desc: "Lueurs néon fluides — ultra léger",
    swatch: "radial-gradient(circle at 25% 30%,#7b5cf0,transparent 60%),radial-gradient(circle at 80% 80%,#00f5d4,transparent 55%),#0b0a16",
  },
  {
    id: "akira",
    label: "Neo-Tokyo",
    desc: "Ville cyberpunk animée (Akira)",
    swatch: "linear-gradient(160deg,#250a1e,#7b5cf0 60%,#e23b54)",
  },
  {
    id: "matrix",
    label: "Matrix",
    desc: "Pluie de code verte",
    swatch: "linear-gradient(160deg,#021a08,#00ff66)",
  },
  {
    id: "grid",
    label: "Synthwave",
    desc: "Grille néon en perspective",
    swatch: "linear-gradient(160deg,#1a0b22,#00f5d4 55%,#ff3d60)",
  },
  {
    id: "stars",
    label: "Nébuleuse",
    desc: "Champ d'étoiles scintillantes",
    swatch: "radial-gradient(circle at 30% 40%,#7b5cf0,transparent 55%),#05050c",
  },
  {
    id: "aurora",
    label: "Aurora",
    desc: "Voiles colorés en mouvement",
    swatch: "linear-gradient(160deg,#07070c,#7b5cf0 50%,#00f5d4)",
  },
  {
    id: "void",
    label: "Void",
    desc: "Minimal — aucun mouvement",
    swatch: "linear-gradient(160deg,#07070c,#15151f)",
  },
];

// v2 : nouveau fond par défaut (« halo ») pour tout le monde après la refonte.
const STORAGE = "ux077.bg.v2";
const VALID = BACKGROUNDS.map((b) => b.id) as string[];

const Ctx = createContext<{ bg: BgId; setBg: (b: BgId) => void } | null>(null);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [bg, setBgState] = useState<BgId>("halo");

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE);
      if (s && VALID.includes(s)) setBgState(s as BgId);
    } catch {
      /* stockage indisponible */
    }
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
