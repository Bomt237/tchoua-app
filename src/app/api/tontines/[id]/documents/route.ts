import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const member = await prisma.membership.findUnique({
    where: { userId_tontineId: { userId: session.user.id, tontineId: id } },
  });
  if (!member) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const docs = await prisma.document.findMany({
    where: { tontineId: id, isPublic: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const { docId } = await req.json();
  const member = await prisma.membership.findUnique({
    where: { userId_tontineId: { userId: session.user.id, tontineId: id } },
  });
  if (!member || !["PRESIDENT", "SECRETARY", "SECRETAIRE"].includes(member.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  await prisma.document.delete({ where: { id: docId } });
  return NextResponse.json({ success: true });
}
