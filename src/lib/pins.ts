"use client";

import { useCallback, useEffect, useState } from "react";

/*
 * Épingles (favoris) et pages récentes — stockées dans le navigateur
 * (localStorage), synchronisées entre composants via un évènement window
 * et entre onglets via l'évènement « storage ».
 */

export type PinKind = "page" | "ressource" | "outil" | "plateforme";

export interface Pin {
  id: string;
  kind: PinKind;
  title: string;
  href: string;
  hint?: string;
}

export interface RecentPage {
  path: string;
  at: number;
}

const PIN_KEY = "ux077:pins";
const RECENT_KEY = "ux077:recent-pages";
const EVT = "ux077:pins-changed";
const MAX_PINS = 30;
const MAX_RECENT = 8;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible */
  }
  window.dispatchEvent(new Event(EVT));
}

function useStored<T>(key: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}

export function usePins() {
  const pins = useStored<Pin[]>(PIN_KEY, []);

  const isPinned = useCallback((id: string) => pins.some((p) => p.id === id), [pins]);

  const toggle = useCallback((pin: Pin) => {
    const cur = read<Pin[]>(PIN_KEY, []);
    const next = cur.some((p) => p.id === pin.id)
      ? cur.filter((p) => p.id !== pin.id)
      : [pin, ...cur].slice(0, MAX_PINS);
    write(PIN_KEY, next);
  }, []);

  const remove = useCallback((id: string) => {
    write(
      PIN_KEY,
      read<Pin[]>(PIN_KEY, []).filter((p) => p.id !== id),
    );
  }, []);

  return { pins, isPinned, toggle, remove };
}

/** Mémorise une page visitée (le dashboard lui-même n'est pas compté). */
export function recordVisit(path: string) {
  if (path === "/" || path === "/login") return;
  const cur = read<RecentPage[]>(RECENT_KEY, []).filter((r) => r.path !== path);
  write(RECENT_KEY, [{ path, at: Date.now() }, ...cur].slice(0, MAX_RECENT));
}

export function useRecentPages(): RecentPage[] {
  return useStored<RecentPage[]>(RECENT_KEY, []);
}
