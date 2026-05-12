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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; workflowId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, workflowId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const workflow = await prisma.approvalWorkflow.findFirst({
    where: { id: workflowId, associationId: id },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });
  if (!workflow) return NextResponse.json({ error: "Workflow introuvable" }, { status: 404 });

  return NextResponse.json({ workflow });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; workflowId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, workflowId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  if (!BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const body = await req.json();
  const { name, entityType, votingLevel, minVotesRequired, timeoutHours, steps } = body;

  const workflow = await prisma.approvalWorkflow.findFirst({
    where: { id: workflowId, associationId: id },
  });
  if (!workflow) return NextResponse.json({ error: "Workflow introuvable" }, { status: 404 });

  try {
    const updated = await prisma.approvalWorkflow.update({
      where: { id: workflowId },
      data: {
        ...(name !== undefined && { name }),
        ...(entityType !== undefined && { entityType }),
        ...(votingLevel !== undefined && { votingLevel }),
        ...(minVotesRequired !== undefined && { minVotesRequired: minVotesRequired ?? null }),
        ...(timeoutHours !== undefined && { timeoutHours }),
      },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    });

    // Si des steps sont fournies, on les remplace
    if (Array.isArray(steps) && steps.length > 0) {
      await prisma.approvalStep.deleteMany({ where: { workflowId } });
      await prisma.approvalStep.createMany({
        data: steps.map((s: any) => ({
          workflowId,
          stepNumber: s.stepNumber,
          roleRequired: s.roleRequired,
          action: s.action ?? "APPROVE",
        })),
      });
    }

    const refreshed = await prisma.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    });

    return NextResponse.json({ workflow: refreshed });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; workflowId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, workflowId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  if (!BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const workflow = await prisma.approvalWorkflow.findFirst({
    where: { id: workflowId, associationId: id },
  });
  if (!workflow) return NextResponse.json({ error: "Workflow introuvable" }, { status: 404 });

  await prisma.approvalWorkflow.update({
    where: { id: workflowId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
