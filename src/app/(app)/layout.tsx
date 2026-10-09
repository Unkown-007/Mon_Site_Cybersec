"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { NewsTicker } from "@/components/NewsTicker";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BootScreen } from "@/components/BootScreen";
import { Terminal } from "@/components/Terminal";
import { CommandPalette } from "@/components/CommandPalette";
import { Onboarding } from "@/components/Onboarding";
import { XLogo } from "@/components/XLogo";
import { StatusDot } from "@/components/StatusDot";
import { useAuth } from "@/lib/auth";

const BOOT_KEY = "ux077:booted";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  // null = pas encore lu (SSR / 1er rendu) ; la séquence de boot n'est jouée
  // qu'une fois par session de navigation, plus à chaque chargement de page.
  const [needsBoot, setNeedsBoot] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setNeedsBoot(sessionStorage.getItem(BOOT_KEY) !== "1");
    } catch {
      setNeedsBoot(false);
    }
  }, []);

  useEffect(() => {
    // Session absente : direction /login sans attendre d'animation.
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (ready && !user) return null;

  if (!ready || needsBoot === null) return <BootScreen quiet />;

  if (needsBoot) {
    return (
      <BootScreen
        onComplete={() => {
          try {
            sessionStorage.setItem(BOOT_KEY, "1");
          } catch {
            /* ignore */
          }
          setNeedsBoot(false);
        }}
      />
    );
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-xl focus:border focus:border-secondary focus:bg-base focus:px-3 focus:py-2 focus:text-sm focus:text-secondary"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-24 outline-none sm:px-6 lg:px-8">
        <NewsTicker />
        <Breadcrumb />
        {children}
      </main>
      <footer className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <XLogo size={36} />
            <div>
              <div className="font-display text-sm font-semibold text-ink-strong">UnknownX-077</div>
              <div className="text-xs text-muted">Espace personnel de cybersécurité</div>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted">
            <span className="hidden font-mono sm:inline">
              <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>{" "}
              recherche
            </span>
            <StatusDot state="online" label="système opérationnel" />
          </div>
        </div>
      </footer>
      <Terminal />
      <CommandPalette />
      <Onboarding />
    </>
  );
}
