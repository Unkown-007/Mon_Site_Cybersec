type DotState = "online" | "warn" | "danger" | "idle";

const MAP: Record<DotState, string> = {
  online: "bg-success shadow-[0_0_8px_#00c9a7]",
  warn: "bg-warning shadow-[0_0_8px_#febc2e]",
  danger: "bg-danger shadow-[0_0_8px_#ff3d60]",
  idle: "bg-muted",
};

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
        className={`h-2 w-2 ${MAP[state]} ${state !== "idle" ? "animate-flicker" : ""}`}
        aria-hidden="true"
      />
      {label ? <span className="label !text-muted">{label}</span> : null}
    </span>
  );
}
