"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GlitchText } from "@/components/animations/GlitchText";
import { XLogo } from "@/components/XLogo";
import { usePerf } from "@/lib/perf";

/*
 * 404 — sobre : glitch ponctuel sur le code (au mount puis au survol, jamais
 * en boucle), rappel de la requête façon terminal et deux sorties claires.
 * En lite / prefers-reduced-motion, GlitchText reste statique.
 */
export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const { lite } = usePerf();

  return (
    <main className="relative z-10 grid min-h-screen place-items-center p-6 text-center">
      <div className="hud-scanlines-danger pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="glass relative w-full max-w-lg overflow-hidden rounded-3xl p-8 sm:p-10">
        <div className="mb-6 flex justify-center">
          <XLogo size={52} danger />
        </div>

        <GlitchText
          as="h1"
          text="404"
          auto={!lite}
          className="select-none font-display text-[96px] font-bold leading-none tracking-tighter text-danger text-glow-danger sm:text-[120px]"
        />

        <h2 className="mt-3 font-display text-2xl font-bold text-ink-strong">Page introuvable</h2>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          Ce secteur n&apos;existe pas, ou plus. Vérifie l&apos;adresse ou repars d&apos;un point connu.
        </p>

        <div className="my-7 rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3 text-left font-mono text-xs">
          <span className="text-success">root@vault</span>
          <span className="text-muted">:~$ </span>
          <span className="text-ink">curl -I {pathname}</span>
          <div className="mt-1 text-danger">HTTP/1.1 404 Not Found</div>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary focus-ring">
            Retour au dashboard
          </Link>
          <button type="button" onClick={() => router.back()} className="btn btn-ghost focus-ring">
            ← Page précédente
          </button>
        </div>
      </div>
    </main>
  );
}
