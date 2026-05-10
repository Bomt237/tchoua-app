import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) {
    return NextResponse.json({ error: "Objectif introuvable" }, { status: 404 });
  }

  const { amount, notes } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: "Montant invalide" }, { status: 400 });

  const contribution = await prisma.savingsContribution.create({
    data: { goalId: id, amount: parseFloat(amount), notes },
  });

  const newAmount = goal.currentAmount + parseFloat(amount);
  const updatedGoal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      currentAmount: newAmount,
      status: newAmount >= goal.targetAmount ? "COMPLETED" : "ACTIVE",
    },
  });

  return NextResponse.json({ contribution, goal: updatedGoal }, { status: 201 });
}
