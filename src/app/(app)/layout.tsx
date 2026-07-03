"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { NewsTicker } from "@/components/NewsTicker";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BootScreen } from "@/components/BootScreen";
import { Terminal } from "@/components/Terminal";
import { CommandPalette } from "@/components/CommandPalette";
import { Onboarding } from "@/components/Onboarding";
import { AsciiLogo } from "@/components/AsciiLogo";
import { XLogo } from "@/components/XLogo";
import { useAuth } from "@/lib/auth";
import { usePerf } from "@/lib/perf";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bootFinished, setBootFinished] = useState(false);
  const { lite } = usePerf();

  useEffect(() => {
    // If auth state resolved and no user, immediately redirect to login without waiting for boot animation
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, user, router]);

  // If session is loaded and user is unauthenticated, redirect to login instantly
  // without waiting for the full boot animation.
  if (ready && !user) {
    return null;
  }

  // Keep BootScreen mounted until the auth state is ready AND the user object is validated.
  // Additionally, if the user is authenticated, wait for the BootScreen loading sequence to complete (bootFinished = true)
  // before transitioning into the main system dashboard.
  if (!ready || (user && !bootFinished && !lite)) {
    return <BootScreen onComplete={() => setBootFinished(true)} />;
  }

  // Once authenticated and boot sequence is fully completed:
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:clip-chamfer-sm focus:border focus:border-secondary focus:bg-base focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[1px] focus:text-secondary"
      >
        Aller au contenu
      </a>
      <Navbar />
      <NewsTicker />
      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24 min-h-screen outline-none">
        <Breadcrumb />
        {/* Transition d'entrée à chaque changement de route (coupée en lite) */}
        <motion.div
          key={pathname}
          initial={lite ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <footer className="border-t border-line-strong bg-base/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center mb-5">
            <XLogo size={76} />
          </div>
          <AsciiLogo />
          <p className="mt-4 text-center font-mono text-[10px] text-muted">
            UnknownX-077 — espace personnel ·{" "}
            <span className="text-success">● système opérationnel</span>
          </p>
        </div>
      </footer>
      <Terminal />
      <CommandPalette />
      <Onboarding />
    </>
  );
}
