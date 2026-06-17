import { kvReady, kvGet, kvSet, kvDel, kvSadd, kvSrem, kvSmembers } from "@/lib/kv";

/*
 * Collections génériques persistées (Vercel KV) — items ajoutés par l'admin
 * directement dans chaque section du site (resources, write-ups, outils,
 * hardware). Un seul modèle d'item flexible : champs communs + meta libre.
 */

export const COLLECTIONS = ["resources", "writeups", "tools", "hardware"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export function isCollection(c: string): c is Collection {
  return (COLLECTIONS as readonly string[]).includes(c);
}

export interface Item {
  id: string;
  collection: Collection;
  title: string;
  url?: string;
  category?: string;
  description?: string;
  tags: string[];
  meta: Record<string, string>;
  addedBy: string;
  addedAt: number;
}

const itemKey = (c: Collection, id: string) => `item:${c}:${id}`;
const setKey = (c: Collection) => `items:${c}`;

export async function listItems(c: Collection): Promise<Item[]> {
  if (!kvReady) return [];
  const ids = (await kvSmembers(setKey(c))) ?? [];
  const out: Item[] = [];
  for (const id of ids) {
    const raw = await kvGet(itemKey(c, id));
    if (raw)
      try {
        out.push(JSON.parse(raw) as Item);
      } catch {
        /* ignore */
      }
  }
  return out.sort((a, b) => b.addedAt - a.addedAt);
}

export async function addItem(
  c: Collection,
  data: Omit<Item, "id" | "collection" | "addedAt">,
): Promise<Item | null> {
  if (!kvReady) return null;
  const item: Item = { ...data, id: crypto.randomUUID(), collection: c, addedAt: Date.now() };
  await kvSet(itemKey(c, item.id), JSON.stringify(item));
  await kvSadd(setKey(c), item.id);
  return item;
}

export async function deleteItem(c: Collection, id: string): Promise<boolean> {
  if (!kvReady) return false;
  await kvDel(itemKey(c, id));
  await kvSrem(setKey(c), id);
  return true;
}
