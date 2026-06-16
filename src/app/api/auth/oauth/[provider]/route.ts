import { NextResponse } from "next/server";
import { providerConfig } from "@/lib/oauth";

/* Démarre le flux OAuth : redirige l'utilisateur vers GitHub / Google. */
export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "ux077_oauth_state";

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const { provider } = params;
  const origin = new URL(req.url).origin;
  const cfg = providerConfig(provider);

  if (!cfg || !cfg.clientId || !cfg.clientSecret) {
    return NextResponse.redirect(
      new URL(`/login?error=oauth_not_configured&provider=${provider}`, origin),
    );
  }

  const state = crypto.randomUUID();
  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  const authUrl = new URL(cfg.authUrl);
  authUrl.searchParams.set("client_id", cfg.clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", cfg.scope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("response_type", "code");
  if (provider === "google") {
    authUrl.searchParams.set("access_type", "online");
    authUrl.searchParams.set("prompt", "select_account");
  }

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
