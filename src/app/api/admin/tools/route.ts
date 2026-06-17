import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { addTool, deleteTool } from "@/lib/toolstore";
import { kvReady } from "@/lib/kv";

/* CRUD outils (admin) : ajouter (avec doc) + supprimer. */
export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
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

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const url = typeof b.url === "string" ? b.url.trim() : "";
  if (!name || !url) return NextResponse.json({ error: "nom et url requis" }, { status: 400 });

  const rawTags = typeof b.tags === "string" ? b.tags : "";
  const tool = await addTool({
    name,
    url,
    category: typeof b.category === "string" && b.category.trim() ? b.category.trim() : "Autre",
    description: typeof b.description === "string" ? b.description : "",
    command: typeof b.command === "string" && b.command.trim() ? b.command.trim() : undefined,
    tags: rawTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    addedBy: admin.email,
  });
  return NextResponse.json({ tool });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await deleteTool(id);
  return NextResponse.json({ ok: true });
}
