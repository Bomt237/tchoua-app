import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MANAGEMENT_ROLES = ["PRESIDENT", "TREASURER"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId, webhookId } = await params;

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

    const webhook = await prisma.associationWebhook.findFirst({
      where: { id: webhookId, associationId },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook introuvable" }, { status: 404 });
    }

    return NextResponse.json({ webhook });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId, webhookId } = await params;

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
    const { url, events, isActive } = body as {
      url?: string;
      events?: string[];
      isActive?: boolean;
    };

    const dataToUpdate: Record<string, unknown> = {};
    if (url !== undefined) dataToUpdate.url = url;
    if (events !== undefined) dataToUpdate.events = JSON.stringify(events);
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    const webhook = await prisma.associationWebhook.update({
      where: { id: webhookId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, webhook });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId, webhookId } = await params;

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

    await prisma.associationWebhook.delete({
      where: { id: webhookId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
