import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BUREAU_ROLES = ["PRESIDENT", "FOUNDER", "VICE_PRESIDENT", "TREASURER"];

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const isBureau = BUREAU_ROLES.includes(membership.role);

  const loans = await prisma.assocLoan.findMany({
    where: {
      activity: { associationId: id },
      ...(!isBureau && { borrowerMembershipId: membership.id }),
    },
    include: {
      borrowerMembership: { include: { user: { select: { name: true, email: true } } } },
      activity: { select: { name: true, type: true } },
      repayments: { orderBy: { paidAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const loansWithStatus = loans.map(l => {
    const isLate = l.status === "ACTIVE" && l.dueDate && new Date(l.dueDate) < now;
    const currentRate = isLate ? l.interestRate * 2 : l.interestRate;
    
    return {
      ...l,
      isLate,
      currentRate,
      repaidAmount: l.repayments.reduce((sum, r) => sum + r.amount, 0),
    };
  });

  return NextResponse.json({ loans: loansWithStatus });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const body = await req.json();
  const { activityId, amount, duration, purpose } = body;

  if (!activityId || !amount || !duration) {
    return NextResponse.json({ error: "activityId, amount et duration sont requis" }, { status: 400 });
  }

  const activity = await prisma.associationActivity.findFirst({
    where: { id: activityId, associationId: id },
  });
  if (!activity) return NextResponse.json({ error: "Activité introuvable" }, { status: 404 });

  const rate = duration <= 3
    ? (activity.loanRate1 ?? activity.caisseLoanRate ?? 5)
    : (activity.loanRate2 ?? activity.caisseLoanRate ?? 8);

  if (activity.loanMaxActive) {
    const activeCount = await prisma.assocLoan.count({
      where: { borrowerMembershipId: membership.id, activityId, status: { in: ["ACTIVE", "APPROVED"] } },
    });
    if (activeCount >= activity.loanMaxActive) {
      return NextResponse.json({ error: `Maximum ${activity.loanMaxActive} prêt(s) actif(s) autorisé(s)` }, { status: 400 });
    }
  }

  // Simplified interest calculation: Amount * (1 + Rate * Duration / 100)
  const totalDue = Math.round(amount * (1 + (rate * duration) / 100));
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + duration);

  const loan = await prisma.assocLoan.create({
    data: {
      activityId,
      borrowerMembershipId: membership.id,
      amount,
      interestRate: rate,
      duration,
      totalDue,
      purpose,
      status: "PENDING",
      dueDate,
    },
    include: {
      borrowerMembership: { include: { user: { select: { name: true, email: true } } } },
      activity: { select: { name: true } },
    },
  });

  return NextResponse.json({ loan }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const body = await req.json();
  const { loanId, action, amount, paymentMethod } = body;

  if (!loanId || !action) return NextResponse.json({ error: "loanId et action requis" }, { status: 400 });

  const loan = await prisma.assocLoan.findFirst({
    where: { id: loanId, activity: { associationId: id } },
  });
  if (!loan) return NextResponse.json({ error: "Prêt introuvable" }, { status: 404 });

  if (action === "APPROVE") {
    if (!BUREAU_ROLES.includes(membership.role)) {
      return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
    }
    await prisma.assocLoan.update({
      where: { id: loanId },
      data: { status: "ACTIVE", approvedAt: new Date(), disbursedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "REPAY") {
    if (!amount) return NextResponse.json({ error: "amount requis" }, { status: 400 });

    const repaidSoFar = await prisma.assocLoanRepayment.aggregate({
      where: { loanId },
      _sum: { amount: true },
    });
    const alreadyPaid = repaidSoFar._sum.amount ?? 0;
    
    // Check if late (Module 6.4)
    const isLate = loan.status === "ACTIVE" && loan.dueDate && new Date(loan.dueDate) < new Date();
    let effectiveTotalDue = loan.totalDue;
    
    if (isLate) {
      // Rule: Double the interest part if late
      const initialInterest = loan.totalDue - loan.amount;
      effectiveTotalDue = loan.totalDue + initialInterest; // Interest is doubled
    }

    const remaining = effectiveTotalDue - alreadyPaid;
    const actualAmount = Math.min(amount, remaining);
    
    // Pro-rata split between principal and interest
    const principal = Math.round(actualAmount * (loan.amount / effectiveTotalDue));
    const interest = actualAmount - principal;

    await prisma.assocLoanRepayment.create({
      data: {
        loanId,
        amount: actualAmount,
        principal,
        interest,
        paymentMethod: paymentMethod ?? "CASH",
        paidAt: new Date(),
      },
    });

    // Close loan if fully repaid
    const newTotal = alreadyPaid + actualAmount;
    if (newTotal >= effectiveTotalDue) {
      await prisma.assocLoan.update({ where: { id: loanId }, data: { status: "CLOSED", repaidAt: new Date() } });
    } else {
      await prisma.assocLoan.update({ where: { id: loanId }, data: { status: "ACTIVE" } });
    }

    return NextResponse.json({ ok: true, remaining: Math.max(0, effectiveTotalDue - newTotal) });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
