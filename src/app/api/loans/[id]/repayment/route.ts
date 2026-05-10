import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: loanId } = await params;
  const { amount, paymentMethod, reference, notes } = await req.json();

  const loan = await prisma.loan.findUnique({ where: { id: loanId }, include: { repayments: true } });
  if (!loan) return NextResponse.json({ error: "Prêt introuvable" }, { status: 404 });
  if (loan.borrowerId !== session.user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
  const totalOwed = loan.amount * (1 + loan.interestRate / 100);
  const remaining = totalOwed - totalRepaid;

  if (amount > remaining) {
    return NextResponse.json({ error: `Montant dépasse le restant dû (${remaining.toFixed(0)} FCFA)` }, { status: 400 });
  }

  const repayment = await prisma.loanRepayment.create({
    data: { loanId, amount, paymentMethod, reference, notes },
  });

  const newTotal = totalRepaid + amount;
  if (newTotal >= totalOwed) {
    await prisma.loan.update({ where: { id: loanId }, data: { status: "REPAID" } });
    await prisma.scoringRecord.create({
      data: {
        userId: session.user.id,
        points: 20,
        reason: "Prêt remboursé intégralement",
        category: "FINANCIAL_RELIABILITY",
      },
    });
    await prisma.user.update({ where: { id: session.user.id }, data: { score: { increment: 20 } } });
  } else {
    await prisma.loan.update({ where: { id: loanId }, data: { status: "REPAYING" } });
  }

  return NextResponse.json({ repayment, remaining: remaining - amount });
}
