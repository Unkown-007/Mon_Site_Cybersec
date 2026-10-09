import { StatusDot } from "@/components/StatusDot";
import { RevealText } from "@/components/animations/RevealText";
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
  return (
    <div className="mb-10">
      <div className="mb-5 animate-fade-in">
        <span className="chip">
          <StatusDot state={state} />
          <span className="text-ink">{code}</span>
        </span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="mb-3 font-display text-4xl font-bold tracking-tight text-ink-strong sm:text-5xl">
            <RevealText text={title} wordClassName="text-gradient-soft" />
          </h1>
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
