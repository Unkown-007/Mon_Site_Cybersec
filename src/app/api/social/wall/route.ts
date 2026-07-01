import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { sameOrigin, forbiddenOrigin, clientIp, rateLimit, tooManyRequests } from "@/lib/security";
import { getAccount } from "@/lib/users";
import { getWall, postWall, deleteWall } from "@/lib/social";
import { kvReady } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const acc = await getAccount(s.email);
  return NextResponse.json({ kvReady, messages: acc?.teamId ? await getWall(acc.teamId) : [] });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!kvReady) return NextResponse.json({ error: "Base non connectée." }, { status: 503 });

  const limit = await rateLimit({ key: `wall:${clientIp(req)}`, limit: 40, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const acc = await getAccount(s.email);
  if (!acc?.teamId) return NextResponse.json({ error: "Tu n'es dans aucune équipe." }, { status: 400 });

  const b = (await req.json().catch(() => ({}))) as { action?: unknown; text?: unknown; id?: unknown };
  if (b.action === "delete") {
    return NextResponse.json({ messages: await deleteWall(acc.teamId, String(b.id ?? ""), s.email) });
  }
  return NextResponse.json({ messages: await postWall(acc.teamId, s.email, String(b.text ?? "")) });
}
