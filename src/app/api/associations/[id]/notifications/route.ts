import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId } = await params;
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  try {
    const membership = await prisma.associationMembership.findUnique({
      where: {
        userId_associationId: {
          userId: session.user.id,
          associationId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 403 });
    }

    const notifications = await prisma.associationNotification.findMany({
      where: {
        associationId,
        membershipId: membership.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = await prisma.associationNotification.count({
      where: {
        associationId,
        membershipId: membership.id,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId } = await params;

  try {
    const body = await req.json();
    const { ids } = body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids requis" }, { status: 400 });
    }

    const membership = await prisma.associationMembership.findUnique({
      where: {
        userId_associationId: {
          userId: session.user.id,
          associationId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 403 });
    }

    await prisma.associationNotification.updateMany({
      where: {
        id: { in: ids },
        associationId,
        membershipId: membership.id,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId } = await params;

  try {
    const membership = await prisma.associationMembership.findUnique({
      where: {
        userId_associationId: {
          userId: session.user.id,
          associationId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 403 });
    }

    await prisma.associationNotification.deleteMany({
      where: {
        associationId,
        membershipId: membership.id,
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
