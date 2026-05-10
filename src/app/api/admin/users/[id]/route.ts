import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH /api/admin/users/[id] — Mettre à jour un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { systemRoleId, isActive, name, phone } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(systemRoleId !== undefined && { systemRoleId }),
        ...(isActive !== undefined && { isActive }),
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
    });

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "USER_UPDATE",
        entity: "USER",
        entityId: id,
        details: `Mise à jour de l'utilisateur ${user.email}. Actif: ${isActive}, Rôle: ${systemRoleId}`,
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — Supprimer l'accès système (ou l'utilisateur)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;

    // On ne supprime pas forcément l'utilisateur de la base, mais on lui retire son rôle système
    const user = await prisma.user.update({
      where: { id },
      data: { systemRoleId: null, isActive: false },
    });

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "USER_REVOKE",
        entity: "USER",
        entityId: id,
        details: `Révocation de l'accès système pour ${user.email}`,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
