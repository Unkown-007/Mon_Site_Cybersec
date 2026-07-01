/*
 * Comptes credentials "en dur" (versionnés) — pour ajouter des opérateurs
 * sans configurer d'env : il suffit de committer/pousser.
 * Le mot de passe n'est JAMAIS stocké en clair : seul le hachage PBKDF2-SHA256
 * (120 000 itérations) + sel est conservé. Vérification côté serveur uniquement.
 *
 * Ajouter quelqu'un : générer sel+hash avec
 *   node -e 'const{pbkdf2Sync,randomBytes}=require("node:crypto");
 *   const s=randomBytes(16).toString("hex");
 *   console.log(s, pbkdf2Sync("MOTDEPASSE",Buffer.from(s,"hex"),120000,32,"sha256").toString("hex"))'
 */

export const SEED_ITER = 120000;

export interface SeedAccount {
  email: string;
  name: string;
  role: "admin" | "operator";
  salt: string;
  hash: string;
}

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    email: "lorenzo.rivallin@efrei.net",
    name: "Lorenzo Rivallin",
    role: "operator",
    salt: "02937d9e303f64b6bd8ba68e75935d77",
    hash: "a45b70522008e4d4b4d5e7a0df5aff631aff58530dec311a783ee2fe8463437e",
  },
];
