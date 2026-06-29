# Project: UnknownX-077 Visual Redesign

## Architecture
- Framework: Next.js 14 App Router, TypeScript, Tailwind CSS 3, Framer Motion 12.40.
- Theme: Akira/Cyberpunk.
- Color system: neutrals ~85%, violet primary ~10%, cyan secondary ~3%, semantic colors.
- Entry-point: BootScreen -> Login.
- Main UI: Navbar, NewsTicker, Dashboard (Module Cards), sub-pages.
- Audio: MusicPlayer.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Testing Track | Custom Node.js test suite for Tiers 1-4, `TEST_READY.md` | None | PLANNED |
| 2 | Entry Experience | BootScreen (R1) & Login Page (R4) | M1 | PLANNED |
| 3 | Navigation & Main UI | Dashboard cards (R3) & Navbar (R6) | M1 | PLANNED |
| 4 | Feedback & Error States | 404 Page (R2) & Shimmer/Skeletons (R5) | M1 | PLANNED |
| 5 | Responsive & Final | Responsive check (R7) & Adversarial coverage (Phase 2) | M2, M3, M4 | PLANNED |

## Interface Contracts
### Client ↔ Server
- All auth flow endpoints (`/api/auth/*`) must remain fully functional.
- The `.lite` class must be applied dynamically to `<html>` based on context.
- Component-level animations must conditionally check `lite` and `prefers-reduced-motion` settings.

## Code Layout
- `src/app/` — Pages and routing layout.
- `src/components/` — Standalone shared UI components.
- `src/lib/` — Helper scripts, context providers.
- `tests/` — Test scripts and runners.
