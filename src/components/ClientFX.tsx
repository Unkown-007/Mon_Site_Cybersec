"use client";

import dynamic from "next/dynamic";

/*
 * Effets client non critiques chargés en chunks séparés (ssr:false) :
 * ils n'apparaissent qu'après hydratation et ne bloquent ni le HTML
 * initial ni le bundle principal.
 */

const CrosshairCursor = dynamic(
  () => import("@/components/CrosshairCursor").then((m) => m.CrosshairCursor),
  { ssr: false }
);
const SfxClicks = dynamic(
  () => import("@/components/SfxClicks").then((m) => m.SfxClicks),
  { ssr: false }
);
const PerfToggle = dynamic(
  () => import("@/components/PerfToggle").then((m) => m.PerfToggle),
  { ssr: false }
);
const WallpaperPicker = dynamic(
  () => import("@/components/WallpaperPicker").then((m) => m.WallpaperPicker),
  { ssr: false }
);
const MusicPlayerLazy = dynamic(
  () => import("@/components/MusicPlayer").then((m) => m.MusicPlayer),
  { ssr: false }
);

export function ClientFX() {
  return (
    <>
      <CrosshairCursor />
      <SfxClicks />
      <PerfToggle />
      <WallpaperPicker />
    </>
  );
}

export function LazyMusicPlayer() {
  return <MusicPlayerLazy />;
}
