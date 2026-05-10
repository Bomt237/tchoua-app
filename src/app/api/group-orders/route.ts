import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const associationId = searchParams.get("associationId");
  if (!associationId) return NextResponse.json({ error: "associationId requis" }, { status: 400 });

  const orders = await prisma.groupOrder.findMany({
    where: { tontineId: associationId }, // Mapping associationId to tontineId field
    include: {
      initiator: { select: { id: true, name: true } },
      items: {
        include: { user: { select: { id: true, name: true } } },
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { associationId, title, description, unitPrice, targetQty, deadline } = body;

  if (!associationId || !title || !unitPrice) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const membership = await prisma.associationMembership.findFirst({
    where: { userId: session.user.id, associationId, status: "ACTIVE" },
  });
  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const order = await prisma.groupOrder.create({
    data: {
      tontineId: associationId, // Mapping associationId to tontineId field
      initiatorId: session.user.id,
      title,
      description,
      unitPrice: parseFloat(unitPrice),
      targetQty: targetQty ? parseFloat(targetQty) : null,
      deadline: deadline ? new Date(deadline) : null,
    },
    include: {
      initiator: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
