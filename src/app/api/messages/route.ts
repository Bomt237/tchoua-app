import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");
  const channelId = searchParams.get("channelId");
  const after = searchParams.get("after"); // ISO date for polling
  const limit = parseInt(searchParams.get("limit") || "50");

  if (!tontineId) return NextResponse.json({ error: "tontineId requis" }, { status: 400 });

  // Verify membership
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, tontineId, status: "ACTIVE" },
  });
  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: {
      tontineId,
      ...(channelId ? { channelId } : { channelId: null }),
      isDeleted: false,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true, level: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      replyTo: {
        select: { id: true, content: true, sender: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { tontineId, channelId, content, type = "TEXT", replyToId, mediaUrl } = body;

  if (!tontineId || !content?.trim()) {
    return NextResponse.json({ error: "tontineId et content requis" }, { status: 400 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, tontineId, status: "ACTIVE" },
  });
  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const message = await prisma.message.create({
    data: {
      tontineId,
      channelId: channelId || null,
      senderId: session.user.id,
      content: content.trim(),
      type,
      mediaUrl,
      replyToId: replyToId || null,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true, level: true } },
      reactions: true,
      replyTo: { select: { id: true, content: true, sender: { select: { name: true } } } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message || message.senderId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.message.update({ where: { id }, data: { isDeleted: true, content: "Message supprimé" } });
  return NextResponse.json({ success: true });
}
