"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Panel, Badge } from "@/components/ui";

/*
 * Styleguide interne du design system (Phase 2). Privé (derrière l'auth).
 * Montre : échelle typo, tiers de couleur, états des primitives, motion.
 * Aucun module n'est touché — page de validation avant la Phase 3.
 */

function Swatch({
  name,
  varName,
  hex,
  role,
  ring,
}: {
  name: string;
  varName: string;
  hex: string;
  role: string;
  ring?: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      <div
        className="h-16 w-full"
        style={{
          background: hex,
          boxShadow: ring ? "inset 0 0 0 1px var(--line-strong)" : undefined,
        }}
      />
      <div className="px-3 py-2.5">
        <div className="font-mono text-body-sm text-ink-strong">{name}</div>
        <div className="font-mono text-label text-muted mt-1">{varName}</div>
        <div className="font-mono text-label text-muted mt-0.5">{hex}</div>
        <p className="mt-2 text-body-sm text-muted leading-snug">{role}</p>
      </div>
    </div>
  );
}

function Section({
  code,
  title,
  children,
}: {
  code: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <span className="label text-secondary">{code}</span>
        <h2 className="mt-2 font-display text-h2 text-ink-strong">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const STAGGER_ITEMS = [
  "Reconnaissance",
  "Énumération",
  "Exploitation",
  "Post-exploitation",
  "Reporting",
];

export default function DesignSystemPage() {
  const reduce = useReducedMotion();
  const [glow, setGlow] = useState(false);

  const list = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.04 } },
  };
  const itemV = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="space-y-16 pb-12">
      {/* En-tête */}
      <header className="space-y-4">
        <span className="label text-secondary">DESIGN SYSTEM // v2</span>
        <h1 className="font-display text-display text-ink-strong">
          UnknownX-077{" "}
          <span className="text-primary">// VAULT</span>
        </h1>
        <p className="max-w-2xl text-body text-muted">
          Fondations visuelles : tokens, échelle typographique, primitives et
          standards de motion. Référence retenue — sombre, précis, accent
          lumineux rare. Appuie sur{" "}
          <kbd className="rounded-sm border border-line-strong px-1.5 py-0.5 text-label text-ink">
            Tab
          </kbd>{" "}
          pour voir le focus-ring.
        </p>
      </header>

      {/* ── COULEURS ── */}
      <Section code="TOK·01" title="Couleur — logique à 3 tiers">
        <div>
          <div className="label text-muted mb-3">Neutres · ≈85% de l’UI</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Swatch name="base" varName="--base" hex="#07070c" role="Fond de page" ring />
            <Swatch name="surface" varName="--surface" hex="#0c0c15" role="Panneaux / cartes" ring />
            <Swatch name="elevated" varName="--elevated" hex="#12121e" role="Surface surélevée" ring />
            <Swatch name="overlay" varName="--overlay" hex="#1a1a28" role="Survol marqué" ring />
            <Swatch name="ink-strong" varName="--ink-strong" hex="#e9ecf6" role="Titres" />
            <Swatch name="ink" varName="--ink" hex="#c0c8e0" role="Corps de texte" />
            <Swatch name="muted" varName="--muted" hex="#818aa8" role="Secondaire · AA 5.9:1" />
            <Swatch name="line" varName="--line" hex="#1f1f2d" role="Bordure standard" ring />
          </div>
        </div>

        <div>
          <div className="label text-muted mb-3">Accents — emphase, pas décoration</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Swatch name="primary / accent" varName="--primary" hex="#7b5cf0" role="Violet STRUCTUREL (identité, ~10%)" />
            <Swatch name="secondary / signal" varName="--secondary" hex="#00f5d4" role="Cyan SIGNAL RARE (1 focal/vue, ~3%)" />
            <Swatch name="danger" varName="--danger" hex="#ff3d60" role="Sémantique destructeur / erreur" />
            <Swatch name="warning" varName="--warning" hex="#febc2e" role="Sémantique avertissement" />
          </div>
        </div>
      </Section>

      {/* ── TYPOGRAPHIE ── */}
      <Section code="TOK·02" title="Échelle typographique">
        <Panel>
          <div className="space-y-5">
            <div>
              <span className="label text-muted">display · Orbitron</span>
              <p className="font-display text-display text-ink-strong">Akira 2077</p>
            </div>
            <div>
              <span className="label text-muted">h1</span>
              <p className="font-display text-h1 text-ink-strong">Centre de commande</p>
            </div>
            <div>
              <span className="label text-muted">h2</span>
              <p className="font-display text-h2 text-ink-strong">Veille threat-intel</p>
            </div>
            <div>
              <span className="label text-muted">h3</span>
              <p className="font-display text-h3 text-ink-strong">Arsenal red team</p>
            </div>
            <div>
              <span className="label text-muted">body · Share Tech Mono</span>
              <p className="text-body text-ink">
                Base de ressources, write-ups CTF et notes de terrain centralisés
                dans un espace de travail unique.
              </p>
            </div>
            <div>
              <span className="label text-muted">body-sm</span>
              <p className="text-body-sm text-muted">
                Texte secondaire — descriptions, métadonnées, légendes.
              </p>
            </div>
            <div>
              <span className="label text-muted">label</span>
              <div className="label text-secondary">SYSTÈME OPÉRATIONNEL</div>
            </div>
          </div>
        </Panel>
      </Section>

      {/* ── BOUTONS ── */}
      <Section code="UI·01" title="Button — variantes & états">
        <Panel>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Action standard</Button>
              <Button variant="signal">CTA focal</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Supprimer</Button>
              <Button variant="primary" disabled>
                Désactivé
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="signal" size="sm">
                Small signal
              </Button>
              <Button variant="ghost" size="sm">
                Small ghost
              </Button>
            </div>
            <p className="text-body-sm text-muted">
              <span className="text-secondary">signal</span> = seul bouton qui glow,
              réservé au CTA principal d’une vue. Survol, focus (Tab) et active
              (clic) sont distincts.
            </p>
          </div>
        </Panel>
      </Section>

      {/* ── BADGES ── */}
      <Section code="UI·02" title="Badge — états & méta">
        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>neutral</Badge>
            <Badge variant="accent">accent</Badge>
            <Badge variant="signal" dot>
              actif
            </Badge>
            <Badge variant="danger" dot>
              CRITICAL
            </Badge>
            <Badge variant="warning">HIGH</Badge>
            <Badge variant="success" dot>
              résolu
            </Badge>
          </div>
        </Panel>
      </Section>

      {/* ── PANELS ── */}
      <Section code="UI·03" title="Panel — surface / focal / interactif">
        <div className="grid gap-4 md:grid-cols-3">
          <Panel code="STD" title="Panneau standard">
            <p className="text-body-sm text-muted">
              Bordure neutre. Le violet recule — c’est la surface par défaut.
            </p>
          </Panel>
          <Panel code="FOCAL" title="Zone focale" focal>
            <p className="text-body-sm text-muted">
              Bordure violet structurel + surface surélevée. Pas de glow (le glow
              reste au cyan).
            </p>
          </Panel>
          <Panel code="LINK" title="Interactif" interactive>
            <p className="text-body-sm text-muted">
              Lift discret au survol pour les panneaux cliquables.
            </p>
          </Panel>
        </div>
      </Section>

      {/* ── MOTION ── */}
      <Section code="MOT·01" title="Motion — durées, courbes, stagger">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel code="ÉCHELLE" title="Durées & easing">
            <ul className="space-y-2 text-body-sm">
              <li className="flex justify-between">
                <span className="text-ink">duration-fast</span>
                <span className="font-mono text-muted">150ms · hover/focus</span>
              </li>
              <li className="flex justify-between">
                <span className="text-ink">duration-base</span>
                <span className="font-mono text-muted">250ms · transitions UI</span>
              </li>
              <li className="flex justify-between">
                <span className="text-ink">duration-slow</span>
                <span className="font-mono text-muted">400ms · apparitions</span>
              </li>
              <li className="flex justify-between border-t border-line-subtle pt-2">
                <span className="text-ink">ease-out-soft</span>
                <span className="font-mono text-muted">(0.22, 1, 0.36, 1)</span>
              </li>
              <li className="flex justify-between">
                <span className="text-ink">ease-spring</span>
                <span className="font-mono text-muted">(0.34, 1.56, 0.64, 1)</span>
              </li>
            </ul>
            <p className="mt-4 text-body-sm text-muted">
              {reduce
                ? "prefers-reduced-motion détecté : animations réduites."
                : "Stagger ~40ms entre items de liste."}
            </p>
          </Panel>

          <Panel code="STAGGER" title="Apparition en cascade" right={
            <Button variant="ghost" size="sm" onClick={() => setGlow((g) => !g)}>
              Rejouer
            </Button>
          }>
            <motion.ul
              key={glow ? "a" : "b"}
              variants={list}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {STAGGER_ITEMS.map((label, i) => (
                <motion.li
                  key={label}
                  variants={itemV}
                  className="flex items-center gap-3 rounded-sm border border-line-subtle bg-base px-3 py-2"
                >
                  <span className="label text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-body-sm text-ink">{label}</span>
                </motion.li>
              ))}
            </motion.ul>
          </Panel>
        </div>
      </Section>

      {/* ── GLOW ── */}
      <Section code="TOK·03" title="Glow — unique, recoloriable">
        <Panel>
          <div className="flex flex-wrap items-center gap-6">
            <div
              className="grid h-20 w-20 place-items-center rounded-md border border-secondary/50 bg-secondary/5 shadow-glow"
              style={{ "--glow-color": "var(--secondary)" } as React.CSSProperties}
            >
              <span className="text-secondary text-body-sm">signal</span>
            </div>
            <div
              className="grid h-20 w-20 place-items-center rounded-md border border-danger/50 bg-danger/5 shadow-glow"
              style={{ "--glow-color": "var(--danger)" } as React.CSSProperties}
            >
              <span className="text-danger text-body-sm">danger</span>
            </div>
            <p className="max-w-sm text-body-sm text-muted">
              Un seul token <span className="font-mono text-ink">shadow-glow</span>,
              piloté par <span className="font-mono text-ink">--glow-color</span>.
              Réservé à l’élément cyan focal et aux états danger.
            </p>
          </div>
        </Panel>
      </Section>
    </div>
  );
}
