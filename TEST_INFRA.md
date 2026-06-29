# UnknownX-077 Visual Redesign - E2E Testing Infrastructure

This document details the visual redesign E2E test suite structure, execution guidelines, and compliance rules for the UnknownX-077 personal cybersecurity platform.

## Feature Inventory (N=7)

The platform redesign covers exactly 7 core features, designated R1 through R7:

*   **R1: Enhanced BootScreen**
    *   Simulated military BIOS/hacker boot sequence.
    *   Dynamic ASCII art rendering and progress updates.
    *   Boot completion under 4 seconds.
    *   Compliance with `.lite` performance mode and `prefers-reduced-motion` settings.
*   **R2: Immersive 404 Page**
    *   Interactive static scanline overlay and custom glitch styling.
    *   `<GlitchText>` custom page-level headers.
    *   Appropriate status codes and navigation links to recovery screens.
*   **R3: Dashboard Module Cards Upgrade**
    *   Modular cyberpunk card container elements.
    *   Hover-triggered scanning animations and visual state styling.
    *   Real-time status indicators and threat level icons.
*   **R4: Login Page Visual Enhancement**
    *   Animated entry sequence with typed hacker theme elements.
    *   Visual transition screen after successful auth before landing.
    *   Preserves raw functional auth integration and validation.
*   **R5: Loading & Data Transition States**
    *   Next.js navigation-level page fade-in and slide-up animation template.
    *   Login-to-dashboard transition sequence (glitch flash, collapse grid).
*   **R6: Navbar Micro-interactions**
    *   Sticky header layout featuring cyber styling overlays.
    *   Hover/click drop-down menus with staggered entry.
    *   User auth state visualization dot.
*   **R7: Responsive Refinements**
    *   Refined breakpoints for mobile and desktop screens.
    *   Collapsible navigation drawers on compact viewports.
    *   Selective disablement of heavy rendering (canvas, cursor tracking) in `.lite` mode.

---

## E2E Testing Runner Architecture

Due to strict execution environments and the absence of preinstalled heavy visual test utilities, the E2E testing track is powered by a custom Node.js/TypeScript-based E2E test runner.

The runner checks two distinct testing surfaces:
1.  **Static Compliance Checks**:
    *   Validates source files in `src/` to ensure code pattern adherence.
    *   Verifies correct importing of accessibility hooks (`useReducedMotion`, `usePerf`).
    *   Validates CSS configurations and variables supporting `.lite` overrides.
2.  **Runtime HTTP Checks**:
    *   Sends automated requests to the Next.js server (`http://localhost:3000/`) and its endpoints.
    *   Validates page load status, response headers, HTML payload constructs, and cookies.

---

## Test Suites Tiers (Total Cases = 82)

The 82 test cases are categorized across 4 distinct verification Tiers:

*   **Tier 1: Feature Coverage** (35 Cases total, 5 per feature R1-R7)
    *   Validates primary presence and standard rendering of elements.
*   **Tier 2: Boundary & Corner Cases** (35 Cases total, 5 per feature R1-R7)
    *   Checks behavior in low-spec environments (e.g. `.lite` mode, `prefers-reduced-motion`, and custom viewports).
*   **Tier 3: Cross-Feature Combinations** (7 Cases total)
    *   Validates visual flow continuity across sequential pages (e.g., BootScreen completing and transitioning to Login, or Login redirecting to Dashboard layout).
*   **Tier 4: Real-World Application Scenarios** (5 Cases total)
    *   Holistic workflows including state changes, authentication flows, error redirection, and system visual consistency.

---

## Execution Guidelines

To compile and run the E2E test suite, use the following commands:

```bash
# Compile and run the E2E suite
npm run test:e2e
```

The underlying script command is:
`npx tsc -p tests/tsconfig.json && node tests/dist/run-e2e.js`
