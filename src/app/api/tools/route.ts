import { NextResponse } from "next/server";
import { listTools } from "@/lib/toolstore";

/* Liste publique des outils ajoutés par l'admin (pour la page /tools). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ tools: await listTools() });
}
