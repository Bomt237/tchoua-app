import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const associations = await prisma.association.findMany({
      where,
      include: {
        creator: {
          select: { name: true, email: true }
        },
        _count: {
          select: { memberships: true, activities: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ associations });
  } catch (error) {
    console.error("[GET /api/admin/associations]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID et statut requis" }, { status: 400 });
    }

    const association = await prisma.association.update({
      where: { id },
      data: { status },
    });

    // Audit
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "ASSOC_STATUS_UPDATE",
        entity: "ASSOCIATIONS",
        entityId: id,
        details: `Changement de statut de l'association "${association.name}" vers ${status}`,
      }
    });

    return NextResponse.json({ association });
  } catch (error) {
    console.error("[PATCH /api/admin/associations]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
