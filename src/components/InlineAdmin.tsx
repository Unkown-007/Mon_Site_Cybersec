"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";

/*
 * Bloc d'édition en contexte : affiche les items d'une collection et, pour
 * l'admin, un bouton « + Ajouter » (ouvre une fenêtre) + suppression par item.
 * Réutilisable sur n'importe quelle page via un schéma de champs.
 */

export interface FieldDef {
  name: string; // title | url | category | description | tags | (clé meta)
  label: string;
  kind?: "text" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface Item {
  id: string;
  title: string;
  url?: string;
  category?: string;
  description?: string;
  tags: string[];
  meta: Record<string, string>;
}

const TOP = new Set(["title", "url", "category", "description", "tags"]);

export function InlineAdmin({
  collection,
  heading,
  fields,
  accent = "secondary",
}: {
  collection: string;
  heading: string;
  fields: FieldDef[];
  accent?: "secondary" | "primary";
}) {
  const { user } = useAuth();
  const { push } = useToast();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/items/${collection}`, { cache: "no-store" });
      const d = await r.json();
      setItems(d.items ?? []);
    } catch {
      /* ignore */
    }
  }, [collection]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload: Record<string, unknown> = { meta: {} };
    for (const f of fields) {
      const v = (form[f.name] ?? "").trim();
      if (f.name === "tags") payload.tags = v;
      else if (TOP.has(f.name)) payload[f.name] = v;
      else (payload.meta as Record<string, string>)[f.name] = v;
    }
    try {
      const r = await fetch(`/api/items/${collection}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        push("err", d.error || "Échec de l'ajout.");
        return;
      }
      push("ok", "Ajouté.");
      setForm({});
      setOpen(false);
      load();
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    const r = await fetch(`/api/items/${collection}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (r.ok) {
      push("ok", "Supprimé.");
      load();
    } else {
      push("err", "Échec de la suppression.");
    }
  };

  // Masqué si vide et non-admin (pas de section inutile pour les visiteurs).
  if (items.length === 0 && !isAdmin) return null;

  const badge =
    accent === "primary" ? "text-primary border-primary/40" : "text-secondary border-secondary/40";

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="label">{heading}</h2>
        {isAdmin && (
          <button onClick={() => setOpen(true)} className="btn btn-primary !py-1.5 !px-3 text-[11px]">
            + Ajouter
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-5 text-center font-mono text-xs text-muted">
          [ rien ici pour l&apos;instant{isAdmin ? " — clique « + Ajouter »" : ""} ]
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.id} className="card corner-frame p-4 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-1">
                {it.url ? (
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm text-ink hover:text-secondary transition-colors truncate"
                  >
                    {it.title} ↗
                  </a>
                ) : (
                  <span className="font-mono text-sm text-ink truncate">{it.title}</span>
                )}
                {it.category && (
                  <span className={`shrink-0 text-[9px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${badge}`}>
                    {it.category}
                  </span>
                )}
              </div>
              {Object.values(it.meta).filter(Boolean).length > 0 && (
                <div className="font-mono text-[10px] text-muted mb-1">
                  {Object.values(it.meta).filter(Boolean).join(" · ")}
                </div>
              )}
              {it.description && (
                <p className="text-xs text-muted leading-relaxed flex-1 whitespace-pre-wrap">
                  {it.description}
                </p>
              )}
              {it.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {it.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono text-secondary bg-secondary/5 border border-secondary/30 px-1.5 py-0.5"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={() => del(it.id)}
                  className="mt-3 self-end text-[10px] font-mono uppercase tracking-[1px] text-muted hover:text-danger transition-colors"
                >
                  supprimer
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {open && (
        <Modal title={heading} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            {fields.map((f) =>
              f.kind === "textarea" ? (
                <textarea
                  key={f.name}
                  className="field min-h-[90px] resize-y"
                  placeholder={f.placeholder || f.label}
                  value={form[f.name] || ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  required={f.required}
                />
              ) : f.kind === "select" ? (
                <select
                  key={f.name}
                  className="field"
                  value={form[f.name] || ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  required={f.required}
                >
                  <option value="">{f.label}…</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  key={f.name}
                  className="field"
                  placeholder={f.placeholder || f.label}
                  value={form[f.name] || ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  required={f.required}
                />
              ),
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full justify-center disabled:opacity-50"
            >
              {busy ? "Ajout…" : "Ajouter"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
