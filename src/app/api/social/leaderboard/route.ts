import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { leaderboard } from "@/lib/social";
import { kvReady } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  return NextResponse.json({ kvReady, me: s.email.toLowerCase(), rows: await leaderboard() });
}
