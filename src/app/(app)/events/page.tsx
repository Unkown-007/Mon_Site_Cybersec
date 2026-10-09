"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CtfAgenda } from "@/components/CtfAgenda";
import { PinButton } from "@/components/PinButton";
import { Badge } from "@/components/ui";
import { Segmented } from "@/components/ui/Segmented";
import { EVENTS, type Ev } from "@/data/learn";

type Filter = "all" | "France" | "International";

const REGIONS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "France", label: "France" },
  { id: "International", label: "International" },
];

export default function EventsPage() {
  const [f, setF] = useState<Filter>("all");
  const items = useMemo(() => (f === "all" ? EVENTS : EVENTS.filter((e) => e.region === f)), [f]);

  return (
    <div>
      <PageHeader
        code="EVT // AGENDA"
        title="Agenda & CTF"
        desc="Les prochains CTF en direct depuis CTFtime, puis les conférences et communautés cyber à suivre."
      />

      <section className="mb-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="label">En direct</span>
            <h2 className="mt-2 font-display text-h2 font-bold text-ink-strong">Prochains CTF</h2>
          </div>
          <a
            href="https://ctftime.org/event/list/upcoming"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost !py-2 !text-xs"
          >
            CTFtime ↗
          </a>
        </div>
        <CtfAgenda />
      </section>

      <section>
        <div className="mb-5">
          <span className="label">Communautés</span>
          <h2 className="mt-2 font-display text-h2 font-bold text-ink-strong">Conférences & communautés</h2>
        </div>
        <Segmented items={REGIONS} value={f} onChange={setF} layoutId="evt-region" className="mb-6" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <EventCard key={e.name} ev={e} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Carte entièrement cliquable (lien étendu) avec l'étoile au-dessus : pas de
// bouton imbriqué dans un lien.
function EventCard({ ev }: { ev: Ev }) {
  return (
    <div className="card hover-lift group relative p-4">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <a
          href={ev.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-sm font-semibold text-ink-strong after:absolute after:inset-0 after:rounded-[inherit] focus-ring"
        >
          {ev.name}
        </a>
        <span className="relative z-10 -mr-1.5 -mt-1.5">
          <PinButton pin={{ id: `evt:${ev.name}`, kind: "plateforme", title: ev.name, href: ev.url, hint: ev.type }} />
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted">{ev.desc}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={ev.type === "Communauté" ? "accent" : "signal"}>{ev.type}</Badge>
        <span className="text-[11px] text-muted">{ev.place}</span>
      </div>
    </div>
  );
}
