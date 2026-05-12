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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; meetingId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, meetingId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership || !BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const meeting = await prisma.assocMeeting.findFirst({
    where: { id: meetingId, associationId: id },
  });
  if (!meeting) return NextResponse.json({ error: "Réunion introuvable" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  let attendeeCount = body?.attendeeCount;

  if (attendeeCount === undefined || attendeeCount === null) {
    attendeeCount = await prisma.assocMeetingAttendance.count({
      where: { meetingId, status: { in: ["PRESENT", "LATE"] } },
    });
  }

  const totalMembers = await prisma.associationMembership.count({
    where: { associationId: id, status: "ACTIVE" },
  });

  let quorumReached = false;
  if (meeting.quorumRequired === null || meeting.quorumRequired === undefined) {
    quorumReached = true;
  } else if (totalMembers > 0) {
    quorumReached = (attendeeCount / totalMembers) * 100 >= meeting.quorumRequired;
  }

  const updated = await prisma.assocMeeting.update({
    where: { id: meetingId },
    data: { attendeeCount, quorumReached },
  });

  return NextResponse.json({ meeting: updated, attendeeCount, quorumReached, totalMembers });
}
