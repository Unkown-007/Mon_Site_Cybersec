import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
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

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
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
  themeColor: "#06060b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <HolyLoader
          color="linear-gradient(90deg,#7b5cf0,#00f5d4)"
          height="2px"
          boxShadow="0 0 10px rgba(0,245,212,0.5)"
          zIndex={99}
        />
        <PerfProvider>
          <BackgroundProvider>
            <MotionComplianceConfig>
              <BackgroundLayer />
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
