import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");

  const userTontines = await prisma.membership.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { tontineId: true },
  });
  const tontineIds = userTontines.map((m) => m.tontineId);

  const investments = await prisma.investment.findMany({
    where: {
      tontineId: tontineId ? tontineId : { in: tontineIds },
    },
    include: {
      proposer: { select: { id: true, name: true, avatar: true } },
      tontine: { select: { id: true, name: true, currency: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(investments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { tontineId, title, description, type, targetAmount, expectedReturn, duration } = body;

  if (!tontineId || !title || !targetAmount) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, tontineId, status: "ACTIVE" },
  });
  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const investment = await prisma.investment.create({
    data: {
      tontineId,
      proposerId: session.user.id,
      title,
      description,
      type: type || "PROJECT",
      targetAmount: parseFloat(targetAmount),
      expectedReturn: expectedReturn ? parseFloat(expectedReturn) : null,
      duration: duration ? parseInt(duration) : null,
      status: "PROPOSED",
    },
    include: {
      proposer: { select: { id: true, name: true } },
      tontine: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(investment, { status: 201 });
}
