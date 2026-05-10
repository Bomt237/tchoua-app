import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, membershipId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: associationId, membershipId } = await params;

  try {
    const body = await req.json();
    const { status, role } = body;

    // Check if the current user is an admin/president of the association
    const currentMember = await prisma.associationMembership.findFirst({
      where: {
        userId: session.user.id,
        associationId,
        role: { in: ["PRESIDENT", "SECRETARY", "FOUNDER"] } // Simplification pour les droits
      }
    });

    if (!currentMember) {
      return NextResponse.json({ error: "Vous n'avez pas les droits pour cette action" }, { status: 403 });
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (role) dataToUpdate.role = role;

    const membership = await prisma.associationMembership.update({
      where: { id: membershipId },
      data: dataToUpdate,
      include: { user: true }
    });

    return NextResponse.json({ success: true, membership });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
