import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contribSchema = z.object({
  tontineId: z.string(),
  sessionId: z.string().optional(),
  amount: z.number().min(0),
  unit: z.enum(["CASH", "NATURE", "SERVICE", "HYBRID"]).default("CASH"),
  paymentMethod: z.string().optional(),
  reference: z.string().optional(),
  productId: z.string().optional(),
  productQty: z.number().optional(),
  serviceHours: z.number().optional(),
  notes: z.string().optional(),
  dueAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");
  const userId = searchParams.get("userId");
  const sessionId = searchParams.get("sessionId");

  const where: Record<string, unknown> = {};
  if (tontineId) where.tontineId = tontineId;
  if (userId) where.userId = userId;
  if (!tontineId && !userId) where.userId = session.user.id;
  if (sessionId) where.sessionId = sessionId;

  const contributions = await prisma.contribution.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, avatar: true } },
      tontine: { select: { name: true } },
      session: { select: { sessionNumber: true } },
    },
  });

  return NextResponse.json({ contributions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = contribSchema.parse(body);

    const membership = await prisma.membership.findUnique({
      where: { userId_tontineId: { userId: session.user.id, tontineId: data.tontineId } },
    });
    if (!membership || membership.status !== "ACTIVE") {
      return NextResponse.json({ error: "Vous n'êtes pas membre actif de cette tontine" }, { status: 403 });
    }

    const contribution = await prisma.contribution.create({
      data: {
        userId: session.user.id,
        tontineId: data.tontineId,
        sessionId: data.sessionId,
        amount: data.amount,
        unit: data.unit,
        paymentMethod: (data.paymentMethod as any) || null,
        reference: data.reference,
        productId: data.productId,
        productQty: data.productQty,
        serviceHours: data.serviceHours,
        notes: data.notes,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        status: "PAID",
        paidAt: new Date(),
        type: "COTISATION",
      },
    });

    await prisma.scoringRecord.create({
      data: {
        userId: session.user.id,
        points: 10,
        reason: "Cotisation payée à temps",
        category: "FINANCIAL_RELIABILITY",
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { score: { increment: 10 } },
    });

    return NextResponse.json({ contribution }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
