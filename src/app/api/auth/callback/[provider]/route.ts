import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  providerConfig,
  exchangeAndFetchUser,
  isAllowed,
  roleFor,
  type OAuthProvider,
} from "@/lib/oauth";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

/* Callback OAuth : échange le code, récupère le profil, ouvre la session. */
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
  if (!isAllowed(user.email)) return fail("not_allowed");

  const token = await signSession({
    email: user.email,
    name: user.name,
    role: roleFor(user.email),
  });

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
