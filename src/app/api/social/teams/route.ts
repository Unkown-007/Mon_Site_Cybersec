import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { sameOrigin, forbiddenOrigin, clientIp, rateLimit, tooManyRequests } from "@/lib/security";
import { getAccount } from "@/lib/users";
import { listTeams, createTeam, joinTeam, leaveTeam, teamWithMembers } from "@/lib/social";
import { kvReady } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const acc = await getAccount(s.email);
  const myTeam = acc?.teamId ? await teamWithMembers(acc.teamId) : null;
  return NextResponse.json({ kvReady, myTeam, teams: await listTeams() });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!kvReady) return NextResponse.json({ error: "Base non connectée (Vercel KV requis)." }, { status: 503 });

  const limit = await rateLimit({ key: `team:${clientIp(req)}`, limit: 20, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const b = (await req.json().catch(() => ({}))) as { action?: unknown; name?: unknown; tag?: unknown; id?: unknown };

  if (b.action === "create") {
    const r = await createTeam(s.email, String(b.name ?? ""), String(b.tag ?? ""));
    return r.ok ? NextResponse.json({ ok: true, team: r.team }) : NextResponse.json({ error: r.error }, { status: 400 });
  }
  if (b.action === "join") {
    const r = await joinTeam(s.email, String(b.id ?? ""));
    return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 400 });
  }
  if (b.action === "leave") {
    await leaveTeam(s.email);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
