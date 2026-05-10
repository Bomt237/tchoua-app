import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: associationId } = await params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const whereClause: any = { associationId };
    if (status) {
      whereClause.status = status;
    }

    const members = await prisma.associationMembership.findMany({
      where: whereClause,
      include: {
        user: true,
        customRole: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
