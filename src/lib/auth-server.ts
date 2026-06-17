import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, type VerifiedSession } from "@/lib/session";

/* Helpers serveur pour les route handlers : lire / exiger la session. */

export async function currentSession(): Promise<VerifiedSession | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<VerifiedSession | null> {
  const s = await currentSession();
  return s && s.role === "admin" ? s : null;
}
