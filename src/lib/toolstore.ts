import { kvReady, kvGet, kvSet, kvDel, kvSadd, kvSrem, kvSmembers } from "@/lib/kv";

/*
 * Outils ajoutés par l'admin (persistés en Vercel KV). L'admin peut en
 * ajouter, les documenter et les supprimer ; ils s'affichent publiquement
 * sur la page /tools.
 */

export interface AdminTool {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string; // documentation libre (markdown léger / texte)
  command?: string;
  tags: string[];
  addedBy: string;
  addedAt: number;
}

const keyFor = (id: string) => `tool:${id}`;
const SET = "tools";

export async function listTools(): Promise<AdminTool[]> {
  if (!kvReady) return [];
  const ids = (await kvSmembers(SET)) ?? [];
  const out: AdminTool[] = [];
  for (const id of ids) {
    const raw = await kvGet(keyFor(id));
    if (raw)
      try {
        out.push(JSON.parse(raw) as AdminTool);
      } catch {
        /* ignore */
      }
  }
  return out.sort((a, b) => b.addedAt - a.addedAt);
}

export async function addTool(
  input: Omit<AdminTool, "id" | "addedAt">,
): Promise<AdminTool | null> {
  if (!kvReady) return null;
  const tool: AdminTool = { ...input, id: crypto.randomUUID(), addedAt: Date.now() };
  await kvSet(keyFor(tool.id), JSON.stringify(tool));
  await kvSadd(SET, tool.id);
  return tool;
}

export async function deleteTool(id: string): Promise<boolean> {
  if (!kvReady) return false;
  await kvDel(keyFor(id));
  await kvSrem(SET, id);
  return true;
}
