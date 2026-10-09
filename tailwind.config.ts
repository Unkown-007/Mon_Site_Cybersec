import type { Config } from "tailwindcss";

/*
 * Design system — UnknownX-077 v2
 * Langage visuel : surfaces arrondies « verre fumé », liserés dégradés,
 * typographie moderne (Space Grotesk / Inter / JetBrains Mono).
 * Couleurs à 3 tiers (proportions à respecter dans l'usage) :
 *   • NEUTRES  (~85%) : base → surface → elevated → overlay + texte.
 *   • VIOLET   (~10%) : accent structurel / identité (primary / accent).
 *   • CYAN     (~3%)  : signal rare, 1 focal par vue (secondary / signal).
 *   • ROUGE           : sémantique danger uniquement.
 * Animations : uniquement transform / opacity (composées par le GPU).
 */

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // `text-base` doit rester une TAILLE de police : sans ça, la couleur
    // « base » (quasi noire) était aussi générée et rendait le texte invisible.
    textColor: ({ theme }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { base, ...colors } = theme("colors");
      return colors;
    },
    extend: {
      colors: {
        // ── Neutres : échelle de fonds ──
        base: "#06060b",
        surface: "#0d0d16",
        elevated: "#13131f",
        overlay: "#1a1a29",

        // ── Texte ──
        "ink-strong": "#f2f3fa",
        ink: "#c9cee2",
        muted: "#8a91ad",

        // ── Accent structurel : violet ──
        primary: "#7b5cf0",
        accent: "#7b5cf0",

        // ── Signal rare : cyan ──
        secondary: "#00f5d4",
        signal: "#00f5d4",

        // ── Sémantiques ──
        danger: "#ff3d60",
        warning: "#febc2e",
        success: "#00c9a7",

        // ── Bordures ──
        line: {
          subtle: "#14141f",
          DEFAULT: "#1e1e2e",
          strong: "#2a2a3e",
        },
      },

      fontFamily: {
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Consolas", "monospace"],
      },

      fontSize: {
        display: ["clamp(2.4rem, 5.2vw, 3.9rem)", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        h1: ["2rem", { lineHeight: "1.12", letterSpacing: "-0.025em" }],
        h2: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        h3: ["1.125rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        body: ["0.9375rem", { lineHeight: "1.65" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.6" }],
        label: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.14em" }],
      },

      letterSpacing: {
        label: "0.14em",
      },

      // Coins arrondis partout : fini les angles vifs / chanfreins.
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },

      boxShadow: {
        glow: "0 0 0 1px var(--glow-color), 0 8px 32px -8px var(--glow-color)",
        "focus-ring": "0 0 0 2px var(--base), 0 0 0 4px var(--signal)",
        soft: "0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.7)",
        lift: "0 1px 0 rgba(255,255,255,0.06) inset, 0 22px 50px -18px rgba(0,0,0,0.85), 0 0 0 1px rgba(123,92,240,0.18)",
      },

      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },

      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translate3d(0,10px,0)" },
          "100%": { opacity: "1", transform: "translate3d(0,0,0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
        flicker: "flicker 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
