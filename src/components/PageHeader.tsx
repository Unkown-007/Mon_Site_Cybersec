"use client";

import { usePathname } from "next/navigation";
import { StatusDot } from "@/components/StatusDot";
import { RevealText } from "@/components/animations/RevealText";
import { PinButton } from "@/components/PinButton";
import { NavIcon } from "@/components/NavIcon";
import { NAV_GROUPS, navItem } from "@/lib/nav";
import type { ReactNode } from "react";

export function PageHeader({
  code,
  title,
  desc,
  state = "online",
  right,
}: {
  code: string;
  title: string;
  desc: string;
  state?: "online" | "warn" | "danger" | "idle";
  right?: ReactNode;
}) {
  const pathname = usePathname();
  // Rubrique de la page (fil d'Ariane lisible : « Outils › Toolkit »).
  const group = NAV_GROUPS.find((g) => g.hrefs.some((h) => pathname === h || pathname.startsWith(h + "/")));

  return (
    <div className="mb-10">
      <div className="mb-5 flex animate-fade-in flex-wrap items-center gap-2">
        <span className="chip">
          <StatusDot state={state} />
          <span className="text-ink">{code}</span>
        </span>
        {group && (
          <span className="hidden items-center gap-1.5 text-xs text-muted sm:inline-flex">
            <NavIcon href={pathname} size={14} />
            {group.label} <span className="opacity-50">›</span> {navItem(pathname).label}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink-strong sm:text-5xl">
              <RevealText text={title} wordClassName="text-gradient-soft" />
            </h1>
            <PinButton
              className="mt-1.5 animate-fade-in stagger-4"
              pin={{ id: `page:${pathname}`, kind: "page", title, href: pathname, hint: desc }}
            />
          </div>
          <p className="max-w-2xl animate-fade-up text-[15px] leading-relaxed text-muted stagger-2 sm:text-base">
            {desc}
          </p>
        </div>
        {right ? <div className="shrink-0 animate-fade-up stagger-3">{right}</div> : null}
      </div>
      <div className="divider-gradient mt-7" />
    </div>
  );
}
