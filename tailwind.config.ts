import type { Config } from "tailwindcss";

/*
 * Design system — UnknownX-077 // VAULT
 * Logique couleur à 3 tiers (proportions à respecter dans l'usage) :
 *   • NEUTRES  (~85%) : échelle base → surface → elevated → overlay + texte.
 *   • VIOLET   (~10%) : accent STRUCTUREL / identité (primary / accent).
 *   • CYAN     (~3%)  : SIGNAL RARE, 1 focal par vue (secondary / signal).
 *   • ROUGE           : SÉMANTIQUE danger uniquement (jamais décoratif).
 * Les anciens noms (base, surface, primary, secondary, line, line-strong…)
 * restent valides : ce sont des alias mappés sur la nouvelle échelle, afin de
 * ne casser aucun module avant leur migration en Phase 3.
 */

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Neutres : échelle de fonds (≈85% de l'UI) ──
        base: "#07070c", // fond de page (très sombre, pas noir pur)
        surface: "#0c0c15", // panneaux / cartes
        elevated: "#12121e", // surface surélevée (hover, popover)
        overlay: "#1a1a28", // surface la plus claire / survol marqué

        // ── Texte ──
        "ink-strong": "#e9ecf6", // titres / blanc cassé
        ink: "#c0c8e0", // corps de texte
        muted: "#818aa8", // texte secondaire — AA ≈ 5.9:1 sur base

        // ── Accent STRUCTUREL : violet (identité, ~10%) ──
        primary: "#7b5cf0",
        accent: "#7b5cf0", // alias sémantique

        // ── SIGNAL RARE : cyan (~3%) ──
        secondary: "#00f5d4",
        signal: "#00f5d4", // alias sémantique

        // ── Sémantiques fonctionnels ──
        danger: "#ff3d60",
        warning: "#febc2e",
        success: "#00c9a7",

        // ── Bordures unifiées (fini les 3 opacités ad hoc) ──
        line: {
          subtle: "#15151f", // séparateurs internes discrets
          DEFAULT: "#1f1f2d", // bordure standard (= ancien `line`)
          strong: "#2b2b3d", // bordure marquée (= ancien `line-strong`)
        },
      },

      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-share-tech-mono)", "ui-monospace", "monospace"],
      },

      // ── Échelle typographique nommée (vraie hiérarchie) ──
      fontSize: {
        display: ["clamp(2.5rem, 5vw, 3.5rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        h1: ["2rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        h2: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.005em" }],
        h3: ["1.125rem", { lineHeight: "1.3" }],
        body: ["0.9375rem", { lineHeight: "1.65" }], // 15px
        "body-sm": ["0.8125rem", { lineHeight: "1.6" }], // 13px
        label: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.18em" }], // 11px — plancher labels
      },

      letterSpacing: {
        label: "0.18em",
      },

      borderRadius: {
        sm: "2px",
        md: "6px",
      },

      // ── Glow unifié : un seul shadow, paramétré par --glow-color ──
      boxShadow: {
        glow: "0 0 1px var(--glow-color), 0 0 22px -6px var(--glow-color)",
        "focus-ring": "0 0 0 2px var(--base), 0 0 0 4px var(--signal)",
      },

      // ── Standards de motion ──
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
        blink: "blink 1.1s step-end infinite",
        flicker: "flicker 6s linear infinite",
        "fade-up": "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
