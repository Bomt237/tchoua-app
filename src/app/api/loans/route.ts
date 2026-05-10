import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loanSchema = z.object({
  tontineId: z.string(),
  amount: z.number().min(1000),
  interestRate: z.number().min(0).max(50).default(5),
  duration: z.number().int().min(1).max(24),
  purpose: z.string().min(5),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");
  const mine = searchParams.get("mine") === "true";

  const where: Record<string, unknown> = {};
  if (tontineId) where.tontineId = tontineId;
  if (mine) where.borrowerId = session.user.id;

  const loans = await prisma.loan.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      borrower: { select: { name: true, avatar: true } },
      tontine: { select: { name: true } },
      repayments: true,
    },
  });

  return NextResponse.json({ loans });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = loanSchema.parse(body);

    const membership = await prisma.membership.findUnique({
      where: { userId_tontineId: { userId: session.user.id, tontineId: data.tontineId } },
    });
    if (!membership || membership.status !== "ACTIVE") {
      return NextResponse.json({ error: "Vous n'êtes pas membre actif de cette tontine" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { score: true, level: true } });
    const maxAmounts: Record<string, number> = {
      NOVICE: 50000, ACTIF: 200000, ENGAGE: 500000, LEADER: 1000000, LEGENDE: 9999999,
    };
    const maxAmount = maxAmounts[user?.level || "NOVICE"];
    if (data.amount > maxAmount) {
      return NextResponse.json({ error: `Votre niveau limite les prêts à ${maxAmount} FCFA` }, { status: 400 });
    }

    const loan = await prisma.loan.create({
      data: {
        borrowerId: session.user.id,
        tontineId: data.tontineId,
        amount: data.amount,
        interestRate: data.interestRate,
        duration: data.duration,
        purpose: data.purpose,
        notes: data.notes,
      },
    });

    return NextResponse.json({ loan }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
