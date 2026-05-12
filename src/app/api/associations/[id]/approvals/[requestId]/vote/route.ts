import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateApprovalRequest } from "@/lib/association/governance";

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
    include: { customRole: true },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, requestId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const body = await req.json();
  const { vote, comment } = body;

  if (!vote || !["FOR", "AGAINST", "ABSTAIN"].includes(vote)) {
    return NextResponse.json({ error: "vote doit être FOR, AGAINST ou ABSTAIN" }, { status: 400 });
  }

  const request = await prisma.approvalRequest.findFirst({
    where: { id: requestId, workflow: { associationId: id } },
    include: {
      workflow: { include: { steps: { orderBy: { stepNumber: "asc" } } } },
      votes: true,
    },
  });
  if (!request) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "La demande n'est plus en attente" }, { status: 400 });
  }

  // Vérifier expiration
  if (request.deadline && new Date(request.deadline) < new Date()) {
    await prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status: "EXPIRED", decidedAt: new Date() },
    });
    return NextResponse.json({ error: "La demande a expiré" }, { status: 410 });
  }

  // Vérifier le rôle requis pour l'étape actuelle
  const currentStep = request.workflow.steps.find((s) => s.stepNumber === request.currentStep);
  if (!currentStep) {
    return NextResponse.json({ error: "Aucune étape active pour cette demande" }, { status: 400 });
  }

  const hasRole =
    membership.role === currentStep.roleRequired ||
    membership.customRole?.name === currentStep.roleRequired;

  if (!hasRole) {
    return NextResponse.json(
      { error: `Rôle requis : ${currentStep.roleRequired}` },
      { status: 403 }
    );
  }

  // Vérifier que le membre n'a pas déjà voté
  const existingVote = request.votes.find((v) => v.membershipId === membership.id);
  if (existingVote) {
    return NextResponse.json({ error: "Vous avez déjà voté" }, { status: 409 });
  }

  try {
    await prisma.approvalVote.create({
      data: {
        requestId,
        membershipId: membership.id,
        vote,
        comment: comment ?? null,
      },
    });

    // Mettre à jour les compteurs
    const updateData: any = {};
    if (vote === "FOR") updateData.votesFor = { increment: 1 };
    if (vote === "AGAINST") updateData.votesAgainst = { increment: 1 };
    if (vote === "ABSTAIN") updateData.votesAbstain = { increment: 1 };

    await prisma.approvalRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Évaluer le statut
    const evaluated = await evaluateApprovalRequest(requestId, prisma);

    return NextResponse.json({ request: evaluated }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Vous avez déjà voté" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
