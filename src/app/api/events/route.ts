import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");

  const userTontines = await prisma.membership.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { tontineId: true },
  });
  const tontineIds = userTontines.map((m) => m.tontineId);

  const events = await prisma.culturalEvent.findMany({
    where: {
      tontineId: tontineId ? tontineId : { in: tontineIds },
    },
    include: {
      tontine: { select: { id: true, name: true } },
      attendees: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      _count: { select: { attendees: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { tontineId, title, description, type, startDate, endDate, location, budget, isVirtual, meetingLink, maxAttendees } = body;

  if (!tontineId || !title || !startDate) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, tontineId, status: "ACTIVE" },
  });
  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const event = await prisma.culturalEvent.create({
    data: {
      tontineId,
      title,
      description,
      type: type || "REUNION",
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location,
      budget: budget ? parseFloat(budget) : null,
      isVirtual: !!isVirtual,
      meetingLink,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
    },
    include: {
      tontine: { select: { id: true, name: true } },
    },
  });

  // Auto-invite all active members
  const members = await prisma.membership.findMany({
    where: { tontineId, status: "ACTIVE" },
    select: { userId: true },
  });
  await prisma.culturalEventAttendee.createMany({
    data: members.map((m) => ({ eventId: event.id, userId: m.userId, status: "INVITED" })),
  });

  return NextResponse.json(event, { status: 201 });
}
