"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { InlineAdmin } from "@/components/InlineAdmin";
import { HARDWARE, HW_CATEGORIES, type HwCategory, type HwStatus } from "@/data/hardware";

const CAT_COLOR: Record<HwCategory, string> = {
  WiFi: "text-secondary border-secondary/40",
  "RFID/NFC": "text-warning border-warning/40",
  Recon: "text-primary border-primary/40",
  USB: "text-danger border-danger/40",
  "Sub-GHz": "text-warning border-warning/40",
  SDR: "text-secondary border-secondary/40",
  BadUSB: "text-danger border-danger/40",
  JTAG: "text-primary border-primary/40",
  Bus: "text-success border-success/40",
  Ressources: "text-success border-success/40",
};

const STATUS_STYLE: Record<HwStatus, string> = {
  possédé: "text-primary",
  actif: "text-success",
  prototype: "text-secondary",
  prévu: "text-warning",
  "non réalisé": "text-danger",
};

export default function HardwarePage() {
  const [cat, setCat] = useState<HwCategory | null>(null);

  const list = useMemo(
    () => HARDWARE.filter((p) => !cat || p.category === cat),
    [cat]
  );

  return (
    <div>
      <PageHeader
        code="HW // PROJETS ÉLECTRONIQUE"
        title="Hardware"
        desc="Gadgets ESP32 & électronique offensive/défensive — recon, RFID, Sub-GHz, BadUSB."
      />

      <InlineAdmin
        collection="hardware"
        heading="⊕ MATÉRIEL AJOUTÉ"
        accent="primary"
        fields={[
          { name: "title", label: "Nom du projet / outil", required: true },
          { name: "url", label: "Lien (dépôt GitHub…)" },
          { name: "category", label: "Catégorie (WiFi, RFID, USB…)" },
          { name: "board", label: "Carte / board (ESP32…)" },
          { name: "tags", label: "Tags (virgules)" },
          { name: "description", label: "Description / notes", kind: "textarea" },
        ]}
      />

      {/* bandeau légal */}
      <div className="card p-3 mb-6 border-warning/40">
        <p className="font-mono text-[11px] text-warning leading-relaxed">
          ⚠ Matériel à usage <span className="text-ink">éducatif</span> et sur ton propre
          équipement / réseau ou en <span className="text-ink">labo autorisé</span> uniquement.
          Le brouillage radio (jammer) et l&apos;attaque de réseaux tiers sont illégaux.
        </p>
      </div>

      {/* filtres catégorie */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Chip active={cat === null} onClick={() => setCat(null)}>
          Tout
        </Chip>
        {HW_CATEGORIES.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <article key={p.id} className="card scan-hover p-4 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-ink hover:text-secondary transition-colors truncate"
                >
                  {p.name} ↗
                </a>
              ) : (
                <span className="font-mono text-sm text-ink truncate">{p.name}</span>
              )}
              <span className={`shrink-0 text-[10px] font-mono uppercase tracking-[1px] border px-1.5 py-0.5 ${CAT_COLOR[p.category]}`}>
                {p.category}
              </span>
            </div>

            <div className="font-mono text-[10px] text-muted mb-2">
              ◈ {p.board} ·{" "}
              <span className={STATUS_STYLE[p.status]}>● {p.status}</span>
            </div>

            <p className="text-xs text-muted leading-relaxed flex-1">{p.desc}</p>

            {p.warn && (
              <p className="mt-3 pt-2 border-t border-line text-[10px] font-mono text-warning/90 leading-snug">
                ⚠ {p.warn}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-[1.5px] border transition-colors ${
        active
          ? "border-primary text-primary bg-primary/10"
          : "border-line-strong text-muted hover:text-ink hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}
