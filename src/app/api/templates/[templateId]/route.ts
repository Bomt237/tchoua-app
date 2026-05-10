import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;

  const template = await prisma.associationTemplate.findUnique({
    where: { id: templateId },
    include: {
      activities: { orderBy: { sortOrder: "asc" } },
      ratings: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!template) return NextResponse.json({ error: "Modèle introuvable" }, { status: 404 });

  return NextResponse.json({ template });
}
