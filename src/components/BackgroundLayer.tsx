"use client";

import { useBackground } from "@/lib/background";
import { CyberCityBackground } from "@/components/CyberCityBackground";
import { MatrixRain } from "@/components/backgrounds/MatrixRain";
import { CyberGrid } from "@/components/backgrounds/CyberGrid";
import { Starfield } from "@/components/backgrounds/Starfield";
import { Aurora } from "@/components/backgrounds/Aurora";

/* Rend le fond d'écran sélectionné. "void" = aucun fond (maillage du body). */
export function BackgroundLayer() {
  const { bg } = useBackground();
  if (bg === "akira") return <CyberCityBackground />;
  if (bg === "matrix") return <MatrixRain />;
  if (bg === "grid") return <CyberGrid />;
  if (bg === "stars") return <Starfield />;
  if (bg === "aurora") return <Aurora />;
  return null;
}
