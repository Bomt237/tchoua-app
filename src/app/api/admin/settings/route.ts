import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mocking settings persistence for now
let platformSettings = {
  siteName: "TCHOUA Platform",
  maintenanceMode: false,
  allowRegistration: true,
  defaultCurrency: "FCFA",
  supportEmail: "support@tchoua.com",
  kycRequired: true,
  maxAssociationLimit: 50,
  commissionRate: 1.5,
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    return NextResponse.json({ settings: platformSettings });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    platformSettings = { ...platformSettings, ...body };

    // Audit
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "SETTINGS_UPDATE",
        entity: "SETTINGS",
        details: `Mise à jour des paramètres de la plateforme`,
      }
    });

    return NextResponse.json({ settings: platformSettings });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
