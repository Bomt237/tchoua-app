import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSignature } from "@/lib/association/webhooks";

const MANAGEMENT_ROLES = ["PRESIDENT", "TREASURER"];

export async function POST(
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

    const payload = {
      event: "TEST",
      timestamp: new Date().toISOString(),
      payload: {
        message: "Ceci est un événement de test",
        associationId,
        webhookId,
      },
    };

    const body = JSON.stringify(payload);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Event": "TEST",
    };

    if (webhook.secret) {
      const signature = generateSignature(webhook.secret, payload);
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
    });

    await prisma.associationWebhook.update({
      where: { id: webhook.id },
      data: {
        lastTriggeredAt: new Date(),
        lastStatus: String(response.status),
      },
    });

    const responseBody = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: responseBody.slice(0, 2000),
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
