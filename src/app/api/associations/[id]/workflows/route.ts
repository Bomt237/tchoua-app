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

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");

  const workflows = await prisma.approvalWorkflow.findMany({
    where: { associationId: id, ...(entityType ? { entityType } : {}) },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ workflows });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  if (!BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const body = await req.json();
  const { name, entityType, votingLevel, minVotesRequired, timeoutHours, steps } = body;

  if (!name || !entityType) {
    return NextResponse.json({ error: "name et entityType sont requis" }, { status: 400 });
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return NextResponse.json({ error: "Au moins une étape est requise" }, { status: 400 });
  }

  try {
    const workflow = await prisma.approvalWorkflow.create({
      data: {
        associationId: id,
        name,
        entityType,
        votingLevel: votingLevel ?? "STANDARD",
        minVotesRequired: minVotesRequired ?? null,
        timeoutHours: timeoutHours ?? 72,
        steps: {
          create: steps.map((s: any) => ({
            stepNumber: s.stepNumber,
            roleRequired: s.roleRequired,
            action: s.action ?? "APPROVE",
          })),
        },
      },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
