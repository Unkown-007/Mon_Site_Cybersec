import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { providerConfig, exchangeAndFetchUser, type OAuthProvider } from "@/lib/oauth";
import { isAllowedEmail, defaultRoleFor, isOwner } from "@/lib/access";
import { recordLogin } from "@/lib/users";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

/* Callback OAuth : échange le code, récupère le profil, crée/ouvre le compte. */
export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "ux077_oauth_state";

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const provider = params.provider as OAuthProvider;
  const url = new URL(req.url);
  const origin = url.origin;
  const fail = (e: string) => NextResponse.redirect(new URL(`/login?error=${e}`, origin));

  const cfg = providerConfig(provider);
  if (!cfg || !cfg.clientId || !cfg.clientSecret) return fail("oauth_not_configured");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) return fail("oauth_denied");

  // Vérif anti-CSRF : le state doit correspondre au cookie posé au départ.
  const saved = cookies().get(OAUTH_STATE_COOKIE)?.value;
  if (!state || !saved || state !== saved) return fail("bad_state");

  const redirectUri = `${origin}/api/auth/callback/${provider}`;
  const user = await exchangeAndFetchUser(provider, cfg, code, redirectUri);
  if (!user) return fail("oauth_failed");
  if (!isAllowedEmail(user.email)) return fail("not_allowed");

  // Crée le compte au 1er login, sinon met à jour. Le rôle stocké prime
  // (permet à l'admin de promouvoir / rétrograder) ; le propriétaire est
  // toujours admin.
  const account = await recordLogin({
    email: user.email,
    name: user.name,
    provider,
    defaultRole: defaultRoleFor(user.email),
  });
  if (account.status === "banned") return fail("banned");

  const role = isOwner(user.email) ? "admin" : account.role;
  const token = await signSession({ email: user.email, name: user.name, role });

  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
