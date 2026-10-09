"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { IconClose } from "@/components/icons";

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
    <motion.div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="glass w-full max-w-lg overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 480, damping: 36 }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-5 py-3.5">
          <span className="font-display text-base font-semibold text-ink-strong">{title}</span>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
            aria-label="Fermer"
          >
            <IconClose size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}
