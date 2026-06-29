import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { listAccounts, updateAccount, type Account } from "@/lib/users";
import { isOwner } from "@/lib/access";
import { kvReady } from "@/lib/kv";
import { sameOrigin, forbiddenOrigin } from "@/lib/security";

/* Gestion des comptes (admin) : lister + changer rôle / statut. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ kvReady, users: await listAccounts() });
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 });
  if (isOwner(email)) {
    return NextResponse.json({ error: "le propriétaire ne peut pas être modifié" }, { status: 400 });
  }

  const patch: Partial<Pick<Account, "role" | "status">> = {};
  if (body.role === "admin" || body.role === "operator") patch.role = body.role;
  if (body.status === "active" || body.status === "banned") patch.status = body.status;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "rien à modifier" }, { status: 400 });
  }

  const updated = await updateAccount(email, patch);
  if (!updated) {
    return NextResponse.json(
      { error: "compte introuvable (base de données connectée ?)" },
      { status: 404 },
    );
  }
  return NextResponse.json({ user: updated });
}
