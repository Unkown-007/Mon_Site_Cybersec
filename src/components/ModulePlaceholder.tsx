import { StatusDot } from "@/components/StatusDot";

export function ModulePlaceholder({
  code,
  title,
  desc,
  planned,
}: {
  code: string;
  title: string;
  desc: string;
  planned: string[];
}) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <StatusDot state="warn" />
        <span className="label text-warning">MODULE EN CONSTRUCTION — {code}</span>
      </div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink mb-3">
        {title}
      </h1>
      <p className="max-w-2xl text-muted leading-relaxed">{desc}</p>

      <div className="mt-8 card p-5 max-w-2xl">
        <h2 className="label mb-4">FONCTIONNALITÉS PRÉVUES</h2>
        <ul className="space-y-2 font-mono text-sm">
          {planned.map((p) => (
            <li key={p} className="flex items-start gap-2 text-muted">
              <span className="text-secondary">▸</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
