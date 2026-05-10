import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, ALL_PERMISSIONS } from "@/lib/permissions";

async function getMembership(userId: string, associationId: string) {
  return prisma.associationMembership.findFirst({
    where: { userId, associationId, status: { not: "LEFT" } },
    include: { customRole: true },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, roleId } = await params;
  const membership = await getMembership(session.user.id, id);

  if (!hasPermission(session, membership, "MANAGE_ROLES")) {
    return NextResponse.json({ error: "Permission MANAGE_ROLES requise" }, { status: 403 });
  }

  const role = await prisma.associationCustomRole.findFirst({
    where: { id: roleId, associationId: id },
  });
  if (!role) return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });

  const body = await req.json();
  const { name, color, permissions } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = String(name).trim();
  if (color !== undefined) data.color = color;
  if (permissions !== undefined) {
    const cleanPerms = (Array.isArray(permissions) ? permissions : [])
      .filter((p) => typeof p === "string" && (ALL_PERMISSIONS as string[]).includes(p));
    data.permissions = JSON.stringify(cleanPerms);
  }

  const updated = await prisma.associationCustomRole.update({
    where: { id: roleId },
    data,
  });
  return NextResponse.json({ role: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, roleId } = await params;
  const membership = await getMembership(session.user.id, id);

  if (!hasPermission(session, membership, "MANAGE_ROLES")) {
    return NextResponse.json({ error: "Permission MANAGE_ROLES requise" }, { status: 403 });
  }

  // Détacher les membres avant suppression
  await prisma.associationMembership.updateMany({
    where: { associationId: id, customRoleId: roleId },
    data: { customRoleId: null },
  });

  await prisma.associationCustomRole.delete({ where: { id: roleId } });
  return NextResponse.json({ success: true });
}
