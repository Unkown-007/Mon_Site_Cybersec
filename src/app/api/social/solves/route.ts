import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { sameOrigin, forbiddenOrigin, clientIp, rateLimit, tooManyRequests } from "@/lib/security";
import { addSolve, removeSolve } from "@/lib/social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const limit = await rateLimit({ key: `solve:${clientIp(req)}`, limit: 40, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const b = (await req.json().catch(() => ({}))) as { name?: unknown; points?: unknown; cat?: unknown };
  const name = typeof b.name === "string" ? b.name : "";
  if (!name.trim()) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  const account = await addSolve(s.email, {
    name,
    points: Number(b.points) || 0,
    cat: typeof b.cat === "string" ? b.cat : undefined,
  });
  if (!account) return NextResponse.json({ error: "Base non connectée." }, { status: 503 });
  return NextResponse.json({ account });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const at = Number(new URL(req.url).searchParams.get("at"));
  if (!at) return NextResponse.json({ error: "at requis." }, { status: 400 });
  const account = await removeSolve(s.email, at);
  return NextResponse.json({ account });
}
