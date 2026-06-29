"use client";

import { useEffect, useState } from "react";

export function ToolkitTabSkeleton({ tabId }: { tabId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString());
    
    const messages = [
      `>> Initializing module: ux077_sys_${tabId}...`,
      `>> Mapping client interfaces and schemas...`,
      `>> Resolving static data buffers...`,
      `>> Module loaded successfully. Console stream active.`,
    ];

    let current = 0;
    setLogs([messages[0]]);
    const interval = setInterval(() => {
      current++;
      if (current < messages.length) {
        setLogs((l) => [...l, messages[current]]);
      } else {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [tabId]);

  return (
    <div className="card p-6 font-mono text-[11px] text-secondary/80 bg-surface border-line-strong min-h-[300px]">
      <div className="flex items-center justify-between border-b border-line pb-2 mb-4">
        <span className="text-muted">{"// SYS_LOADER · "}{tabId.toUpperCase()}</span>
        <span className="text-success flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-stepped" />
          EXECUTING
        </span>
      </div>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted">[{timeStr}]</span>
            <span>{log}</span>
          </div>
        ))}
        {logs.length < 4 && (
          <div className="flex gap-2">
            <span className="text-muted">[{timeStr}]</span>
            <span className="cursor" />
          </div>
        )}
      </div>
    </div>
  );
}
