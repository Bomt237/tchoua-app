import { PrismaClient } from "@prisma/client";
import { validateStatusTransition } from "./rules";

export async function transitionAssociation(
  associationId: string,
  fromStatus: string,
  toStatus: string,
  userId: string,
  reason: string | undefined,
  prisma: PrismaClient
): Promise<{ association: any; event: any }> {
  if (!validateStatusTransition(fromStatus, toStatus)) {
    throw new Error(`Transition invalide : ${fromStatus} → ${toStatus}`);
  }

  const association = await prisma.association.findUnique({
    where: { id: associationId },
  });

  if (!association) {
    throw new Error("Association introuvable");
  }

  if (association.status !== fromStatus) {
    throw new Error(
      `Statut actuel incorrect : ${association.status} (attendu : ${fromStatus})`
    );
  }

  const updateData: any = { status: toStatus };

  if (toStatus === "ACTIVE" && !association.activatedAt) {
    updateData.activatedAt = new Date();
  }

  if (toStatus === "DISSOLVED") {
    updateData.dissolvedAt = new Date();
    if (reason) updateData.dissolutionReason = reason;
  }

  const [updatedAssociation, event] = await prisma.$transaction([
    prisma.association.update({
      where: { id: associationId },
      data: updateData,
    }),

    prisma.associationLifecycleEvent.create({
      data: {
        associationId,
        fromStatus,
        toStatus,
        triggeredBy: "USER",
        userId,
        reason: reason ?? null,
      },
    }),

    prisma.associationAuditLog.create({
      data: {
        associationId,
        userId,
        action: "STATUS_TRANSITION",
        entity: "ASSOCIATION",
        entityId: associationId,
        changes: JSON.stringify({ from: fromStatus, to: toStatus }),
        details: reason ?? `Transition ${fromStatus} → ${toStatus}`,
      },
    }),
  ]);

  return { association: updatedAssociation, event };
}
