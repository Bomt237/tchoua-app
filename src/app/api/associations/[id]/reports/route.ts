import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BUREAU_ROLES = ["PRESIDENT", "FOUNDER", "VICE_PRESIDENT", "SECRETARY", "TREASURER", "SOLIDARITY_OFFICER"];

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "ACTIVITY";

  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  if (type === "ACTIVITY") {
    const isBureau = BUREAU_ROLES.includes(membership.role);
    if (!isBureau) return NextResponse.json({ error: "Rapport activité réservé au bureau" }, { status: 403 });

    const activities = await prisma.associationActivity.findMany({
      where: { associationId: id },
      include: {
        _count: { select: { subscriptions: true, actSessions: true } },
        actContributions: {
          where: { status: "PAID" },
          select: { amount: true, paidAt: true, unit: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const report = activities.map((act) => {
      const totalCollected = act.actContributions.reduce((sum: number, c: { amount: number }) => sum + (c.amount ?? 0), 0);
      const activeSubscriptions = act._count.subscriptions;
      const sessionCount = act._count.actSessions;
      const contributionCount = act.actContributions.length;
      const participationRate =
        activeSubscriptions > 0 ? (contributionCount / (activeSubscriptions * Math.max(sessionCount, 1))) * 100 : 0;

      return {
        activityId: act.id,
        activityName: act.name,
        type: act.type,
        status: act.status,
        participation: act.participation,
        activeSubscriptions,
        sessionCount,
        contributionCount,
        totalCollected,
        participationRate: Math.round(participationRate * 10) / 10,
        caisseBalance: act.caisseBalance,
      };
    });

    const grandTotal = report.reduce((sum, r) => sum + r.totalCollected, 0);
    return NextResponse.json({ type: "ACTIVITY", associationId: id, report, grandTotal });
  }

  if (type === "MEMBER") {
    const contributions = await prisma.activityContribution.findMany({
      where: { membershipId: membership.id },
      include: {
        activity: { select: { id: true, name: true, type: true } },
        session: { select: { id: true, sessionNumber: true, scheduledAt: true } },
      },
      orderBy: { paidAt: "desc" },
    });

    const beneficiaries = await prisma.activityBeneficiary.findMany({
      where: { membershipId: membership.id },
      include: {
        session: {
          include: { activity: { select: { id: true, name: true, type: true } } },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    const loans = await prisma.assocLoan.findMany({
      where: {
        borrowerMembershipId: membership.id,
        activity: { associationId: id },
      },
      include: {
        activity: { select: { id: true, name: true } },
        repayments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalContributed = contributions.reduce((sum, c) => sum + (c.amount ?? 0), 0);
    const totalReceived = beneficiaries.reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const totalLoaned = loans.reduce((sum, l) => sum + (l.amount ?? 0), 0);
    const totalRepaid = loans.flatMap((l) => l.repayments).reduce((sum, r) => sum + (r.amount ?? 0), 0);

    return NextResponse.json({
      type: "MEMBER",
      associationId: id,
      membershipId: membership.id,
      summary: { totalContributed, totalReceived, totalLoaned, totalRepaid },
      contributions,
      beneficiaries,
      loans,
    });
  }

  if (type === "CROSS") {
    // Aggregate across all associations the user belongs to
    const allMemberships = await prisma.associationMembership.findMany({
      where: { userId: session.user.id, status: { not: "LEFT" } },
      select: { id: true, associationId: true, role: true },
    });

    const membershipIds = allMemberships.map((m) => m.id);
    const assocIds = allMemberships.map((m) => m.associationId);

    const [contribAgg, benefAgg, loanAgg] = await Promise.all([
      prisma.activityContribution.groupBy({
        by: ["activityId"],
        where: { membershipId: { in: membershipIds }, status: "PAID" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.activityBeneficiary.findMany({
        where: { membershipId: { in: membershipIds } },
        select: { amount: true, session: { select: { activityId: true } } },
      }),
      prisma.assocLoan.findMany({
        where: { borrowerMembershipId: { in: membershipIds } },
        select: { amount: true, status: true, activity: { select: { associationId: true } } },
      }),
    ]);

    const associations = await prisma.association.findMany({
      where: { id: { in: assocIds } },
      select: { id: true, name: true, type: true },
    });

    const totalContributed = contribAgg.reduce((sum, g) => sum + (g._sum.amount ?? 0), 0);
    const totalReceived = benefAgg.reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const totalLoaned = loanAgg.reduce((sum, l) => sum + (l.amount ?? 0), 0);

    return NextResponse.json({
      type: "CROSS",
      associations,
      summary: {
        associationCount: allMemberships.length,
        totalContributed,
        totalReceived,
        totalLoaned,
        netBalance: totalReceived - totalContributed,
      },
      contributionsByActivity: contribAgg,
    });
  }

  if (type === "INVESTMENT") {
    // Rapport "Fonds d'Investissement" généralisé.
    // Cible toutes les activités INVESTISSEMENT/PRET de l'association.
    // Fournit un tableau de bord type ETS NDI MBE :
    //   Capital total, Prêts en cours, Prêt cumulé, Remboursements,
    //   Intérêts générés, Solde disponible, et détail par membre.

    const activities = await prisma.associationActivity.findMany({
      where: { associationId: id, type: { in: ["INVESTISSEMENT", "PRET"] } },
      select: { id: true, type: true },
    });
    const investActIds = activities.filter(a => a.type === "INVESTISSEMENT").map(a => a.id);
    const loanActIds   = activities.filter(a => a.type === "PRET").map(a => a.id);

    const [capitalContribs, loans, members] = await Promise.all([
      prisma.activityContribution.findMany({
        where: { activityId: { in: investActIds }, status: "PAID" },
        select: { membershipId: true, amount: true, paidAt: true },
      }),
      prisma.assocLoan.findMany({
        where: { activityId: { in: loanActIds.length ? loanActIds : investActIds } },
        include: { repayments: true, borrowerMembership: { select: { id: true, user: { select: { name: true, email: true } }, memberNumber: true } } },
        orderBy: { disbursedAt: "asc" },
      }),
      prisma.associationMembership.findMany({
        where: { associationId: id, status: "ACTIVE" },
        select: { id: true, memberNumber: true, joinedAt: true,
                  user: { select: { name: true, email: true } } },
      }),
    ]);

    const capitalTotal = capitalContribs.reduce((s, c) => s + c.amount, 0);
    const pretCumule   = loans.reduce((s, l) => s + l.amount, 0);
    const pretEnCours  = loans.filter(l => l.status === "ACTIVE" || l.status === "APPROVED")
                              .reduce((s, l) => s + l.amount, 0);
    const allRepayments = loans.flatMap(l => l.repayments);
    const remboursementsRecus = allRepayments.reduce((s, r) => s + r.amount, 0);
    const interetsGeneres = allRepayments.reduce((s, r) => s + (r.interest ?? 0), 0);
    const soldeDisponible = capitalTotal + remboursementsRecus - pretCumule;

    // Répartition proportionnelle des intérêts par membre (règle quote-part)
    const capitalByMembership: Record<string, number> = {};
    for (const c of capitalContribs) {
      capitalByMembership[c.membershipId] = (capitalByMembership[c.membershipId] ?? 0) + c.amount;
    }
    const memberRows = members.map(m => {
      const versement = capitalByMembership[m.id] ?? 0;
      const part = capitalTotal > 0 ? versement / capitalTotal : 0;
      const gainInteret = interetsGeneres * part;
      return {
        membershipId: m.id,
        memberNumber: m.memberNumber,
        name: m.user.name || m.user.email,
        joinedAt: m.joinedAt,
        versementInitial: versement,
        gainInteret: Math.round(gainInteret * 100) / 100,
        capitalCumule: Math.round((versement + gainInteret) * 100) / 100,
        partPct: Math.round(part * 10000) / 100,
      };
    }).sort((a, b) => b.versementInitial - a.versementInitial);

    const loanRows = loans.map(l => {
      const repaid = l.repayments.reduce((s, r) => s + r.amount, 0);
      return {
        id: l.id,
        member: l.borrowerMembership.user.name || l.borrowerMembership.user.email,
        amount: l.amount,
        rate: l.interestRate,
        duration: l.duration,
        disbursedAt: l.disbursedAt,
        dueDate: l.dueDate,
        interest: Math.max(0, l.totalDue - l.amount),
        totalDue: l.totalDue,
        repaid,
        encours: Math.max(0, l.totalDue - repaid),
        status: l.status,
      };
    });

    return NextResponse.json({
      type: "INVESTMENT",
      generatedAt: new Date().toISOString(),
      associationId: id,
      dashboard: {
        capitalTotal,
        pretEnCours,
        pretCumule,
        remboursementsRecus,
        interetsGeneres,
        soldeDisponible,
      },
      members: memberRows,
      loans: loanRows,
    });
  }

  return NextResponse.json({ error: "type doit être ACTIVITY, MEMBER, CROSS ou INVESTMENT" }, { status: 400 });
}
