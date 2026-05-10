import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = session.user.id;

  const [memberships, contributions, loans, socialAids, savingsGoals, scoringRecords] = await Promise.all([
    prisma.membership.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        tontine: {
          include: {
            contributions: { where: { status: "PAID" }, select: { amount: true, createdAt: true } },
            sessions: { select: { id: true, status: true, amount: true, beneficiaryId: true } },
          },
        },
      },
    }),
    prisma.contribution.findMany({
      where: { userId },
      include: { tontine: { select: { id: true, name: true, currency: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loan.findMany({
      where: { borrowerId: userId },
      include: {
        tontine: { select: { id: true, name: true } },
        repayments: { select: { amount: true, paidAt: true } },
      },
    }),
    prisma.socialAid.findMany({
      where: { requesterId: userId },
      include: { tontine: { select: { id: true, name: true } } },
    }),
    prisma.savingsGoal.findMany({
      where: { userId },
      select: { name: true, targetAmount: true, currentAmount: true, status: true, category: true },
    }),
    prisma.scoringRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  // Per-tontine breakdown
  const tontineBreakdown = memberships.map((m) => {
    const myContribs = contributions.filter((c) => c.tontineId === m.tontineId);
    const myLoans = loans.filter((l) => l.tontineId === m.tontineId);
    const totalContributed = myContribs.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
    const totalLate = myContribs.filter((c) => c.status === "LATE").length;
    const totalPending = myContribs.filter((c) => c.status === "PENDING").length;
    const beneficiarySession = m.tontine.sessions.find((s) => s.beneficiaryId === userId);
    const totalReceived = beneficiarySession?.amount || 0;
    const activeLoan = myLoans.find((l) => ["REPAYING", "APPROVED"].includes(l.status));
    const loanBalance = activeLoan ? activeLoan.amount - activeLoan.repayments.reduce((s, r) => s + r.amount, 0) : 0;

    return {
      tontineId: m.tontineId,
      tontineName: m.tontine.name,
      tontineType: m.tontine.type,
      role: m.role,
      joinedAt: m.joinedAt,
      totalContributed,
      totalReceived,
      netBalance: totalReceived - totalContributed,
      loanBalance,
      totalLate,
      totalPending,
      contributionCount: myContribs.length,
      currency: m.tontine.currency,
    };
  });

  // Monthly evolution (last 12 months)
  const monthlyData: Record<string, { contributed: number; received: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = { contributed: 0, received: 0 };
  }

  contributions
    .filter((c) => c.status === "PAID" && c.paidAt)
    .forEach((c) => {
      const d = new Date(c.paidAt!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key].contributed += c.amount;
      }
    });

  // Cross-tontine totals
  const totalContributed = contributions.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
  const totalPending = contributions.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.amount, 0);
  const totalLate = contributions.filter((c) => c.status === "LATE").length;
  const activeLoanTotal = loans
    .filter((l) => ["REPAYING", "APPROVED"].includes(l.status))
    .reduce((s, l) => s + (l.amount - l.repayments.reduce((r, rp) => r + rp.amount, 0)), 0);
  const totalSavings = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalSavingsTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);

  // Engagement score per category
  const scoreByCat: Record<string, number> = {};
  scoringRecords.forEach((r) => {
    scoreByCat[r.category] = (scoreByCat[r.category] || 0) + r.points;
  });

  return NextResponse.json({
    summary: {
      tontineCount: memberships.length,
      totalContributed,
      totalPending,
      totalLate,
      activeLoanTotal,
      totalSavings,
      totalSavingsTarget,
      savingsGoalCount: savingsGoals.length,
    },
    tontineBreakdown,
    monthlyEvolution: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })),
    savingsGoals,
    scoreByCat,
    recentTransactions: contributions.slice(0, 20),
  });
}
