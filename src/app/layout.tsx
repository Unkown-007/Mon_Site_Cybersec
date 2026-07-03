import type { Metadata, Viewport } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { BackgroundProvider } from "@/lib/background";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { ClientFX, LazyMusicPlayer } from "@/components/ClientFX";
import { KonamiEasterEgg } from "@/components/KonamiEasterEgg";
import { PerfProvider, MotionComplianceConfig } from "@/lib/perf";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import HolyLoader from "holy-loader";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UnknownX-077 // VAULT",
  description:
    "Plateforme personnelle de cybersécurité — ressources, write-ups CTF, outils, veille et notes de terrain.",
  robots: { index: false, follow: false },
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "UX-077" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${orbitron.variable} ${shareTechMono.variable}`}>
      <body>
        <HolyLoader
          color="#00f5d4"
          height="2px"
          boxShadow="0 0 12px rgba(0,245,212,0.7)"
          zIndex={99}
        />
        <PerfProvider>
          <BackgroundProvider>
            <MotionComplianceConfig>
              <BackgroundLayer />
              <div className="scanline" aria-hidden="true" />
              <ClientFX />
              <AuthProvider>
                <ToastProvider>
                  <div className="relative z-10">{children}</div>
                  <LazyMusicPlayer />
                  <KonamiEasterEgg />
                </ToastProvider>
              </AuthProvider>
            </MotionComplianceConfig>
          </BackgroundProvider>
        </PerfProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
