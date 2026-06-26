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

export function ResourceSkeletonCard({ view, disableAnimation }: SkeletonProps & { view: "grid" | "list" }) {
  return (
    <div
      className={`card p-4 flex flex-col ${
        view === "list" ? "sm:flex-row sm:items-center sm:gap-4" : ""
      } ${disableAnimation ? "" : "animate-pulse-stepped"}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="terminal-skeleton h-4 w-1/3" />
          <div className="terminal-skeleton h-4.5 w-12" />
        </div>
        <div className="space-y-1.5 mb-3">
          <div className="terminal-skeleton h-3 w-full" />
          <div className="terminal-skeleton h-3 w-[85%]" />
        </div>
        <div className="flex gap-1.5">
          <div className="terminal-skeleton h-4.5 w-10" />
          <div className="terminal-skeleton h-4.5 w-12" />
        </div>
      </div>
      <div
        className={`flex items-center justify-between gap-2 mt-3 pt-3 border-t border-line ${
          view === "list"
            ? "sm:mt-0 sm:pt-0 sm:border-t-0 sm:flex-col sm:items-end sm:w-40 sm:shrink-0"
            : ""
        }`}
      >
        <div className="terminal-skeleton h-3 w-20" />
        <div className="terminal-skeleton h-3 w-10" />
      </div>
    </div>
  );
}
