import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const templates = await prisma.associationTemplate.findMany({
      orderBy: { usageCount: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("[GET /api/admin/templates]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    const { name, description, category, config, status } = body;

    const template = await prisma.associationTemplate.create({
      data: {
        name,
        description,
        category,
        config: typeof config === "string" ? config : JSON.stringify(config),
        status: status || "DRAFT",
      },
    });

    // Audit
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "TEMPLATE_CREATE",
        entity: "TEMPLATE",
        entityId: template.id,
        details: `Création du modèle d'association: ${name}`,
      }
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/templates]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
