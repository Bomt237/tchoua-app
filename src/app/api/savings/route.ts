import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session.user.id },
    include: {
      contributions: { orderBy: { createdAt: "desc" } },
      tontine: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { name, description, targetAmount, deadline, type, category, tontineId, icon } = body;

  if (!name || !targetAmount) return NextResponse.json({ error: "name et targetAmount requis" }, { status: 400 });

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: session.user.id,
      name,
      description,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline ? new Date(deadline) : null,
      type: type || "PERSONAL",
      category: category || "OTHER",
      tontineId: tontineId || null,
      icon,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
