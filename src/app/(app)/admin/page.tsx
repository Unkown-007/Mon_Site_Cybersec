"use client";

import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { StatusDot } from "@/components/StatusDot";
import { useAuth } from "@/lib/auth";

export default function AdminPage() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <StatusDot state="danger" />
          <span className="label text-danger">ACCÈS REFUSÉ — ADM</span>
        </div>
        <h1 className="font-display font-bold text-3xl text-ink mb-3">
          Zone réservée à l&apos;administrateur
        </h1>
        <p className="max-w-2xl text-muted leading-relaxed font-mono text-sm">
          [ERR] 403 — votre session ({user?.role ?? "anonyme"}) ne dispose pas
          des privilèges requis.
        </p>
      </div>
    );
  }

  return (
    <ModulePlaceholder
      code="ADM"
      title="Panneau d'administration"
      desc="Gestion du contenu, des utilisateurs et des statistiques du site."
      planned={[
        "CRUD ressources / write-ups / outils",
        "Gestion des utilisateurs (accès partagé équipe)",
        "Stats de fréquentation (visites, pages populaires)",
        "Gestion des flux RSS + ajout rapide de bookmarks",
      ]}
    />
  );
}
