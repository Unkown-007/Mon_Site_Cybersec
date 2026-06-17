import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { recordLogin } from "@/lib/users";

/*
 * Connexion réelle : la vérification des identifiants se fait CÔTÉ SERVEUR
 * (impossible à contourner depuis le navigateur). En cas de succès, un cookie
 * de session signé (httpOnly) est posé.
 *
 * Identifiants définis par variables d'environnement Vercel :
 *   ADMIN_EMAIL, ADMIN_PASSWORD  (et AUTH_SECRET pour la signature)
 * Valeurs de repli en dev uniquement.
 */

export const runtime = "nodejs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@unknownx.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "akira2077";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  // Petit délai anti-bruteforce (atténue les tentatives en rafale).
  await new Promise((r) => setTimeout(r, 350));

  const ok =
    safeEqual(email.toLowerCase(), ADMIN_EMAIL.toLowerCase()) &&
    safeEqual(password, ADMIN_PASSWORD);

  if (!ok) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const user = { email: ADMIN_EMAIL, name: "ADMIN", role: "admin" as const };
  // Enregistre le compte admin en base (création au 1er login, sinon MAJ).
  await recordLogin({
    email: ADMIN_EMAIL,
    name: "ADMIN",
    provider: "credentials",
    defaultRole: "admin",
  });
  const token = await signSession(user);

  const res = NextResponse.json({
    user: { ...user, provider: "credentials", since: Date.now() },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
