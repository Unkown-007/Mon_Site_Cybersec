# UnknownX-077 // VAULT
<img width="280" height="88" alt="image" src="https://github.com/user-attachments/assets/9d94fc43-e463-49e2-8319-879a26423c00" />


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
