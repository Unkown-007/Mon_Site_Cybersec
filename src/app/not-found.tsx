"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlitchText } from "@/components/animations/GlitchText";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 hud-scanlines" />

      <GlitchText
        as="h1"
        text="404"
        auto
        className="font-display font-black leading-none text-ink text-[88px] sm:text-[120px]"
      />
      <p className="label text-secondary mt-3">// SIGNAL_NOT_FOUND</p>
      <p className="mt-4 max-w-md font-mono text-sm text-muted leading-relaxed">
        La ressource demandée n&apos;existe pas ou a été déplacée. Le signal s&apos;est perdu
        quelque part dans le réseau.
      </p>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn btn-primary">
          ← Retour au dashboard
        </Link>
        <button onClick={() => router.back()} className="btn btn-ghost">
          ↩ Page précédente
        </button>
      </div>

      <p className="mt-10 font-mono text-[10px] text-muted">
        root@vault:~$ trace --lost-packet · 0 hops
      </p>
    </main>
  );
}
