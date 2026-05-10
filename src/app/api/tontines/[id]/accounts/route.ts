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
  const accounts = await prisma.tontineAccount.findMany({
    where: { tontineId: id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const member = await prisma.membership.findUnique({
    where: { userId_tontineId: { userId: session.user.id, tontineId: id } },
  });
  if (!member || !["PRESIDENT", "TREASURER", "TRESORIER"].includes(member.role)) {
    return NextResponse.json({ error: "Réservé au Président ou Trésorier" }, { status: 403 });
  }
  const body = await req.json();
  const { label, type, bankName, accountNumber, accountHolder, iban, bic, mobileNumber, mobileOperator, isDefault, notes } = body;
  if (!label) return NextResponse.json({ error: "Libellé obligatoire" }, { status: 400 });

  if (isDefault) {
    await prisma.tontineAccount.updateMany({ where: { tontineId: id }, data: { isDefault: false } });
  }
  const account = await prisma.tontineAccount.create({
    data: { tontineId: id, label, type: type || "BANK", bankName, accountNumber, accountHolder, iban, bic, mobileNumber, mobileOperator, isDefault: isDefault || false, notes },
  });
  return NextResponse.json(account, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const { accountId } = await req.json();
  const member = await prisma.membership.findUnique({
    where: { userId_tontineId: { userId: session.user.id, tontineId: id } },
  });
  if (!member || !["PRESIDENT", "TREASURER", "TRESORIER"].includes(member.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  await prisma.tontineAccount.delete({ where: { id: accountId } });
  return NextResponse.json({ success: true });
}
