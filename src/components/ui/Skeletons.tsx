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

// 1. Arsenal Category Section skeleton
export function ArsenalSkeletonCard({ disableAnimation }: SkeletonProps) {
  return (
    <div className={`card p-4 border-line flex flex-col gap-3 ${disableAnimation ? "" : "animate-pulse-stepped"}`}>
      <div className="flex justify-between items-center">
        <div className="terminal-skeleton h-4 w-28" />
        <div className="terminal-skeleton h-4 w-6" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="terminal-skeleton h-7 w-20" />
        ))}
      </div>
    </div>
  );
}

// 2. Writeups List item skeleton
export function WriteupSkeletonCard({ disableAnimation }: SkeletonProps) {
  return (
    <div className={`card p-4 border-line flex items-center justify-between gap-3 ${disableAnimation ? "" : "animate-pulse-stepped"}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="terminal-skeleton h-4 w-4 shrink-0" />
        <div className="terminal-skeleton h-4 w-1/3" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="terminal-skeleton h-4 w-16 hidden sm:block" />
        <div className="terminal-skeleton h-4 w-12" />
      </div>
    </div>
  );
}

// 3. Scripts Perso (Operator tool) card skeleton
export function ScriptSkeletonCard({ disableAnimation }: SkeletonProps) {
  return (
    <div className={`card overflow-hidden flex flex-col border border-line ${disableAnimation ? "" : "animate-pulse-stepped"}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line bg-base/20">
        <div className="space-y-1 flex-1">
          <div className="terminal-skeleton h-4 w-1/3" />
          <div className="terminal-skeleton h-3 w-1/2" />
        </div>
        <div className="terminal-skeleton h-4.5 w-16 shrink-0" />
      </div>
      <div className="p-4 bg-base/40 flex-1 min-h-[120px] flex flex-col gap-2">
        <div className="terminal-skeleton h-3 w-[90%]" />
        <div className="terminal-skeleton h-3 w-[85%]" />
        <div className="terminal-skeleton h-3 w-[70%]" />
      </div>
    </div>
  );
}

// 4. Boîte à outils externe (GitHub/Link) card skeleton
export function ExternalToolSkeletonCard({ disableAnimation }: SkeletonProps) {
  return (
    <div className={`card overflow-hidden flex flex-col border border-line ${disableAnimation ? "" : "animate-pulse-stepped"}`}>
      {/* Simulate the h-24 banner at the top of external cards */}
      <div className="terminal-skeleton h-24 w-full" />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-center">
          <div className="terminal-skeleton h-4 w-28" />
          <div className="terminal-skeleton h-4.5 w-16" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="terminal-skeleton h-3 w-full" />
          <div className="terminal-skeleton h-3 w-[80%]" />
        </div>
        <div className="flex gap-1.5 mt-1">
          <div className="terminal-skeleton h-4 w-12" />
          <div className="terminal-skeleton h-4 w-10" />
        </div>
      </div>
    </div>
  );
}

// 5. News List article card skeleton
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
