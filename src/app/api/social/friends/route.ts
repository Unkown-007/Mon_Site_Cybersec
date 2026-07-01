import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { sameOrigin, forbiddenOrigin, clientIp, rateLimit, tooManyRequests } from "@/lib/security";
import { friendsOf, requestFriend, acceptFriend, declineFriend, removeFriend } from "@/lib/social";
import { kvReady } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  return NextResponse.json({ kvReady, ...(await friendsOf(s.email)) });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!kvReady) return NextResponse.json({ error: "Base non connectée." }, { status: 503 });

  const limit = await rateLimit({ key: `friend:${clientIp(req)}`, limit: 40, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const b = (await req.json().catch(() => ({}))) as { action?: unknown; email?: unknown };
  const email = typeof b.email === "string" ? b.email : "";
  const action = b.action;

  if (action === "request") {
    const r = await requestFriend(s.email, email);
    return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 400 });
  }
  if (action === "accept") {
    await acceptFriend(s.email, email);
    return NextResponse.json({ ok: true });
  }
  if (action === "decline") {
    await declineFriend(s.email, email);
    return NextResponse.json({ ok: true });
  }
  if (action === "remove") {
    await removeFriend(s.email, email);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
