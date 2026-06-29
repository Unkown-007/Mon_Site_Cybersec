import { NextResponse } from "next/server";

/*
 * Proxy de chat IA (Claude / Anthropic) — modèle "bring your own key".
 * La clé API arrive dans l'en-tête x-anthropic-key, est utilisée UNE fois pour
 * relayer la requête vers Anthropic, et n'est JAMAIS journalisée ni stockée
 * côté serveur. Réponse en streaming (SSE) pour éviter les timeouts.
 * Appel REST direct (pas de dépendance SDK ajoutée).
 */

import { clientIp, sameOrigin, forbiddenOrigin, rateLimit, tooManyRequests } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `Tu es l'assistant IA de UnknownX-077, une plateforme personnelle de cybersécurité (apprentissage, CTF, pentest autorisé, défense).
Réponds en français, de façon technique, claire et concise. Formate en Markdown léger (listes, blocs de code).
Cadre éducatif et défensif : tu peux expliquer des concepts offensifs (CVE, techniques, payloads publics de référence) à but pédagogique et pour du pentest autorisé / CTF / labo. Refuse d'aider à attaquer des systèmes tiers sans autorisation, et rappelle le cadre légal si besoin.`;

interface InMsg {
  role?: unknown;
  content?: unknown;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();

  // Anti-abus du proxy : 30 requêtes / 5 min par IP.
  const limit = await rateLimit({ key: `ai:${clientIp(req)}`, limit: 30, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const key = req.headers.get("x-anthropic-key");
  if (!key) {
    return NextResponse.json({ error: "Clé API Anthropic manquante." }, { status: 401 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? (body.messages as InMsg[]) : [];
  // On ne garde que les 20 derniers tours, role + texte (anti-injection de champs).
  const messages = raw
    .slice(-20)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: typeof m.content === "string" ? m.content : String(m.content ?? ""),
    }))
    .filter((m) => m.content.trim().length > 0);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Aucun message." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        stream: true,
        messages,
      }),
    });
  } catch {
    return NextResponse.json({ error: "Anthropic injoignable." }, { status: 502 });
  }

  if (!res.ok || !res.body) {
    let detail = "";
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      detail = j.error?.message ?? "";
    } catch {
      /* ignore */
    }
    const msg =
      res.status === 401
        ? "Clé API refusée par Anthropic."
        : `Erreur API Anthropic (${res.status}).`;
    return NextResponse.json({ error: detail ? `${msg} ${detail}` : msg }, { status: res.status });
  }

  // Passthrough du flux SSE Anthropic vers le client.
  return new Response(res.body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      connection: "keep-alive",
    },
  });
}
