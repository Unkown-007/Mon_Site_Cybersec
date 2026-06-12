"use client";

import { useEffect } from "react";
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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  // Tant que la session n'est pas résolue (ou en cours de redirection) : boot.
  if (!ready || !user) return <BootScreen />;

  return (
    <>
      <Navbar />
      <NewsTicker />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 min-h-screen">
        <Breadcrumb />
        {children}
      </main>
      <footer className="border-t border-line-strong bg-base/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8">
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
