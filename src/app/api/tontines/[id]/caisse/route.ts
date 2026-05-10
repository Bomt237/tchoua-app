import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const tontine = await prisma.tontine.findUnique({
    where: { id },
    select: { caisseBalance: true, caisseLoanRate: true, caisseLoanDuration: true, partAmount: true }
  });
  if (!tontine) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const [entries, loans] = await Promise.all([
    prisma.caisseEntry.findMany({ where: { tontineId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.caisseLoan.findMany({ where: { tontineId: id }, include: { borrower: { select: { name: true } } }, orderBy: { createdAt: "desc" } })
  ]);
  return NextResponse.json({ ...tontine, entries, loans });
}
