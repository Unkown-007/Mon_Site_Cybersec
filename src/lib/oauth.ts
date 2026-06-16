import type { Role } from "@/lib/session";

/*
 * OAuth réel (GitHub + Google) — flux "authorization code" côté serveur.
 * Nécessite des OAuth apps déclarées chez les fournisseurs + variables d'env :
 *   GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
 *   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 * Optionnel : ALLOWED_EMAILS (liste blanche, séparée par des virgules) pour
 * n'autoriser que certains comptes — sinon tout compte valide peut se connecter.
 */

export type OAuthProvider = "github" | "google";

export interface ProviderCfg {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
}

export function providerConfig(p: string): ProviderCfg | null {
  if (p === "github") {
    return {
      authUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      scope: "read:user user:email",
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }
  if (p === "google") {
    return {
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scope: "openid email profile",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }
  return null;
}

export interface OAuthUser {
  email: string;
  name: string;
}

export async function exchangeAndFetchUser(
  provider: OAuthProvider,
  cfg: ProviderCfg,
  code: string,
  redirectUri: string,
): Promise<OAuthUser | null> {
  const tokRes = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: cfg.clientId!,
      client_secret: cfg.clientSecret!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokRes.ok) return null;
  const tok = (await tokRes.json()) as { access_token?: string };
  const accessToken = tok.access_token;
  if (!accessToken) return null;

  if (provider === "github") {
    const headers = {
      authorization: `Bearer ${accessToken}`,
      "user-agent": "UnknownX-077",
      accept: "application/vnd.github+json",
    };
    const uRes = await fetch("https://api.github.com/user", { headers });
    if (!uRes.ok) return null;
    const u = (await uRes.json()) as { login?: string; name?: string; email?: string | null };
    let email = u.email ?? null;
    if (!email) {
      const eRes = await fetch("https://api.github.com/user/emails", { headers });
      if (eRes.ok) {
        const emails = (await eRes.json()) as {
          email: string;
          primary: boolean;
          verified: boolean;
        }[];
        email =
          emails.find((e) => e.primary && e.verified)?.email ??
          emails.find((e) => e.verified)?.email ??
          null;
      }
    }
    if (!email) return null;
    return { email, name: u.name || u.login || email.split("@")[0] };
  }

  // Google
  const uRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!uRes.ok) return null;
  const u = (await uRes.json()) as { email?: string; email_verified?: boolean; name?: string };
  if (!u.email || u.email_verified === false) return null;
  return { email: u.email, name: u.name || u.email.split("@")[0] };
}

export function isAllowed(email: string): boolean {
  const list = process.env.ALLOWED_EMAILS;
  if (!list) return true; // aucune restriction définie
  return list
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export function roleFor(email: string): Role {
  const admin = (process.env.ADMIN_EMAIL || "admin@unknownx.local").toLowerCase();
  return email.toLowerCase() === admin ? "admin" : "operator";
}
