"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Panel, Button, Badge } from "@/components/ui";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export default function AiPage() {
  const [apiKey, setApiKey, hydrated] = useLocalStorage<string>("ux077:anthropic-key", "");
  const [keyDraft, setKeyDraft] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  const hasKey = hydrated && apiKey.trim().length > 0;

  const send = async () => {
    const text = draft.trim();
    if (!text || busy || !hasKey) return;
    setError(null);
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    setStreaming("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json", "x-anthropic-key": apiKey },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? `Erreur (${res.status}).`);
        setStreaming(null);
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const ev = JSON.parse(data) as {
              type?: string;
              delta?: { type?: string; text?: string };
              error?: { message?: string };
            };
            if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
              acc += ev.delta.text ?? "";
              setStreaming(acc);
            } else if (ev.type === "error") {
              setError(ev.error?.message ?? "Erreur de flux.");
            }
          } catch {
            /* ligne SSE partielle/non-JSON : ignorée */
          }
        }
      }

      setMessages((m) => [...m, { role: "assistant", content: acc || "[ réponse vide ]" }]);
    } catch {
      setError("Connexion interrompue.");
    } finally {
      setStreaming(null);
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        code="AI // ASSISTANT"
        title="Assistant IA"
        desc="Chat Claude pour la cybersécurité — pédagogie, CVE, write-ups, déchiffrage de commandes."
        right={<Badge variant={hasKey ? "success" : "neutral"} dot>{hasKey ? "clé OK" : "clé requise"}</Badge>}
      />

      {/* Clé API — focal tant qu'elle manque */}
      {!hasKey ? (
        <Panel code="CONFIG" title="Connecte ta clé Anthropic" focal>
          <p className="text-body-sm text-muted">
            Le chat utilise <span className="text-ink">ta propre clé API Anthropic</span>. Elle est
            stockée uniquement dans ton navigateur (localStorage) et n&apos;est jamais enregistrée sur
            le serveur — elle ne sert qu&apos;à relayer tes messages vers Anthropic.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-ant-…"
              spellCheck={false}
              autoComplete="off"
              className="field flex-1"
              aria-label="Clé API Anthropic"
            />
            <Button variant="signal" onClick={() => apiKeyCommit(keyDraft, setApiKey, setKeyDraft)}>
              Enregistrer
            </Button>
          </div>
          <p className="mt-3 text-label text-muted">
            Obtiens une clé sur console.anthropic.com → API Keys.
          </p>
        </Panel>
      ) : (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="label">Session locale</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setApiKey("");
              setMessages([]);
              setKeyDraft("");
            }}
          >
            Oublier la clé
          </Button>
        </div>
      )}

      {hasKey && (
        <Panel className="flex flex-col">
          <div
            ref={scrollRef}
            className="max-h-[55vh] min-h-[16rem] space-y-4 overflow-y-auto pr-1"
          >
            {messages.length === 0 && !streaming ? (
              <p className="font-mono text-body-sm text-muted">
                [ pose ta question — ex. « explique CVE-2021-44228 », « que fait cette commande nmap ? » ]
              </p>
            ) : null}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {streaming !== null && <Bubble role="assistant" content={streaming || "…"} live />}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="mt-4 flex items-end gap-3 border-t border-line-subtle pt-4"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Message… (Entrée pour envoyer, Maj+Entrée = nouvelle ligne)"
              rows={2}
              spellCheck={false}
              className="field flex-1 resize-y"
              aria-label="Message"
              disabled={busy}
            />
            <Button variant="signal" type="submit" disabled={busy || !draft.trim()}>
              {busy ? "…" : "Envoyer"}
            </Button>
          </form>

          {error && <p className="mt-3 font-mono text-body-sm text-danger">⚠ {error}</p>}
        </Panel>
      )}
    </div>
  );
}

function apiKeyCommit(
  draft: string,
  setApiKey: (v: string) => void,
  setKeyDraft: (v: string) => void,
) {
  const k = draft.trim();
  if (k) {
    setApiKey(k);
    setKeyDraft("");
  }
}

function Bubble({
  role,
  content,
  live,
}: {
  role: "user" | "assistant";
  content: string;
  live?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[85%] rounded-md border px-3 py-2",
          isUser ? "border-primary/40 bg-primary/5" : "border-line bg-base",
        ].join(" ")}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className={`label ${isUser ? "text-primary" : "text-secondary"}`}>
            {isUser ? "TOI" : "CLAUDE"}
          </span>
          {live && <span className="cursor" aria-hidden />}
        </div>
        <p className="whitespace-pre-wrap break-words text-body-sm text-ink">{content}</p>
      </div>
    </div>
  );
}
