import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

/* Renvoie l'utilisateur de la session courante (ou null) depuis le cookie. */
export const runtime = "nodejs";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      email: session.email,
      name: session.name,
      role: session.role,
      provider: "credentials",
      since: session.since,
    },
  });
}
