import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { recordLogin } from "@/lib/users";
import { clientIp, sameOrigin, forbiddenOrigin, rateLimit, tooManyRequests } from "@/lib/security";

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
// Aucun mot de passe réel en dur : requis par env en prod, repli générique en dev.
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "changeme-dev");

type Role = "admin" | "operator";
interface Cred {
  email: string;
  password: string;
  name: string;
  role: Role;
}

/*
 * Comptes credentials : l'admin (ADMIN_EMAIL/ADMIN_PASSWORD) + une liste
 * optionnelle d'opérateurs définie par la variable d'env EXTRA_LOGINS (JSON) :
 *   EXTRA_LOGINS=[{"email":"x@y","password":"…","name":"X","role":"operator"}]
 */
function credentialAccounts(): Cred[] {
  const list: Cred[] = [{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "ADMIN", role: "admin" }];
  const raw = process.env.EXTRA_LOGINS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { email?: unknown; password?: unknown; name?: unknown; role?: unknown }[];
      for (const e of Array.isArray(parsed) ? parsed : []) {
        if (typeof e.email === "string" && typeof e.password === "string" && e.email && e.password) {
          list.push({
            email: e.email,
            password: e.password,
            name: typeof e.name === "string" && e.name ? e.name : e.email.split("@")[0],
            role: e.role === "admin" ? "admin" : "operator",
          });
        }
      }
    } catch {
      /* EXTRA_LOGINS mal formé → ignoré */
    }
  }
  return list;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function POST(req: Request) {
  // Anti-CSRF : la requête doit provenir de notre origine.
  if (!sameOrigin(req)) return forbiddenOrigin();

  // Anti-bruteforce : plafond par IP (15/15 min) et par IP+email (6/15 min).
  const ip = clientIp(req);
  const ipLimit = await rateLimit({ key: `login:ip:${ip}`, limit: 15, windowSec: 900 });
  if (!ipLimit.ok) return tooManyRequests(ipLimit.retryAfter);

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Refus si l'auth n'est pas configurée en prod (pas de secret/mot de passe par défaut).
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.AUTH_SECRET || !process.env.ADMIN_PASSWORD)
  ) {
    return NextResponse.json(
      { error: "Authentification non configurée (AUTH_SECRET / ADMIN_PASSWORD)." },
      { status: 503 },
    );
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  const credLimit = await rateLimit({
    key: `login:cred:${ip}:${email.toLowerCase()}`,
    limit: 6,
    windowSec: 900,
  });
  if (!credLimit.ok) return tooManyRequests(credLimit.retryAfter);

  // Petit délai anti-bruteforce (atténue les tentatives en rafale).
  await new Promise((r) => setTimeout(r, 350));

  // Cherche un compte credentials correspondant (comparaison à temps constant).
  let matched: Cred | null = null;
  for (const acc of credentialAccounts()) {
    const emailOk = safeEqual(email.toLowerCase(), acc.email.toLowerCase());
    const passOk = acc.password.length > 0 && safeEqual(password, acc.password);
    if (emailOk && passOk) matched = acc;
  }

  if (!matched) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const user = { email: matched.email, name: matched.name, role: matched.role };
  // Enregistre le compte en base (création au 1er login, sinon MAJ).
  await recordLogin({
    email: matched.email,
    name: matched.name,
    provider: "credentials",
    defaultRole: matched.role,
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
