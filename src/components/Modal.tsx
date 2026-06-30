"use client";

import { useEffect, type ReactNode } from "react";

/* Fenêtre modale réutilisable (overlay + Échap + clic extérieur pour fermer). */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-base/70 backdrop-blur-md p-4 pt-[8vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card corner-frame w-full max-w-lg animate-fade-up drop-shadow-[0_0_20px_rgba(123,92,240,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gui-stream flex items-center justify-between gap-2 px-4 py-2.5 border-b border-line-strong bg-base/40">
          <span className="label !text-secondary">{title}</span>
          <button
            onClick={onClose}
            className="text-muted hover:text-danger text-xs transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
