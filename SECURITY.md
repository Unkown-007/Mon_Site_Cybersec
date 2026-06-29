# Sécurité — UnknownX-077

Posture de sécurité de la plateforme. Pour signaler une faille :
voir [`/.well-known/security.txt`](public/.well-known/security.txt).

## Authentification & session
- Session signée **HMAC-SHA256** (Web Crypto), cookie **httpOnly + Secure +
  SameSite=Lax**, expiration 7 jours. Le secret (`AUTH_SECRET`) vit uniquement
  côté serveur ; en production l'app refuse de démarrer sans secret fort
  (fail-closed).
- Identifiants admin vérifiés **côté serveur** (comparaison à temps constant),
  jamais exposés au navigateur.
- OAuth GitHub / Google en flux *authorization code* avec **paramètre `state`
  anti-CSRF** (cookie httpOnly, à usage unique).
- Accès aux pages protégé par **middleware** (redirection `/login` avant rendu).

## Durcissement des API
- **Rate limiting** (Vercel KV, fenêtre fixe) :
  - login : 15/15 min par IP, 6/15 min par IP+email ;
  - envoi du code de récupération du coffre : 5/h par IP ;
  - proxy IA : 30/5 min par IP.
- **Anti-CSRF** : vérification d'origine (`Origin`/`Referer` vs `Host`) sur
  toutes les routes mutantes (login, logout, vault, admin, collections, IA).
- **Validation stricte** des entrées (typage, listes blanches de rôles/statuts).
- Proxy IA en **bring-your-own-key** : la clé transite une fois, jamais
  journalisée ni stockée.

## Coffre (Vault)
- Chiffrement **AES-256-GCM** côté client, clé de données aléatoire (DEK)
  emballée par **PBKDF2-SHA256** (mot de passe maître + code de récupération).
- Mot de passe maître jamais transmis ni stocké. Reset par code de
  récupération sans perte de données. Auto-lock après 5 min d'inactivité,
  presse-papier auto-effacé, révélation auto-masquée.

## En-têtes HTTP (toutes les réponses)
- **Content-Security-Policy** restrictive (`default-src 'self'`, `object-src
  'none'`, `frame-ancestors 'none'`, `frame-src 'none'`,
  `upgrade-insecure-requests`).
- **HSTS** `max-age=2 ans; includeSubDomains; preload`.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`.
- **Permissions-Policy** : caméra, micro, géoloc, paiement, USB, capteurs,
  `browsing-topics`… désactivés.
- **Cross-Origin-Opener-Policy** / **Cross-Origin-Resource-Policy**
  `same-origin`, `X-Permitted-Cross-Domain-Policies: none`,
  `X-DNS-Prefetch-Control: off`, `X-Powered-By` masqué.

## Disponibilité
- Sans base KV connectée, le rate limiting est *fail-open* (la disponibilité
  prime) ; les autres défenses restent actives.
