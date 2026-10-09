# Project: UnknownX-077 — plateforme cybersécurité

Espace personnel de cybersécurité (apprentissage, CTF, pentest, veille), thème
Akira / Cyberpunk. **Privé** (derrière login, `noindex`).

## Architecture
- **Framework** : Next.js 14 (App Router), TypeScript, Tailwind CSS 3, Framer Motion.
- **Backend** : Vercel KV (Upstash Redis) — *pas* de Supabase. Sans store connecté,
  l'app fonctionne en mode dégradé (pas de persistance).
- **Auth** : session signée HMAC (cookie httpOnly), credentials admin + OAuth
  GitHub/Google. Middleware protège toutes les pages.
- **Sécurité** : CSP stricte (YouTube autorisé pour le lecteur), rate limiting,
  anti-CSRF (origine), en-têtes durcis, `/.well-known/security.txt`.
- **Design system (v2)** : tokens 3 tiers (violet ~10 %, cyan ~3 %, neutres ~85 %) ;
  surfaces arrondies « verre fumé » à liseré dégradé (`.card`, `.hud-panel`,
  `.btn`, `.field`, `.hud-tab`, `.chip`, `.glass`) ; polices Space Grotesk /
  Inter / JetBrains Mono. Modes `lite` + `prefers-reduced-motion` respectés partout.
- **Règle perf** : animations continues uniquement en `transform` / `opacity`
  (jamais `filter`, `width`, `background-position`…), cascades plafonnées,
  pas de faux temps de chargement.
- **Fonds d'écran** : sélecteur dans le menu Affichage de la navbar — Halo
  (défaut, 100 % CSS), Neo-Tokyo, Matrix, Synthwave, Nébuleuse, Aurora, Void.

## Pages
Plan du site centralisé dans `src/lib/nav.ts` (navbar, tiroir mobile, palette,
raccourcis clavier, carte « Explorer » du dashboard).
- **Cœur** : `/` (dashboard : épingles, récents, CVE + CTF en direct, plan du
  site), `/login`, `/vault` (coffre chiffré AES-256), `/admin`.
- **Apprendre** : `/learn`, `/resources`, `/reference` (mémento), `/certifications`.
- **Outils** : `/toolkit`, `/playground`, `/tools` (mes scripts), `/arsenal`
  (annuaire), `/hardware`.
- **Pratique** : `/lab`, `/writeups`, `/stats` (progression).
- **Veille** : `/veille`, `/news`, `/map`, `/events` (agenda CTFtime + conférences), `/ai`.
- **Communauté** : `/profile`, `/team`, `/leaderboard`.

## Fonctions transverses
- Épingles (étoile sur pages, ressources, outils, plateformes) et pages
  récentes : `src/lib/pins.ts` (localStorage).
- Raccourcis : `g` + lettre (cf. `key` dans nav.ts), `?` aide, `/` ou Ctrl+K
  recherche, Ctrl+~ terminal.
- Flux en direct : `/api/cve` (NVD), `/api/kev` (CISA), `/api/ctf` (CTFtime),
  `/api/news` (RSS), `/api/threats` (DShield).

## État
Refonte visuelle premium + fonctionnalités : **livrée**. Le contenu à alimenter
par l'opérateur : `/writeups` (via l'admin inline).

## Contrats d'interface
- Les endpoints `/api/auth/*` doivent rester fonctionnels.
- La classe `.lite` s'applique dynamiquement ; les animations vérifient
  `lite` + `prefers-reduced-motion`.
- Le fond animé (canvas) vit dans le layout racine → pas de remount à la navigation.

## Layout du code
- `src/app/` — pages & routing. `src/components/` — UI partagée
  (dont `components/backgrounds/`). `src/lib/` — helpers & providers.
  `src/data/` — données curées (`mock.ts`, `learn.ts`, `arsenal.ts`, `hardware.ts`).
- `tests/` — suite E2E maison.

## Déploiement
Vercel. Prod = branche `main` (déploiement auto au push). Travail sur branche
puis merge vers `main`.
