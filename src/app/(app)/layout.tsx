"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { NewsTicker } from "@/components/NewsTicker";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BootScreen } from "@/components/BootScreen";
import { Terminal } from "@/components/Terminal";
import { CommandPalette } from "@/components/CommandPalette";
import { AsciiLogo } from "@/components/AsciiLogo";
import { ArasakaLogo } from "@/components/ArasakaLogo";
import { useAuth } from "@/lib/auth";
import { usePerf } from "@/lib/perf";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
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
      <Navbar />
      <NewsTicker />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24 min-h-screen">
        <Breadcrumb />
        {children}
      </main>
      <footer className="border-t border-line-strong bg-base/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center mb-5">
            <ArasakaLogo size={76} />
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
    </>
  );
}
