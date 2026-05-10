import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");
  if (!tontineId) return NextResponse.json({ error: "tontineId requis" }, { status: 400 });

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, tontineId, status: "ACTIVE" },
  });
  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const channels = await prisma.chatChannel.findMany({
    where: { tontineId },
    include: {
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(channels);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { tontineId, name, description, type = "PUBLIC" } = await req.json();
  if (!tontineId || !name) return NextResponse.json({ error: "tontineId et name requis" }, { status: 400 });

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, tontineId, status: "ACTIVE" },
  });
  if (!membership || !["PRESIDENT", "TREASURER", "SECRETARY"].includes(membership.role)) {
    return NextResponse.json({ error: "Rôle insuffisant" }, { status: 403 });
  }

  const channel = await prisma.chatChannel.create({
    data: { tontineId, name, description, type },
  });
  return NextResponse.json(channel, { status: 201 });
}
