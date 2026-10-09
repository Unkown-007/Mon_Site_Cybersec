"use client";

import { usePathname } from "next/navigation";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const path = segments.length ? segments.join("/") : "";

  return (
    <div className="mb-8 flex flex-wrap items-center font-mono text-xs text-muted">
      <span className="text-success/90">root@vault</span>
      <span>:</span>
      <span className="text-secondary/90">~/{path}</span>
      <span className="ml-1 text-primary">$</span>
      <span className="cursor ml-1" aria-hidden="true" />
    </div>
  );
}
