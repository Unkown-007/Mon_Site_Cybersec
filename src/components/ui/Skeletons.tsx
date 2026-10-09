"use client";

import React from "react";

interface SkeletonProps {
  disableAnimation: boolean;
}

export function CveSkeletonCard({ disableAnimation }: SkeletonProps) {
  return (
    <div className={`card p-4 border-line ${disableAnimation ? "" : "animate-pulse-stepped"}`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="terminal-skeleton h-4 w-28" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="terminal-skeleton h-4 w-12" />
          <div className="terminal-skeleton h-4 w-8" />
        </div>
      </div>
      <div className="space-y-1.5 mb-3.5">
        <div className="terminal-skeleton h-3 w-full" />
        <div className="terminal-skeleton h-3 w-[90%]" />
      </div>
      <div className="terminal-skeleton h-2.5 w-40" />
    </div>
  );
}

export function NewsSkeletonCard({ disableAnimation }: SkeletonProps) {
  return (
    <div className={`card p-4 border-line flex flex-col gap-2 ${disableAnimation ? "" : "animate-pulse-stepped"}`}>
      <div className="flex items-center gap-2">
        <div className="terminal-skeleton h-4.5 w-24" />
        <div className="terminal-skeleton h-3.5 w-16" />
      </div>
      <div className="terminal-skeleton h-4 w-[75%]" />
    </div>
  );
}
