import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canVote } from "@/lib/association/governance";

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; electionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, electionId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const body = await req.json();
  const { candidateId, value = 1 } = body;

  if (!candidateId) {
    return NextResponse.json({ error: "candidateId est requis" }, { status: 400 });
  }
  if (![1, -1, 0].includes(value)) {
    return NextResponse.json({ error: "value doit être 1, -1 ou 0" }, { status: 400 });
  }

  const election = await prisma.election.findFirst({
    where: { id: electionId, associationId: id },
  });
  if (!election) return NextResponse.json({ error: "Élection introuvable" }, { status: 404 });

  const eligible = await canVote(electionId, membership.id, prisma);
  if (!eligible) {
    return NextResponse.json({ error: "Vous n'êtes pas éligible pour voter" }, { status: 403 });
  }

  const candidate = await prisma.electionCandidate.findFirst({
    where: { id: candidateId, electionId },
  });
  if (!candidate) return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });

  try {
    const vote = await prisma.electionVote.create({
      data: {
        electionId,
        membershipId: membership.id,
        candidateId,
        value,
      },
    });

    // Mettre à jour le compteur du candidat
    await prisma.electionCandidate.update({
      where: { id: candidateId },
      data: { votesCount: { increment: value } },
    });

    return NextResponse.json({ vote }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Vous avez déjà voté" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
