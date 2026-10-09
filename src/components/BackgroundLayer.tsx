"use client";

import dynamic from "next/dynamic";
import { useBackground } from "@/lib/background";
import { Halo } from "@/components/backgrounds/Halo";
import { CyberGrid } from "@/components/backgrounds/CyberGrid";
import { Aurora } from "@/components/backgrounds/Aurora";

/* Fonds canvas chargés à la demande : leur code n'alourdit pas le bundle
   tant qu'ils ne sont pas sélectionnés. Le fond Halo sert de repli visuel. */
const CyberCityBackground = dynamic(
  () => import("@/components/CyberCityBackground").then((m) => m.CyberCityBackground),
  { ssr: false, loading: () => <Halo /> },
);
const MatrixRain = dynamic(
  () => import("@/components/backgrounds/MatrixRain").then((m) => m.MatrixRain),
  { ssr: false },
);
const Starfield = dynamic(
  () => import("@/components/backgrounds/Starfield").then((m) => m.Starfield),
  { ssr: false },
);

/* Rend le fond d'écran sélectionné. "void" = fond uni. */
export function BackgroundLayer() {
  const { bg } = useBackground();
  if (bg === "halo") return <Halo />;
  if (bg === "akira") return <CyberCityBackground />;
  if (bg === "matrix") return <MatrixRain />;
  if (bg === "grid") return <CyberGrid />;
  if (bg === "stars") return <Starfield />;
  if (bg === "aurora") return <Aurora />;
  return null;
}
