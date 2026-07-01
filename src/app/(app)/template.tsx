"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePerf } from "@/lib/perf";

/* Transition d'entrée rejouée à chaque navigation entre pages. */
export default function Template({ children }: { children: React.ReactNode }) {
  const { lite } = usePerf();
  const shouldReduceMotion = useReducedMotion();
  const disableAnimation = lite || (shouldReduceMotion ?? false);

  if (disableAnimation) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
