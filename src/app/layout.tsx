import type { Metadata, Viewport } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { CyberCityBackground } from "@/components/CyberCityBackground";
import { CrosshairCursor } from "@/components/CrosshairCursor";
import { SfxClicks } from "@/components/SfxClicks";
import { MusicPlayer } from "@/components/MusicPlayer";
import { PerfProvider } from "@/lib/perf";
import { PerfToggle } from "@/components/PerfToggle";

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
        <PerfProvider>
          <CyberCityBackground />
          <CrosshairCursor />
          <SfxClicks />
          <div className="scanline" aria-hidden="true" />
          <PerfToggle />
          <AuthProvider>
            <ToastProvider>
              <div className="relative z-10">{children}</div>
              <MusicPlayer />
            </ToastProvider>
          </AuthProvider>
        </PerfProvider>
      </body>
    </html>
  );
}
