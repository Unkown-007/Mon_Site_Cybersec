import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";
import { OWNER_EMAILS } from "@/lib/access";
import { clientIp, sameOrigin, forbiddenOrigin, rateLimit, tooManyRequests } from "@/lib/security";

/*
 * Envoi du code de récupération du coffre par email. Le destinataire est TOUJOURS
 * l'adresse du propriétaire (jamais une adresse fournie par le client) : on ne
 * peut donc pas exfiltrer le code ailleurs. Le code est généré côté client : le
 * serveur ne le voit que de passage, ne le stocke jamais. Si l'envoi d'email
 * n'est pas configuré (RESEND_API_KEY absent), on renvoie
 * { sent:false, reason:"not_configured" } et le client affiche le code à l'écran.
 */
export const runtime = "nodejs";

const FROM = process.env.VAULT_EMAIL_FROM || "UnknownX-077 <onboarding@resend.dev>";
// Destinataire fixe = le propriétaire du site (surchargeable par env).
const RECIPIENT = process.env.VAULT_RECOVERY_EMAIL || OWNER_EMAILS[0];

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const head = user.slice(0, 2);
  return `${head}${"•".repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();

  const session = await currentSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Anti-spam d'emails : 5 envois / heure par IP.
  const limit = await rateLimit({ key: `vault-mail:${clientIp(req)}`, limit: 5, windowSec: 3600 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const body = (await req.json().catch(() => ({}))) as {
    code?: unknown;
    context?: unknown;
  };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code || code.length < 8 || code.length > 64) {
    return NextResponse.json({ error: "Code invalide." }, { status: 400 });
  }
  const isReset = body.context === "reset";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ sent: false, reason: "not_configured" });
  }

  const subject = isReset
    ? "UnknownX-077 — code de récupération du coffre (réinitialisation)"
    : "UnknownX-077 — code de récupération de ton coffre";
  const html = `
    <div style="font-family:ui-monospace,Menlo,monospace;background:#0a0a12;color:#e6e6f0;padding:28px;border-radius:8px;max-width:480px;margin:auto">
      <p style="color:#00f5d4;letter-spacing:2px;font-size:12px;margin:0 0 16px">// VAULT // ZONE CLASSIFIÉE</p>
      <h2 style="margin:0 0 8px;font-size:18px">Code de récupération du coffre</h2>
      <p style="color:#9a9ab0;font-size:13px;line-height:1.6;margin:0 0 20px">
        Conserve ce code en lieu sûr. Il est le <strong>seul</strong> moyen de
        réinitialiser ton mot de passe maître sans perdre tes données. Personne,
        pas même l'administrateur du site, ne peut le régénérer.
      </p>
      <div style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#7b5cf0;background:#16161f;border:1px solid #2a2a3a;padding:18px;text-align:center;border-radius:6px">
        ${code}
      </div>
      <p style="color:#6a6a80;font-size:11px;margin:20px 0 0">
        Demandé pour le compte ${maskEmail(session.email)}. Si tu n'es pas à
        l'origine de cette action, change ton mot de passe maître.
      </p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: RECIPIENT, subject, html }),
    });
    if (!res.ok) {
      return NextResponse.json({ sent: false, reason: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ sent: true, to: maskEmail(RECIPIENT) });
  } catch {
    return NextResponse.json({ sent: false, reason: "send_failed" }, { status: 502 });
  }
}
