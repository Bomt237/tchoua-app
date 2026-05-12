import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleNextRun } from "@/lib/association/reports";

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
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const schedules = await prisma.reportSchedule.findMany({
    where: { associationId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ schedules });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership || !BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const body = await req.json();
  const {
    reportType,
    title,
    format = "PDF",
    frequency,
    dayOfMonth,
    dayOfWeek,
    hour = 8,
    parameters,
    recipients,
  } = body;

  if (!reportType || !title || !frequency) {
    return NextResponse.json(
      { error: "reportType, title et frequency sont requis" },
      { status: 400 }
    );

  }

  const nextRunAt = scheduleNextRun({
    frequency,
    dayOfMonth: dayOfMonth ?? null,
    dayOfWeek: dayOfWeek ?? null,
    hour,
    nextRunAt: null,
  });

  const schedule = await prisma.reportSchedule.create({
    data: {
      associationId: id,
      reportType,
      title,
      format,
      frequency,
      dayOfMonth: dayOfMonth ?? null,
      dayOfWeek: dayOfWeek ?? null,
      hour,
      parameters: parameters ? JSON.stringify(parameters) : null,
      recipients: recipients ? JSON.stringify(recipients) : null,
      nextRunAt,
    },
  });

  return NextResponse.json({ schedule }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership || !BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const body = await req.json();
  const { scheduleId, isActive } = body;

  if (!scheduleId) return NextResponse.json({ error: "scheduleId requis" }, { status: 400 });

  const schedule = await prisma.reportSchedule.findFirst({
    where: { id: scheduleId, associationId: id },
  });
  if (!schedule) return NextResponse.json({ error: "Planning introuvable" }, { status: 404 });

  const updated = await prisma.reportSchedule.update({
    where: { id: scheduleId },
    data: { isActive: isActive ?? schedule.isActive },
  });

  return NextResponse.json({ schedule: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership || !BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const body = await req.json();
  const { scheduleId } = body;

  if (!scheduleId) return NextResponse.json({ error: "scheduleId requis" }, { status: 400 });

  const schedule = await prisma.reportSchedule.findFirst({
    where: { id: scheduleId, associationId: id },
  });
  if (!schedule) return NextResponse.json({ error: "Planning introuvable" }, { status: 404 });

  await prisma.reportSchedule.delete({ where: { id: scheduleId } });
  return NextResponse.json({ ok: true });
}
