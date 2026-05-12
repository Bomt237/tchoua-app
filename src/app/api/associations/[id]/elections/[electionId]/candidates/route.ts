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
  { params }: { params: Promise<{ id: string; electionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, electionId } = await params;
  const membership = await getMembership(session.user.id, id);
  if (!membership) return NextResponse.json({ error: "Accès réservé aux membres" }, { status: 403 });

  const election = await prisma.election.findFirst({
    where: { id: electionId, associationId: id },
  });
  if (!election) return NextResponse.json({ error: "Élection introuvable" }, { status: 404 });

  const candidates = await prisma.electionCandidate.findMany({
    where: { electionId },
    include: { membership: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ candidates });
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

  if (!BUREAU_ROLES.includes(membership.role)) {
    return NextResponse.json({ error: "Réservé aux membres du bureau" }, { status: 403 });
  }

  const body = await req.json();
  const { membershipId, position, manifesto } = body;

  if (!membershipId || !position) {
    return NextResponse.json({ error: "membershipId et position sont requis" }, { status: 400 });
  }

  const targetMembership = await prisma.associationMembership.findFirst({
    where: { id: membershipId, associationId: id, status: { not: "LEFT" } },
  });
  if (!targetMembership) {
    return NextResponse.json({ error: "Membre introuvable dans cette association" }, { status: 404 });
  }

  const election = await prisma.election.findFirst({
    where: { id: electionId, associationId: id },
  });
  if (!election) return NextResponse.json({ error: "Élection introuvable" }, { status: 404 });
  if (election.status !== "DRAFT") {
    return NextResponse.json({ error: "Impossible d'ajouter un candidat après l'ouverture" }, { status: 400 });
  }

  try {
    const candidate = await prisma.electionCandidate.create({
      data: {
        electionId,
        membershipId,
        position,
        manifesto: manifesto ?? null,
      },
      include: { membership: { include: { user: { select: { name: true, email: true } } } } },
    });
    return NextResponse.json({ candidate }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ce candidat est déjà inscrit pour ce poste" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
