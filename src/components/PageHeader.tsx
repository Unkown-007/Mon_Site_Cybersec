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
    <div className="mb-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <StatusDot state={state} />
        <span className="label text-secondary">{code}</span>
      </div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink mb-2">
            {title}
          </h1>
          <p className="max-w-2xl text-muted leading-relaxed text-sm sm:text-base">
            {desc}
          </p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
