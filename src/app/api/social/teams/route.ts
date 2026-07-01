import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { sameOrigin, forbiddenOrigin, clientIp, rateLimit, tooManyRequests } from "@/lib/security";
import { getAccount } from "@/lib/users";
import {
  createTeam, joinTeam, leaveTeam, teamWithMembers, teamsLeaderboard,
  updateTeam, kickMember, transferCaptain, deleteTeam,
} from "@/lib/social";
import { kvReady } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const acc = await getAccount(s.email);
  const myTeam = acc?.teamId ? await teamWithMembers(acc.teamId) : null;
  const standings = await teamsLeaderboard();
  const myRank = acc?.teamId ? standings.findIndex((t) => t.team.id === acc.teamId) + 1 : 0;
  return NextResponse.json({ kvReady, me: s.email.toLowerCase(), myTeam, myRank, standings });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!kvReady) return NextResponse.json({ error: "Base non connectée (Vercel KV requis)." }, { status: 503 });

  const limit = await rateLimit({ key: `team:${clientIp(req)}`, limit: 30, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const b = (await req.json().catch(() => ({}))) as {
    action?: unknown; name?: unknown; tag?: unknown; id?: unknown; desc?: unknown; target?: unknown;
  };
  const acc = await getAccount(s.email);
  const teamId = acc?.teamId ?? "";
  const okJson = (r: { ok: boolean; error?: string; team?: unknown }) =>
    r.ok ? NextResponse.json(r) : NextResponse.json({ error: r.error }, { status: 400 });

  switch (b.action) {
    case "create":
      return okJson(await createTeam(s.email, String(b.name ?? ""), String(b.tag ?? "")));
    case "join":
      return okJson(await joinTeam(s.email, String(b.id ?? "")));
    case "leave":
      await leaveTeam(s.email);
      return NextResponse.json({ ok: true });
    case "update":
      return okJson(await updateTeam(teamId, s.email, { name: b.name ? String(b.name) : undefined, desc: typeof b.desc === "string" ? b.desc : undefined }));
    case "kick":
      return okJson(await kickMember(teamId, s.email, String(b.target ?? "")));
    case "transfer":
      return okJson(await transferCaptain(teamId, s.email, String(b.target ?? "")));
    case "delete":
      return okJson(await deleteTeam(teamId, s.email));
    default:
      return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  }
}
