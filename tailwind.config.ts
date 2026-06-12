import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fonds
        base: "#0a0a12", // fond principal (quasi-noir bleuté)
        surface: "#0d0d1a", // fond surfaces
        // Accents
        primary: "#7b5cf0", // violet électrique — Akira / néon
        secondary: "#00f5d4", // cyan turquoise — terminal, highlights
        // Texte
        ink: "#c0c8e0", // texte principal
        muted: "#4a5070", // texte secondaire
        // États
        danger: "#ff3d60",
        warning: "#febc2e",
        success: "#00c9a7",
        // Séparateurs
        line: "#1a1a2e",
        "line-strong": "#1a1a3a",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-share-tech-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        label: "3px",
      },
      boxShadow: {
        "glow-primary": "0 0 0 1px #7b5cf030, 0 0 18px -6px #7b5cf0",
        "glow-secondary": "0 0 0 1px #00f5d430, 0 0 18px -6px #00f5d4",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "94%": { opacity: "0.6" },
          "96%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scan: "scan 7s linear infinite",
        blink: "blink 1.1s step-end infinite",
        flicker: "flicker 6s linear infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
