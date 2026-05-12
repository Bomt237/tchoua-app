import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const status = searchParams.get("status");

  const requests = await prisma.approvalRequest.findMany({
    where: {
      workflow: { associationId: id },
      ...(status ? { status } : {}),
    },
    include: {
      workflow: { select: { name: true, entityType: true, votingLevel: true } },
      votes: { include: { membership: { include: { user: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const body = await req.json();
  const { workflowId, entityType, entityId, reason } = body;

  if (!workflowId || !entityType || !entityId) {
    return NextResponse.json({ error: "workflowId, entityType et entityId sont requis" }, { status: 400 });
  }

  const workflow = await prisma.approvalWorkflow.findFirst({
    where: { id: workflowId, associationId: id, isActive: true },
    include: { steps: true },
  });
  if (!workflow) return NextResponse.json({ error: "Workflow introuvable ou inactif" }, { status: 404 });

  const deadline = new Date();
  deadline.setHours(deadline.getHours() + workflow.timeoutHours);

  try {
    const request = await prisma.approvalRequest.create({
      data: {
        workflowId,
        entityType,
        entityId,
        requestedById: session.user.id,
        reason: reason ?? null,
        deadline,
        status: "PENDING",
        currentStep: workflow.steps.length > 0 ? 1 : 0,
      },
      include: {
        workflow: { include: { steps: { orderBy: { stepNumber: "asc" } } } },
        votes: true,
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
