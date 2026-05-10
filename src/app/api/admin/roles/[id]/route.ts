import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/roles/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Empêcher la suppression du rôle Admin Principal
    const role = await prisma.systemRole.findUnique({ where: { id } });
    if (!role) return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });
    if (role.name === "Admin Principal") {
      return NextResponse.json({ error: "Le rôle Admin Principal ne peut pas être supprimé" }, { status: 403 });
    }

    // Dissocier les utilisateurs avant suppression
    await prisma.user.updateMany({
      where: { systemRoleId: id },
      data: { systemRoleId: null },
    });

    await prisma.systemRole.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/roles/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
