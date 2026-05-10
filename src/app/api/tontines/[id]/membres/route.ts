import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: tontineId } = await params;
  const { userId, role = "MEMBER" } = await req.json();

  const requester = await prisma.membership.findUnique({
    where: { userId_tontineId: { userId: session.user.id, tontineId } },
  });

  if (!requester || !["PRESIDENT", "TREASURER", "SECRETARY"].includes(requester.role)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_tontineId: { userId, tontineId } },
  });
  if (existing) return NextResponse.json({ error: "Membre déjà dans la tontine" }, { status: 400 });

  const membership = await prisma.membership.create({
    data: { userId, tontineId, role, status: "ACTIVE", joinedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Bienvenue dans la tontine !",
      message: `Vous avez été ajouté(e) à une tontine.`,
      type: "MEMBER_JOINED",
    },
  });

  return NextResponse.json({ membership }, { status: 201 });
}
