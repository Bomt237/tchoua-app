import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const { borrowerId, amount, interestRate, duration, notes } = await req.json();

  const tontine = await prisma.tontine.findUnique({ where: { id }, select: { caisseBalance: true } });
  if (!tontine) return NextResponse.json({ error: "Tontine introuvable" }, { status: 404 });
  if (amount > tontine.caisseBalance) return NextResponse.json({ error: "Montant supérieur à la caisse disponible" }, { status: 400 });

  const totalDue = amount * (1 + (interestRate / 100) * duration);

  const [loan] = await prisma.$transaction([
    prisma.caisseLoan.create({ data: { tontineId: id, borrowerId, amount, interestRate, duration, totalDue, notes, status: "ACTIVE" } }),
    prisma.tontine.update({ where: { id }, data: { caisseBalance: { decrement: amount } } }),
    prisma.caisseEntry.create({ data: { tontineId: id, type: "LOAN_OUT", amount: -amount, description: `Prêt caisse à ${borrowerId}` } })
  ]);

  return NextResponse.json(loan, { status: 201 });
}
