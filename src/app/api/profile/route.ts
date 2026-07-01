import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { sameOrigin, forbiddenOrigin, clientIp, rateLimit, tooManyRequests } from "@/lib/security";
import { getAccount, updateProfile } from "@/lib/users";
import { kvReady } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const account = await getAccount(s.email);
  return NextResponse.json({
    kvReady,
    session: { email: s.email, name: s.name, role: s.role },
    account,
  });
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const s = await currentSession();
  if (!s) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const limit = await rateLimit({ key: `profile:${clientIp(req)}`, limit: 30, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const updated = await updateProfile(s.email, body);
  if (!updated) {
    return NextResponse.json(
      { error: "Base de données non connectée (Vercel KV requis pour le profil)." },
      { status: 503 },
    );
  }
  return NextResponse.json({ account: updated });
}
