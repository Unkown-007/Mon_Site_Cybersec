import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { isCollection, listItems, addItem, deleteItem } from "@/lib/collections";
import { kvReady } from "@/lib/kv";
import { sameOrigin, forbiddenOrigin } from "@/lib/security";

/* API générique des collections : liste publique + ajout/suppression admin. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function GET(_req: Request, { params }: { params: { collection: string } }) {
  if (!isCollection(params.collection)) return NextResponse.json({ items: [], kvReady });
  return NextResponse.json({ kvReady, items: await listItems(params.collection) });
}

export async function POST(req: Request, { params }: { params: { collection: string } }) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!isCollection(params.collection)) return NextResponse.json({ error: "collection inconnue" }, { status: 400 });
  if (!kvReady) {
    return NextResponse.json(
      { error: "Base de données non connectée (Vercel KV)." },
      { status: 503 },
    );
  }

  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }

  const title = str(b.title);
  if (!title) return NextResponse.json({ error: "titre requis" }, { status: 400 });

  const tags = Array.isArray(b.tags)
    ? b.tags.map(String).map((t) => t.trim()).filter(Boolean)
    : str(b.tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  const meta: Record<string, string> = {};
  if (b.meta && typeof b.meta === "object") {
    for (const [k, v] of Object.entries(b.meta as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) meta[k] = v.trim();
    }
  }

  const item = await addItem(params.collection, {
    title,
    url: str(b.url) || undefined,
    category: str(b.category) || undefined,
    description: typeof b.description === "string" ? b.description : "",
    tags,
    meta,
    addedBy: admin.email,
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request, { params }: { params: { collection: string } }) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!isCollection(params.collection)) return NextResponse.json({ error: "collection inconnue" }, { status: 400 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await deleteItem(params.collection, id);
  return NextResponse.json({ ok: true });
}
