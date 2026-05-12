import { PrismaClient } from "@prisma/client";

type CreateNotificationInput = {
  associationId: string;
  membershipId?: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
};

type BroadcastInput = {
  title: string;
  message: string;
  type?: string;
  link?: string;
};

export async function createNotification(
  input: CreateNotificationInput,
  prisma: PrismaClient
) {
  return prisma.associationNotification.create({
    data: {
      associationId: input.associationId,
      membershipId: input.membershipId,
      title: input.title,
      message: input.message,
      type: input.type ?? "INFO",
      link: input.link,
    },
  });
}

export async function markAsRead(notificationId: string, prisma: PrismaClient) {
  return prisma.associationNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function getUnreadCount(
  associationId: string,
  membershipId: string,
  prisma: PrismaClient
) {
  return prisma.associationNotification.count({
    where: {
      associationId,
      membershipId,
      isRead: false,
    },
  });
}

export async function broadcastToAssociation(
  associationId: string,
  input: BroadcastInput,
  prisma: PrismaClient
) {
  const activeMembers = await prisma.associationMembership.findMany({
    where: {
      associationId,
      status: { in: ["ACTIVE", "PENDING"] },
    },
    select: { id: true },
  });

  const notifications = await prisma.$transaction(
    activeMembers.map((member) =>
      prisma.associationNotification.create({
        data: {
          associationId,
          membershipId: member.id,
          title: input.title,
          message: input.message,
          type: input.type ?? "INFO",
          link: input.link,
        },
      })
    )
  );

  return notifications;
}
