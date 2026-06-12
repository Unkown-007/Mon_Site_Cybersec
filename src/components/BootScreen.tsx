"use client";

import { useEffect, useState } from "react";

const SEQUENCE = [
  "[ OK ] init kernel ...",
  "[ OK ] mount /vault ...",
  "[ OK ] load crypto modules ...",
  "[ .. ] authenticating session ...",
];

export function BootScreen() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setN((v) => Math.min(v + 1, SEQUENCE.length)), 180);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-base bg-diagonal flex items-center justify-center p-6">
      <div className="font-mono text-xs sm:text-sm w-full max-w-md">
        <div className="label mb-4">UnknownX-077 // boot</div>
        {SEQUENCE.slice(0, n).map((line, i) => (
          <div key={i} className="text-success">
            {line}
          </div>
        ))}
        <div className="cursor text-secondary mt-2" aria-hidden="true" />
      </div>
    </div>
  );
}
