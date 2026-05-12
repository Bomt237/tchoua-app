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

function canPerformAction(
  session: any,
  actorMembership: any
): boolean {
  if (isSuperAdmin(session)) return true;
  if (!actorMembership) return false;
  if (actorMembership.role === "FOUNDER") return true;
  return ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"].includes(
    actorMembership.role
  );
}

type ActionType =
  | "SUSPEND"
  | "REACTIVATE"
  | "EXCLUDE"
  | "BLACKLIST"
  | "PROMOTE"
  | "RETROGRADE"
  | "TRANSFER_OWNERSHIP";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; membershipId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: associationId, membershipId } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, reason, newRole, newOwnerId } = body as {
    action: ActionType;
    reason?: string;
    newRole?: string;
    newOwnerId?: string;
  };

  if (!action) {
    return NextResponse.json({ error: "action requise" }, { status: 400 });
  }

  const actorMembership = await getMembership(session.user.id, associationId);
  if (!canPerformAction(session, actorMembership)) {
    return NextResponse.json(
      { error: "Permission insuffisante" },
      { status: 403 }
    );
  }

  const targetMembership = await prisma.associationMembership.findFirst({
    where: { id: membershipId, associationId },
  });

  if (!targetMembership) {
    return NextResponse.json(
      { error: "Membre introuvable" },
      { status: 404 }
    );
  }

  const now = new Date();
  let updateData: any = {};
  let auditAction = "";
  let auditDetails = "";

  switch (action) {
    case "SUSPEND":
      updateData = { status: "SUSPENDED" };
      auditAction = "MEMBER_SUSPEND";
      auditDetails = reason ? `Suspension : ${reason}` : "Suspension du membre";
      break;

    case "REACTIVATE":
      updateData = { status: "ACTIVE" };
      auditAction = "MEMBER_REACTIVATE";
      auditDetails = reason
        ? `Réactivation : ${reason}`
        : "Réactivation du membre";
      break;

    case "EXCLUDE":
      updateData = {
        status: "EXPELLED",
        excludedAt: now,
        excludeReason: reason ?? null,
      };
      auditAction = "MEMBER_EXCLUDE";
      auditDetails = reason ? `Exclusion : ${reason}` : "Exclusion du membre";
      break;

    case "BLACKLIST":
      updateData = {
        status: "BLACKLISTED",
        blacklistedAt: now,
        blacklistReason: reason ?? null,
      };
      auditAction = "MEMBER_BLACKLIST";
      auditDetails = reason
        ? `Blacklist : ${reason}`
        : "Mise en blacklist du membre";
      break;

    case "PROMOTE":
      if (!newRole) {
        return NextResponse.json(
          { error: "newRole requis pour PROMOTE" },
          { status: 400 }
        );
      }
      updateData = { role: newRole };
      auditAction = "MEMBER_PROMOTE";
      auditDetails = `Promotion vers ${newRole}`;
      break;

    case "RETROGRADE":
      if (!newRole) {
        return NextResponse.json(
          { error: "newRole requis pour RETROGRADE" },
          { status: 400 }
        );
      }
      updateData = { role: newRole };
      auditAction = "MEMBER_RETROGRADE";
      auditDetails = `Rétrogradation vers ${newRole}`;
      break;

    case "TRANSFER_OWNERSHIP":
      if (!newOwnerId) {
        return NextResponse.json(
          { error: "newOwnerId requis pour TRANSFER_OWNERSHIP" },
          { status: 400 }
        );
      }

      if (
        actorMembership?.role !== "FOUNDER" &&
        actorMembership?.role !== "PRESIDENT"
      ) {
        return NextResponse.json(
          { error: "Transfert réservé au président ou fondateur" },
          { status: 403 }
        );
      }

      const newOwner = await prisma.associationMembership.findFirst({
        where: {
          userId: newOwnerId,
          associationId,
          status: "ACTIVE",
        },
      });

      if (!newOwner) {
        return NextResponse.json(
          { error: "Nouveau propriétaire introuvable ou inactif" },
          { status: 404 }
        );
      }

      // Rétrograder l'ancien PRESIDENT s'il existe et que ce n'est pas le nouveau
      const currentPresident = await prisma.associationMembership.findFirst({
        where: { associationId, role: "PRESIDENT", status: "ACTIVE" },
      });

      if (currentPresident && currentPresident.id !== newOwner.id) {
        await prisma.associationMembership.update({
          where: { id: currentPresident.id },
          data: { role: "MEMBER" },
        });
      }

      // Promouvoir le nouveau propriétaire
      if (newOwner.id !== membershipId) {
        await prisma.associationMembership.update({
          where: { id: newOwner.id },
          data: { role: "PRESIDENT" },
        });
      }

      updateData = { role: "PRESIDENT" };
      auditAction = "TRANSFER_OWNERSHIP";
      auditDetails = `Transfert de présidence à ${newOwnerId}`;
      break;

    default:
      return NextResponse.json(
        { error: "Action non supportée" },
        { status: 400 }
      );
  }

  try {
    const updated = await prisma.associationMembership.update({
      where: { id: membershipId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.associationAuditLog.create({
      data: {
        associationId,
        userId: session.user.id,
        action: auditAction,
        entity: "MEMBERSHIP",
        entityId: membershipId,
        changes: JSON.stringify(updateData),
        details: auditDetails,
      },
    });

    return NextResponse.json({ success: true, membership: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erreur lors de l'action" },
      { status: 500 }
    );
  }
}
