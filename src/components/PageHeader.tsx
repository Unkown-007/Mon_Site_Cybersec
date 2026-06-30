import { StatusDot } from "@/components/StatusDot";
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
    <div className="mb-10 animate-fade-up">
      <div className="mb-5">
        <span className="clip-chamfer-sm inline-flex items-center gap-2.5 border border-secondary/40 bg-secondary/5 px-3.5 py-1.5">
          <StatusDot state={state} />
          <span className="label text-secondary">{code}</span>
        </span>
      </div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink-strong mb-2.5">
            {title}
          </h1>
          <p className="max-w-2xl text-muted leading-relaxed text-sm sm:text-base">
            {desc}
          </p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-6 h-px w-full bg-gradient-to-r from-secondary/50 via-primary/25 to-transparent" />
    </div>
  );
}
