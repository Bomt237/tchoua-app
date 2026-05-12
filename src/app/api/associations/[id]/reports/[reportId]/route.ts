import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; reportId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, reportId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const report = await prisma.associationReport.findFirst({
    where: { id: reportId, associationId: id },
  });

  if (!report) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });

  return NextResponse.json({ report });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; reportId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, reportId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const report = await prisma.associationReport.findFirst({
    where: { id: reportId, associationId: id },
  });
  if (!report) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });

  await prisma.associationReport.delete({ where: { id: reportId } });
  return NextResponse.json({ ok: true });
}
