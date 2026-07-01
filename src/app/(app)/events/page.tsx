"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui";
import { EVENTS, type Ev } from "@/data/learn";

type Filter = "all" | "France" | "International";

export default function EventsPage() {
  const [f, setF] = useState<Filter>("all");
  const items = useMemo(() => (f === "all" ? EVENTS : EVENTS.filter((e) => e.region === f)), [f]);

  return (
    <div>
      <PageHeader
        code="EVT // AGENDA"
        title="Événements & communautés"
        desc="Conférences et communautés cyber à suivre — scène française et internationale."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "France", "International"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setF(k)}
            className={`hud-tab hud-tab--chip focus-ring px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[1px] ${
              f === k ? "is-active text-secondary" : "text-muted hover:text-ink"
            }`}
          >
            <span className="relative z-10">{k === "all" ? "Tout" : k}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <EventCard key={e.name} ev={e} />
        ))}
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: Ev }) {
  return (
    <a href={ev.url} target="_blank" rel="noreferrer noopener" className="focus-ring card block p-4">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="font-mono text-sm text-ink-strong">{ev.name}</span>
        <span className="shrink-0 text-primary/70">↗</span>
      </div>
      <p className="mb-3 text-label leading-snug text-muted">{ev.desc}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={ev.type === "Communauté" ? "accent" : "signal"}>{ev.type}</Badge>
        <span className="text-[9px] font-mono uppercase tracking-[1px] text-muted">{ev.place}</span>
      </div>
    </a>
  );
}
