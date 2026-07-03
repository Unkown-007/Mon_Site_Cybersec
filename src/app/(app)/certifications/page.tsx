"use client";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui";
import { CERTS, CERT_TRACKS, LEVEL_LABEL, CERT_ROADMAP_URL, EARNED_CERTS, type Cert } from "@/data/learn";

const LEVEL_COLOR: Record<number, string> = {
  1: "text-success",
  2: "text-secondary",
  3: "text-warning",
  4: "text-danger",
};
const LEVEL_BAR: Record<number, string> = {
  1: "bg-success",
  2: "bg-secondary",
  3: "bg-warning",
  4: "bg-danger",
};

export default function CertificationsPage() {
  return (
    <div>
      <PageHeader
        code="CRT // ROADMAP"
        title="Certifications"
        desc="Parcours de certifications par domaine et niveau — de la fondation à l'expertise."
        right={
          <Button variant="ghost" size="sm" href={CERT_ROADMAP_URL} target="_blank" rel="noreferrer">
            Roadmap complète ↗
          </Button>
        }
      />

      {/* Certifications obtenues */}
      {EARNED_CERTS.length > 0 && (
        <section className="card mb-8 p-5">
          <h2 className="label text-secondary mb-1">OBTENUES // {EARNED_CERTS.length}</h2>
          <p className="mb-4 text-label text-muted">Certifications et badges validés.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EARNED_CERTS.map((c) => {
              const inner = (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.badge} alt={`Badge ${c.name}`} className="h-20 w-20 shrink-0" loading="lazy" />
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-ink-strong">{c.name}</p>
                    <p className="text-label text-muted">{c.org}</p>
                    {c.date && <p className="mt-0.5 text-[10px] font-mono text-muted">{c.date}</p>}
                    <span className="mt-1 inline-block rounded-sm border border-success/40 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[1px] text-success">
                      Vérifié ✓
                    </span>
                  </div>
                </div>
              );
              return c.url ? (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="focus-ring block rounded-md border border-line p-4 transition-colors hover:border-secondary/60"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.name} className="rounded-md border border-line p-4">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Légende niveaux */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((l) => (
          <span key={l} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1px] text-muted">
            <span className={`h-2 w-2 rounded-full ${LEVEL_BAR[l]}`} />
            {LEVEL_LABEL[l]}
          </span>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {CERT_TRACKS.map((track) => (
          <section key={track} className="card p-5">
            <h2 className="label text-secondary mb-4">{track}</h2>
            <ul className="space-y-2.5">
              {[...CERTS[track]].sort((a, b) => a.level - b.level).map((c) => (
                <CertRow key={c.name} cert={c} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-center text-label text-muted">
        Indicatif — les niveaux varient selon l&apos;expérience. Réfère-toi à la{" "}
        <a href={CERT_ROADMAP_URL} target="_blank" rel="noreferrer" className="text-secondary hover:underline">
          roadmap de Paul Jerimy
        </a>{" "}
        pour la vue exhaustive.
      </p>
    </div>
  );
}

function CertRow({ cert }: { cert: Cert }) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="flex w-10 shrink-0 gap-0.5" aria-hidden>
        {[1, 2, 3, 4].map((l) => (
          <span key={l} className={`h-3 w-1.5 rounded-sm ${l <= cert.level ? LEVEL_BAR[cert.level] : "bg-line"}`} />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-mono text-sm text-ink-strong">{cert.name}</span>
        <span className="ml-2 text-label text-muted">{cert.org}</span>
      </div>
      <span className={`shrink-0 text-[9px] font-mono uppercase ${LEVEL_COLOR[cert.level]}`}>
        {LEVEL_LABEL[cert.level]}
      </span>
      {cert.url && <span className="shrink-0 text-primary/60">↗</span>}
    </div>
  );

  return (
    <li>
      {cert.url ? (
        <a href={cert.url} target="_blank" rel="noreferrer noopener" className="focus-ring block rounded-sm py-1 transition-colors hover:text-secondary">
          {inner}
        </a>
      ) : (
        <div className="py-1">{inner}</div>
      )}
    </li>
  );
}
