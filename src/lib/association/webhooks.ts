import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

export const SUPPORTED_WEBHOOK_EVENTS = [
  "MEMBER_JOINED",
  "MEMBER_LEFT",
  "MEETING_CREATED",
  "MEETING_HELD",
  "SESSION_CLOSED",
  "LOAN_APPROVED",
  "SOCIAL_AID_PAID",
  "STATUS_CHANGED",
] as const;

export type WebhookEvent = (typeof SUPPORTED_WEBHOOK_EVENTS)[number];

export function generateSignature(secret: string, payload: unknown): string {
  const body = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export async function triggerWebhook(
  {
    associationId,
    event,
    payload,
  }: {
    associationId: string;
    event: WebhookEvent;
    payload: Record<string, unknown>;
  },
  prisma: PrismaClient
) {
  const webhooks = await prisma.associationWebhook.findMany({
    where: {
      associationId,
      isActive: true,
    },
  });

  const activeWebhooks = webhooks.filter((wh) => {
    try {
      const events: string[] = JSON.parse(wh.events);
      return events.includes(event);
    } catch {
      return false;
    }
  });

  const results = await Promise.allSettled(
    activeWebhooks.map(async (wh) => {
      const body = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        payload,
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Webhook-Event": event,
      };

      if (wh.secret) {
        const signature = generateSignature(wh.secret, JSON.parse(body));
        headers["X-Webhook-Signature"] = `sha256=${signature}`;
      }

      const response = await fetch(wh.url, {
        method: "POST",
        headers,
        body,
      });

      await prisma.associationWebhook.update({
        where: { id: wh.id },
        data: {
          lastTriggeredAt: new Date(),
          lastStatus: String(response.status),
        },
      });

      return { webhookId: wh.id, status: response.status };
    })
  );

  return results;
}
