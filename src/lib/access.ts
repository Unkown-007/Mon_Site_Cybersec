import type { Role } from "@/lib/session";

/*
 * Règles d'accès centralisées : propriétaire(s) toujours admin, liste blanche
 * optionnelle, rôle par défaut à la première connexion.
 */

// Propriétaire du site — toujours admin, toujours autorisé.
export const OWNER_EMAILS = ["clem.berton.92@gmail.com"];

export function isOwner(email: string): boolean {
  return OWNER_EMAILS.includes(email.toLowerCase());
}

export function defaultRoleFor(email: string): Role {
  if (isOwner(email)) return "admin";
  const admin = (process.env.ADMIN_EMAIL || "").toLowerCase();
  return admin && email.toLowerCase() === admin ? "admin" : "operator";
}

export function isAllowedEmail(email: string): boolean {
  const e = email.toLowerCase();
  if (isOwner(e)) return true;
  const list = process.env.ALLOWED_EMAILS;
  if (!list) return true; // pas de restriction définie
  return list
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(e);
}
