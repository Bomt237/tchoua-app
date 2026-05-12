import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const associationIdFilter = searchParams.get("associationId");
    
    // 1. Fetch memberships of the user
    const memberships = await prisma.associationMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        ...(associationIdFilter ? { associationId: associationIdFilter } : {}),
      },
      include: {
        association: true,
      },
    });

    if (memberships.length === 0) {
      return NextResponse.json({ events: [], associations: [] });
    }

    const associationIds = memberships.map(m => m.associationId);
    const membershipIds = memberships.map(m => m.id);

    // List of associations for the filter
    const associations = memberships.map(m => ({
      id: m.association.id,
      name: m.association.name,
      logo: m.association.logo,
    }));

    // 2. Fetch AssocMeetings
    const meetings = await prisma.assocMeeting.findMany({
      where: {
        associationId: { in: associationIds },
        status: { not: "CANCELLED" }
      },
      include: {
        association: {
          select: { name: true, id: true }
        }
      }
    });

    // 3. Fetch ActivitySessions
    const activitySessions = await prisma.activitySession.findMany({
      where: {
        activity: {
          associationId: { in: associationIds }
        },
        status: { not: "CANCELLED" }
      },
      include: {
        activity: {
          include: {
            association: { select: { name: true, id: true } }
          }
        },
        contributions: {
          where: { membershipId: { in: membershipIds } }
        },
        beneficiaries: {
          where: { membershipId: { in: membershipIds } }
        }
      }
    });

    const events: any[] = [];

    // Map meetings
    meetings.forEach((meeting) => {
      events.push({
        id: `meeting-${meeting.id}`,
        title: meeting.title || `Réunion ${meeting.type}`,
        start: meeting.scheduledAt,
        type: "MEETING",
        associationId: meeting.associationId,
        associationName: meeting.association.name,
        location: meeting.location,
        expectedExpense: 0,
        expectedIncome: 0,
      });
    });

    // Map sessions and calculate expenses/incomes
    activitySessions.forEach((session) => {
      let expectedExpense = 0;
      let expectedIncome = 0;

      session.contributions.forEach((contrib) => {
        if (contrib.status !== "PAID" && contrib.status !== "EXCUSED") {
          expectedExpense += contrib.amount;
        }
      });

      session.beneficiaries.forEach((beneficiary) => {
        if (!beneficiary.paidAt) {
          expectedIncome += beneficiary.amount;
        }
      });

      events.push({
        id: `session-${session.id}`,
        title: `Session: ${session.activity.name}`,
        start: session.scheduledAt,
        type: "SESSION",
        associationId: session.activity.associationId,
        associationName: session.activity.association.name,
        expectedExpense,
        expectedIncome,
      });
    });

    // Sort events by date
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json({ events, associations });

  } catch (error: any) {
    console.error("Erreur GET /api/calendar:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
