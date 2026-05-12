import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, requestId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const request = await prisma.approvalRequest.findFirst({
    where: { id: requestId, workflow: { associationId: id } },
    include: {
      workflow: { include: { steps: { orderBy: { stepNumber: "asc" } } } },
      votes: { include: { membership: { include: { user: { select: { name: true, email: true } } } } } },
    },
  });

  if (!request) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });

  return NextResponse.json({ request });
}
