import { NextResponse } from "next/server";
import { clientIp, sameOrigin, forbiddenOrigin, rateLimit, tooManyRequests } from "@/lib/security";

/*
 * Proxy de chat IA multi-fournisseurs — modèle "bring your own key".
 * Fournisseurs : Anthropic (Claude), OpenAI (ChatGPT), Google (Gemini).
 * La clé arrive dans l'en-tête x-ai-key, sert une fois à relayer la requête,
 * et n'est JAMAIS journalisée ni stockée. Chaque flux fournisseur est NORMALISÉ
 * côté serveur en un SSE unique : `data: {"text":"…"}` + `data: [DONE]`.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

type Provider = "anthropic" | "openai" | "google";

const SYSTEM_PROMPT = `Tu es l'assistant IA de UnknownX-077, une plateforme personnelle de cybersécurité (apprentissage, CTF, pentest autorisé, défense).
Réponds en français, de façon technique, claire et concise. Formate en Markdown léger (listes, blocs de code).
Cadre éducatif et défensif : tu peux expliquer des concepts offensifs (CVE, techniques, payloads publics de référence) à but pédagogique et pour du pentest autorisé / CTF / labo. Refuse d'aider à attaquer des systèmes tiers sans autorisation, et rappelle le cadre légal si besoin.`;

// Modèles par défaut (les plus capables/récents au moment du build).
const MODELS: Record<Provider, string> = {
  anthropic: "claude-opus-4-8",
  openai: "gpt-4o",
  google: "gemini-2.0-flash",
};

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Upstream {
  url: string;
  headers: Record<string, string>;
  body: string;
}

function buildUpstream(provider: Provider, key: string, messages: Msg[]): Upstream {
  if (provider === "openai") {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: MODELS.openai,
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    };
  }
  if (provider === "google") {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.google}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    };
  }
  // anthropic
  return {
    url: "https://api.anthropic.com/v1/messages",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODELS.anthropic,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      stream: true,
      messages,
    }),
  };
}

// Extrait le fragment de texte d'un évènement SSE selon le fournisseur.
function extractText(provider: Provider, ev: unknown): string {
  const o = ev as Record<string, unknown>;
  if (provider === "openai") {
    const choices = o.choices as { delta?: { content?: string } }[] | undefined;
    return choices?.[0]?.delta?.content ?? "";
  }
  if (provider === "google") {
    const cand = o.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined;
    return (cand?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  }
  // anthropic
  if (o.type === "content_block_delta") {
    const d = o.delta as { type?: string; text?: string } | undefined;
    if (d?.type === "text_delta") return d.text ?? "";
  }
  return "";
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();

  const limit = await rateLimit({ key: `ai:${clientIp(req)}`, limit: 30, windowSec: 300 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const key = req.headers.get("x-ai-key");
  if (!key) return NextResponse.json({ error: "Clé API manquante." }, { status: 401 });

  let body: { provider?: unknown; messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const provider: Provider =
    body.provider === "openai" || body.provider === "google" ? body.provider : "anthropic";

  const raw = Array.isArray(body.messages) ? (body.messages as { role?: unknown; content?: unknown }[]) : [];
  const messages: Msg[] = raw
    .slice(-20)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: typeof m.content === "string" ? m.content : String(m.content ?? ""),
    }))
    .filter((m) => m.content.trim().length > 0);

  if (messages.length === 0) return NextResponse.json({ error: "Aucun message." }, { status: 400 });

  const up = buildUpstream(provider, key, messages);

  let res: Response;
  try {
    res = await fetch(up.url, { method: "POST", headers: up.headers, body: up.body });
  } catch {
    return NextResponse.json({ error: "Fournisseur IA injoignable." }, { status: 502 });
  }

  if (!res.ok || !res.body) {
    let detail = "";
    try {
      const j = (await res.json()) as { error?: { message?: string } | string };
      detail = typeof j.error === "string" ? j.error : j.error?.message ?? "";
    } catch {
      /* ignore */
    }
    const msg =
      res.status === 401 || res.status === 403
        ? "Clé API refusée par le fournisseur."
        : `Erreur API (${res.status}).`;
    return NextResponse.json({ error: detail ? `${msg} ${detail}` : msg }, { status: res.status });
  }

  // Normalisation du flux fournisseur → SSE unifié `data: {"text":"…"}`.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const text = extractText(provider, JSON.parse(data));
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        } catch {
          /* ligne partielle / non-JSON */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      connection: "keep-alive",
    },
  });
}
