"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Panel, Button, Badge } from "@/components/ui";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const PROVIDERS = [
  {
    id: "anthropic",
    label: "Claude",
    placeholder: "sk-ant-…",
    help: "console.anthropic.com → API Keys",
    models: [
      { id: "claude-opus-4-8", label: "Opus 4.8" },
      { id: "claude-sonnet-4-6", label: "Sonnet 4.6" },
      { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
    ],
  },
  {
    id: "openai",
    label: "ChatGPT",
    placeholder: "sk-…",
    help: "platform.openai.com → API keys",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
    ],
  },
  {
    id: "google",
    label: "Gemini",
    placeholder: "AIza…",
    help: "aistudio.google.com → Get API key",
    models: [
      { id: "gemini-2.5-flash", label: "2.5 Flash" },
      { id: "gemini-2.5-pro", label: "2.5 Pro" },
      { id: "gemini-2.5-flash-lite", label: "2.5 Flash-Lite" },
    ],
  },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

export default function AiPage() {
  const [provider, setProvider] = useLocalStorage<ProviderId>("ux077:ai-provider", "anthropic");
  const [keys, setKeys, hydrated] = useLocalStorage<Record<string, string>>("ux077:ai-keys", {});
  const [models, setModels] = useLocalStorage<Record<string, string>>("ux077:ai-models", {});
  const [keyDraft, setKeyDraft] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const meta = PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];
  const apiKey = keys[provider] ?? "";
  const hasKey = hydrated && apiKey.trim().length > 0;
  const modelIds = meta.models.map((m) => m.id) as readonly string[];
  const model = modelIds.includes(models[provider]) ? models[provider] : meta.models[0].id;
  const modelLabel = meta.models.find((m) => m.id === model)?.label ?? model;

  // Migration : récupère l'ancienne clé Anthropic stockée séparément.
  useEffect(() => {
    if (!hydrated || keys.anthropic) return;
    try {
      const raw = localStorage.getItem("ux077:anthropic-key");
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v === "string" && v.trim()) setKeys({ ...keys, anthropic: v });
      }
    } catch {
      /* rien à migrer */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  const commitKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    setKeys({ ...keys, [provider]: k });
    setKeyDraft("");
  };

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
        headers: { "content-type": "application/json", "x-ai-key": apiKey },
        body: JSON.stringify({ provider, model, messages: next }),
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
            const ev = JSON.parse(data) as { text?: string; error?: string };
            if (ev.text) {
              acc += ev.text;
              setStreaming(acc);
            } else if (ev.error) {
              setError(ev.error);
            }
          } catch {
            /* ligne SSE partielle : ignorée */
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
        desc="Chat multi-modèles (Claude · ChatGPT · Gemini) pour la cybersécurité — pédagogie, CVE, write-ups, déchiffrage de commandes."
        right={<Badge variant={hasKey ? "success" : "neutral"} dot>{hasKey ? "clé OK" : "clé requise"}</Badge>}
      />

      {/* Sélecteur de fournisseur + modèle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="label !text-muted mb-2 block">Fournisseur</span>
          <div className="flex flex-wrap items-center gap-2">
            {PROVIDERS.map((p) => {
              const active = provider === p.id;
              const configured = (keys[p.id] ?? "").trim().length > 0;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id);
                    setKeyDraft("");
                    setError(null);
                  }}
                  className={`hud-tab hud-tab--chip flex items-center gap-2 px-3 py-1.5 font-mono text-xs ${
                    active ? "is-active text-secondary" : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {p.label}
                    {configured && <span className="h-1.5 w-1.5 rounded-full bg-success" aria-label="configuré" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <label className="block sm:w-52">
          <span className="label !text-muted mb-2 block">Modèle {meta.label}</span>
          <select
            value={model}
            onChange={(e) => setModels({ ...models, [provider]: e.target.value })}
            className="field"
            aria-label={`Modèle ${meta.label}`}
          >
            {meta.models.map((m) => (
              <option key={m.id} value={m.id} className="bg-surface">
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Clé API du fournisseur sélectionné */}
      {!hasKey ? (
        <Panel code="CONFIG" title={`Connecte ta clé ${meta.label}`} focal>
          <p className="text-body-sm text-muted">
            Le chat utilise <span className="text-ink">ta propre clé API {meta.label}</span>. Elle est
            stockée uniquement dans ton navigateur (localStorage), jamais sur le serveur — elle ne sert
            qu&apos;à relayer tes messages vers {meta.label}.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitKey();
            }}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder={meta.placeholder}
              spellCheck={false}
              autoComplete="off"
              className="field flex-1"
              aria-label={`Clé API ${meta.label}`}
            />
            <Button variant="signal" type="submit">
              Enregistrer
            </Button>
          </form>
          <p className="mt-3 text-label text-muted">Obtiens une clé sur {meta.help}.</p>
        </Panel>
      ) : (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="label">
            {meta.label} · {modelLabel}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setKeys({ ...keys, [provider]: "" });
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
          <div ref={scrollRef} className="max-h-[55vh] min-h-[16rem] space-y-4 overflow-y-auto pr-1">
            {messages.length === 0 && !streaming ? (
              <p className="font-mono text-body-sm text-muted">
                [ pose ta question — ex. « explique CVE-2021-44228 », « que fait cette commande nmap ? » ]
              </p>
            ) : null}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} botLabel={meta.label} />
            ))}
            {streaming !== null && <Bubble role="assistant" content={streaming || "…"} botLabel={meta.label} live />}
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

