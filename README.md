<img width="288" height="88" alt="image" src="https://github.com/user-attachments/assets/3d352482-d599-4b0b-b741-983ceac71083" />


Plateforme personnelle de cybersécurité — ressources, write-ups CTF, outils, veille threat-intel et notes de terrain. Thème **Akira / Cyberpunk**.

> Phase actuelle : **fondation + design system**. Auth et données sont **mockées localement** (pas de backend réel pour l'instant).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS 3** + design system custom (variables CSS)
- Fonts : **Orbitron** (titres) + **Share Tech Mono** (corps) via `next/font`
- Auth/données : **mock** (`localStorage`) — à remplacer par NextAuth + Supabase

## Démarrer

```bash
npm install
npm run dev
# http://localhost:3000  → redirige vers /login
```

### Connexion

Les identifiants admin sont **définis par variables d'environnement** (`ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `AUTH_SECRET`) — jamais en clair dans le code. Voir
[.env.local.example](.env.local.example). En dev sans `.env.local`, un repli
générique non sensible est utilisé ; en production ces variables sont **obligatoires**
(l'authentification est refusée à défaut).

OAuth GitHub/Google : optionnel ; restreins l'accès avec `ALLOWED_EMAILS`.
## Structure

```
src/
  app/
    layout.tsx          # racine : fonts, scanline, AuthProvider, ToastProvider
    login/page.tsx      # page de connexion (hors navbar)
    (app)/              # groupe protégé par la garde d'auth
      layout.tsx        # navbar + breadcrumb + boot screen
      page.tsx          # dashboard
      resources|writeups|tools|lab|veille|vault|admin/  # stubs des modules
  components/           # Navbar, Breadcrumb, Toast, FakeTerminal, cartes…
  lib/                  # auth (mock), nav
  data/                 # données mock (seed futur)
```

## Design system

Palette, typo et effets sont définis dans [tailwind.config.ts](tailwind.config.ts) et [src/app/globals.css](src/app/globals.css) :
couleurs (`base`, `surface`, `primary`, `secondary`…), classes `.card`, `.btn`, `.field`, `.label`, barre de scan, curseur clignotant.

## Prochaines étapes

1. Brancher **NextAuth** (GitHub + Google + credentials admin) et **Supabase/Prisma**.
2. Développer chaque module (CRUD ressources, éditeur write-ups Markdown, etc.).
3. Flux **CVE** réel via l'API NVD (NIST).
4. Zone `/vault` avec PIN + chiffrement client.
5. Command palette `Ctrl+K`.
