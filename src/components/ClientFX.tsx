"use client";

import dynamic from "next/dynamic";

/*
 * Effets client non critiques chargés en chunks séparés (ssr:false) :
 * ils n'apparaissent qu'après hydratation et ne bloquent ni le HTML
 * initial ni le bundle principal.
 */

const SfxClicks = dynamic(
  () => import("@/components/SfxClicks").then((m) => m.SfxClicks),
  { ssr: false }
);
const MusicPlayerLazy = dynamic(
  () => import("@/components/MusicPlayer").then((m) => m.MusicPlayer),
  { ssr: false }
);

export function ClientFX() {
  return <SfxClicks />;
}

export function LazyMusicPlayer() {
  return <MusicPlayerLazy />;
}
