import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { sameOrigin, forbiddenOrigin, clientIp, rateLimit, tooManyRequests } from "@/lib/security";
import { getAccount } from "@/lib/users";
import { getTasks, addTask, updateTask, removeTask, type TaskStatus } from "@/lib/social";
import { kvReady } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const acc = await getAccount(s.email);
  const teamId = acc?.teamId;
  return NextResponse.json({ kvReady, teamId: teamId ?? null, tasks: teamId ? await getTasks(teamId) : [] });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!kvReady) return NextResponse.json({ error: "Base non connectée." }, { status: 503 });

  const limit = await rateLimit({ key: `task:${clientIp(req)}`, limit: 60, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const acc = await getAccount(s.email);
  const teamId = acc?.teamId;
  if (!teamId) return NextResponse.json({ error: "Tu n'es dans aucune équipe." }, { status: 400 });

  const b = (await req.json().catch(() => ({}))) as {
    action?: unknown; title?: unknown; id?: unknown; status?: unknown; assignee?: unknown;
  };

  if (b.action === "add") {
    return NextResponse.json({ tasks: await addTask(teamId, String(b.title ?? ""), s.email) });
  }
  if (b.action === "update") {
    const patch: { status?: TaskStatus; assignee?: string } = {};
    if (b.status === "todo" || b.status === "doing" || b.status === "done") patch.status = b.status;
    if (typeof b.assignee === "string") patch.assignee = b.assignee;
    return NextResponse.json({ tasks: await updateTask(teamId, String(b.id ?? ""), patch) });
  }
  if (b.action === "remove") {
    return NextResponse.json({ tasks: await removeTask(teamId, String(b.id ?? "")) });
  }
  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
