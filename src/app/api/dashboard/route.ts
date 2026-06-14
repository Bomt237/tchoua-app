import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const associationId = searchParams.get("associationId");

    // 1. Base User Info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, score: true, level: true, avatar: true },
    });

    // 2. Fetch memberships to count
    const membershipWhere: any = { userId, status: "ACTIVE" };
    if (associationId) membershipWhere.associationId = associationId;

    const memberships = await prisma.associationMembership.findMany({
      where: membershipWhere,
      include: {
        association: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    // 3. Stats calculation and real database queries
    const [
      totalContributedAgg,
      pendingLoansCount,
      recentActivity,
      pendingAidsCount,
      wallet,
      tontineMemberships,
      notifications
    ] = await Promise.all([
      prisma.contribution.aggregate({
        where: { userId, status: "PAID", ...(associationId ? { tontineId: { in: [] } } : {}) },
        _sum: { amount: true },
      }),
      prisma.loan.count({
        where: { borrowerId: userId, status: { in: ["PENDING", "APPROVED", "DISBURSED"] } },
      }),
      prisma.contribution.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { tontine: { select: { name: true } } }
      }),
      prisma.assocSocialAidRequest.count({
        where: { status: "PENDING", membership: { userId } }
      }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true }
      }),
      prisma.membership.findMany({
        where: { userId, status: "ACTIVE" },
        select: { tontineId: true }
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

    // Format activity
    const formattedActivity = recentActivity.map(act => ({
      type: 'CONTRIBUTION',
      label: `Cotisation ${act.tontine?.name || 'Tontine'}`,
      assocName: act.tontine?.name || 'Association',
      amount: act.amount,
      date: act.createdAt
    }));

    // Find real upcoming session
    let nextSession = null;
    const userTontineIds = tontineMemberships.map(m => m.tontineId);
    if (userTontineIds.length > 0) {
      const dbNextSession = await prisma.session.findFirst({
        where: {
          tontineId: { in: userTontineIds },
          status: "UPCOMING",
          startDate: { gte: new Date() }
        },
        orderBy: { startDate: "asc" },
        include: { tontine: { select: { name: true } } }
      });
      if (dbNextSession) {
        nextSession = {
          tontineName: dbNextSession.tontine.name,
          date: dbNextSession.startDate.toISOString(),
          amount: dbNextSession.amount,
        };
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        walletBalance: wallet?.balance ?? 0,
      },
      stats: {
        tontinesCount: memberships.length,
        totalContributed: totalContributedAgg._sum.amount || 0,
        pendingLoans: pendingLoansCount,
        pendingAids: pendingAidsCount,
      },
      recentActivity: formattedActivity,
      nextSession,
      notifications,
      recommendations: [
        { title: "Augmenter l'épargne", desc: "Vous pourriez épargner 10% de plus ce mois-ci." }
      ]
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