function Bubble({
  role,
  content,
  botLabel,
  live,
}: {
  role: "user" | "assistant";
  content: string;
  botLabel: string;
  live?: boolean;
}) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[85%] clip-chamfer border px-3.5 py-2.5 select-text",
          isUser ? "border-primary/40 bg-primary/5" : "border-line bg-surface/70",
        ].join(" ")}
      >
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className={`label ${isUser ? "text-primary" : "text-secondary"} flex items-center gap-2`}>
            {isUser ? "TOI" : botLabel.toUpperCase()}
            {live && <span className="cursor" aria-hidden />}
          </span>
          {content.trim() && !live && (
            <button
              onClick={copyAll}
              data-no-sfx
              className="shrink-0 font-mono text-[10px] uppercase tracking-[1px] text-muted transition-colors hover:text-secondary"
            >
              {copied ? "copié ✓" : "copier"}
            </button>
          )}
        </div>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-body text-ink-strong">{content}</p>
        ) : (
          <Markdown text={content} />
        )}
      </div>
    </div>
  );
}

/* ── Rendu Markdown léger (sans dépendance) : blocs de code, listes, gras, code inline ── */
type Block = { type: "code"; lang: string; code: string } | { type: "text"; text: string };

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  const re = /```([\w+-]*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) blocks.push({ type: "text", text: src.slice(last, m.index) });
    blocks.push({ type: "code", lang: m[1] || "", code: m[2].replace(/\n$/, "") });
    last = m.index + m[0].length;
  }
  if (last < src.length) blocks.push({ type: "text", text: src.slice(last) });
  return blocks;
}

function renderInline(str: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(str))) {
    if (m.index > last) nodes.push(str.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      nodes.push(
        <strong key={`${keyBase}-${k++}`} className="font-semibold text-ink-strong">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code
          key={`${keyBase}-${k++}`}
          className="rounded-sm border border-line bg-base px-1 py-0.5 font-mono text-[0.85em] text-secondary"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < str.length) nodes.push(str.slice(last));
  return nodes;
}

function TextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    const items = bullets;
    out.push(
      <ul key={`ul-${out.length}`} className="list-disc space-y-0.5 pl-5">
        {items.map((li, i) => (
          <li key={i}>{renderInline(li, `li-${out.length}-${i}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  lines.forEach((line, i) => {
    const t = line.trim();
    const bullet = t.match(/^[-*]\s+(.*)/);
    const head = t.match(/^#{1,6}\s+(.*)/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flush();
    if (t === "") return;
    if (head) {
      out.push(
        <p key={`h-${i}`} className="font-display text-ink-strong">
          {renderInline(head[1], `h-${i}`)}
        </p>,
      );
      return;
    }
    out.push(
      <p key={`p-${i}`} className="break-words">
        {renderInline(line, `p-${i}`)}
      </p>,
    );
  });
  flush();
  return <div className="space-y-2">{out}</div>;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="clip-chamfer overflow-hidden border border-line-strong bg-base/90">
      <div className="flex items-center justify-between border-b border-line bg-surface/70 px-3 py-1">
        <span className="label !text-muted">{lang || "code"}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          data-no-sfx
          className="font-mono text-[10px] uppercase tracking-[1px] text-muted transition-colors hover:text-secondary"
        >
          {copied ? "copié ✓" : "copier"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-[12.5px] leading-relaxed text-ink-strong">{code}</code>
      </pre>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="space-y-2.5 text-body leading-relaxed text-ink-strong">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <CodeBlock key={i} lang={b.lang} code={b.code} />
        ) : (
          <TextBlock key={i} text={b.text} />
        ),
      )}
    </div>
  );
}
