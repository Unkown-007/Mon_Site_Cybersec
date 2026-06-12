"use client";

import { usePathname } from "next/navigation";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const path = segments.length ? segments.join("/") : "";

  return (
    <div className="font-mono text-xs sm:text-sm text-muted mb-6 flex items-center flex-wrap gap-0">
      <span className="text-success">root@vault</span>
      <span className="text-muted">:</span>
      <span className="text-secondary">~/{path}</span>
      <span className="text-primary">$</span>
      <span className="cursor ml-1" aria-hidden="true" />
    </div>
  );
}
