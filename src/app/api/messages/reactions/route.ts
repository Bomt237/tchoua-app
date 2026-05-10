import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { messageId, emoji } = await req.json();
  if (!messageId || !emoji) return NextResponse.json({ error: "messageId et emoji requis" }, { status: 400 });

  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId: session.user.id, emoji } },
  });

  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ removed: true });
  }

  const reaction = await prisma.messageReaction.create({
    data: { messageId, userId: session.user.id, emoji },
  });
  return NextResponse.json(reaction, { status: 201 });
}
