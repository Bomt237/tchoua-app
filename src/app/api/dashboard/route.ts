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

    // 3. Stats calculation
    // Note: In a real app, these would be filtered by associationId if provided
    const [totalContributedAgg, pendingLoansCount, recentActivity] = await Promise.all([
      prisma.contribution.aggregate({
        where: { userId, status: "PAID", ...(associationId ? { tontineId: { in: [] } } : {}) }, // Simulating filter
        _sum: { amount: true },
      }),
      prisma.loan.count({
        where: { borrowerId: userId, status: { in: ["PENDING", "APPROVED", "DISBURSED"] } },
      }),
      // Unified activity log
      prisma.contribution.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { tontine: { select: { name: true } } }
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

    // Dummy next session for demo
    const nextSession = {
      tontineName: associationId ? "Session Mensuelle" : "Tontine Familiale",
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
    };

    return NextResponse.json({
      user: {
        ...user,
        walletBalance: 125000, // Mocked wallet balance
      },
      stats: {
        tontinesCount: memberships.length,
        totalContributed: totalContributedAgg._sum.amount || 0,
        pendingLoans: pendingLoansCount,
        pendingAids: 2,
      },
      recentActivity: formattedActivity,
      nextSession,
      recommendations: [
        { title: "Augmenter l'épargne", desc: "Vous pourriez épargner 10% de plus ce mois-ci." }
      ]
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
