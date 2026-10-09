type DotState = "online" | "warn" | "danger" | "idle";

const MAP: Record<DotState, string> = {
  online: "bg-success",
  warn: "bg-warning",
  danger: "bg-danger",
  idle: "bg-muted",
};

/* Pastille d'état : halo qui « respire » (transform/opacity → GPU). */
export function StatusDot({
  state = "online",
  label,
}: {
  state?: DotState;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${MAP[state]} ${state !== "idle" ? "live-dot" : ""}`}
        aria-hidden="true"
      />
      {label ? <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span> : null}
    </span>
  );
}
