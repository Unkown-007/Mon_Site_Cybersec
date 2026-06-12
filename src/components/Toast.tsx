"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { sfx } from "@/lib/audio";

type ToastKind = "ok" | "err" | "warn";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const PREFIX: Record<ToastKind, string> = {
  ok: "[OK]",
  err: "[ERR]",
  warn: "[!]",
};

const COLOR: Record<ToastKind, string> = {
  ok: "text-success border-success/40",
  err: "text-danger border-danger/40",
  warn: "text-warning border-warning/40",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    sfx(kind === "ok" ? "ok" : kind === "err" ? "err" : "click");
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2 w-[min(92vw,360px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`card animate-fade-up bg-surface/95 backdrop-blur px-4 py-3 text-sm font-mono ${COLOR[t.kind]}`}
          >
            <span className="font-bold mr-2">{PREFIX[t.kind]}</span>
            <span className="text-ink">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}
