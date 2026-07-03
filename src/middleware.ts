import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

/*
 * Protection des routes CÔTÉ SERVEUR. Un visiteur sans session valide est
 * redirigé vers /login avant même que la page protégée ne soit rendue
 * (impossible à contourner côté client). Les visiteurs déjà connectés qui
 * vont sur /login sont renvoyés au dashboard.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (pathname === "/login") {
    if (session) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Protège toutes les pages SAUF : routes API, assets Next, fichiers statiques.
  // (/login est inclus pour gérer la redirection des utilisateurs déjà connectés.)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpe?g|gif|svg|webp|ico|txt|xml|json|webmanifest|mp3|woff2?)).*)",
  ],
};
