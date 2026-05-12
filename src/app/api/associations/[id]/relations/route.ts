import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
  });
}

async function isPresidentOrFounder(userId: string, associationId: string) {
  const membership = await getMembership(userId, associationId);
  return membership && ["PRESIDENT", "FOUNDER"].includes(membership.role);
}

async function getAncestors(associationId: string): Promise<Set<string>> {
  const ancestors = new Set<string>();
  const queue = [associationId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    const assoc = await prisma.association.findUnique({
      where: { id: current },
      select: { parentId: true },
    });

    if (assoc?.parentId && !ancestors.has(assoc.parentId)) {
      ancestors.add(assoc.parentId);
      queue.push(assoc.parentId);
    }

    const mothers = await prisma.associationRelation.findMany({
      where: { targetId: current, type: "MOTHER" },
      select: { sourceId: true },
    });
    for (const m of mothers) {
      if (!ancestors.has(m.sourceId)) {
        ancestors.add(m.sourceId);
        queue.push(m.sourceId);
      }
    }

    const childrenRelations = await prisma.associationRelation.findMany({
      where: { sourceId: current, type: "CHILD" },
      select: { targetId: true },
    });
    for (const c of childrenRelations) {
      if (!ancestors.has(c.targetId)) {
        ancestors.add(c.targetId);
        queue.push(c.targetId);
      }
    }
  }

  return ancestors;
}

async function wouldCreateCycle(sourceId: string, targetId: string): Promise<boolean> {
  if (sourceId === targetId) return true;
  const ancestors = await getAncestors(targetId);
  return ancestors.has(sourceId);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const association = await prisma.association.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!association) {
    return NextResponse.json(
      { error: "Association introuvable" },
      { status: 404 }
    );
  }

  const membership = await getMembership(session.user.id, id);
  if (!membership && !isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [sourceRelations, targetRelations] = await prisma.$transaction([
    prisma.associationRelation.findMany({
      where: { sourceId: id },
      include: {
        target: {
          select: { id: true, name: true, type: true, status: true },
        },
      },
    }),
    prisma.associationRelation.findMany({
      where: { targetId: id },
      include: {
        source: {
          select: { id: true, name: true, type: true, status: true },
        },
      },
    }),
  ]);

  return NextResponse.json({ sourceRelations, targetRelations });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: sourceId } = await params;
  const body = await req.json().catch(() => ({}));
  const { targetId, type, notes } = body;

  if (!targetId || !type) {
    return NextResponse.json(
      { error: "targetId et type requis" },
      { status: 400 }
    );
  }

  if (!["MOTHER", "CHILD", "SISTER"].includes(type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  const [sourceAssoc, targetAssoc] = await prisma.$transaction([
    prisma.association.findUnique({ where: { id: sourceId } }),
    prisma.association.findUnique({ where: { id: targetId } }),
  ]);

  if (!sourceAssoc || !targetAssoc) {
    return NextResponse.json(
      { error: "Association source ou cible introuvable" },
      { status: 404 }
    );
  }

  const isAdmin = isSuperAdmin(session);
  const canSource = isAdmin || (await isPresidentOrFounder(session.user.id, sourceId));
  const canTarget = isAdmin || (await isPresidentOrFounder(session.user.id, targetId));

  if (!canSource || !canTarget) {
    return NextResponse.json(
      { error: "Vous devez être président/fondateur des deux associations" },
      { status: 403 }
    );
  }

  if (await wouldCreateCycle(sourceId, targetId)) {
    return NextResponse.json(
      { error: "Cette relation créerait un cycle hiérarchique" },
      { status: 400 }
    );
  }

  try {
    const relation = await prisma.associationRelation.create({
      data: {
        sourceId,
        targetId,
        type,
        notes: notes ?? null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ relation }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Cette relation existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
