import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MANAGEMENT_ROLES = ["PRESIDENT", "TREASURER"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId } = await params;

  try {
    const currentMember = await prisma.associationMembership.findFirst({
      where: {
        userId: session.user.id,
        associationId,
        role: { in: MANAGEMENT_ROLES },
      },
    });

    if (!currentMember) {
      return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    }

    const webhooks = await prisma.associationWebhook.findMany({
      where: { associationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ webhooks });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId } = await params;

  try {
    const currentMember = await prisma.associationMembership.findFirst({
      where: {
        userId: session.user.id,
        associationId,
        role: { in: MANAGEMENT_ROLES },
      },
    });

    if (!currentMember) {
      return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    }

    const body = await req.json();
    const { url, secret, events } = body as {
      url: string;
      secret?: string;
      events: string[];
    };

    if (!url || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "url et events requis" }, { status: 400 });
    }

    const webhook = await prisma.associationWebhook.create({
      data: {
        associationId,
        url,
        secret: secret || null,
        events: JSON.stringify(events),
      },
    });

    return NextResponse.json({ success: true, webhook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
