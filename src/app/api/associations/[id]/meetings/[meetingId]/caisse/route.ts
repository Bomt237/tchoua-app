import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; meetingId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: associationId, meetingId } = await params;

  try {
    const meeting = await prisma.assocMeeting.findUnique({
      where: { id: meetingId },
      include: {
        attendances: {
          include: {
            membership: {
              include: { user: true }
            }
          }
        },
        sessionContributions: true,
        sanctions: true
      }
    });

    if (!meeting) return NextResponse.json({ error: "Réunion introuvable" }, { status: 404 });

    const totalCollected = meeting.sessionContributions.reduce((acc, c) => acc + c.totalAmount, 0);
    const membersPaid = meeting.sessionContributions.length;
    const membersInFailure = [...new Set(meeting.sanctions.map(s => s.membershipId))].length;

    // Récupérer le nombre total de membres actifs de l'association
    const totalMembers = await prisma.associationMembership.count({
      where: { associationId, status: "ACTIVE" }
    });

    return NextResponse.json({
      meeting,
      kpis: {
        totalCollected,
        totalMembers,
        membersPaid,
        membersNotPaid: totalMembers - membersPaid,
        membersInFailure
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
