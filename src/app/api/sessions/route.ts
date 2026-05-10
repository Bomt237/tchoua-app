import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sessionSchema = z.object({
  tontineId: z.string(),
  sessionNumber: z.number().int().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  beneficiaryId: z.string().optional(),
  amount: z.number().min(0),
  unit: z.enum(["CASH", "NATURE", "SERVICE", "HYBRID"]).default("CASH"),
  drawMethod: z.enum(["RANDOM", "PREDEFINED", "VOTE", "AUCTION"]).default("RANDOM"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");

  const where: Record<string, unknown> = {};
  if (tontineId) where.tontineId = tontineId;

  const sessions = await prisma.session.findMany({
    where,
    orderBy: { sessionNumber: "asc" },
    include: {
      tontine: { select: { name: true } },
      contributions: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = sessionSchema.parse(body);

    const membership = await prisma.membership.findUnique({
      where: { userId_tontineId: { userId: session.user.id, tontineId: data.tontineId } },
    });
    if (!membership || !["PRESIDENT", "TREASURER", "SECRETARY"].includes(membership.role)) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    let beneficiaryId = data.beneficiaryId;
    if (!beneficiaryId && data.drawMethod === "RANDOM") {
      const members = await prisma.membership.findMany({
        where: { tontineId: data.tontineId, status: "ACTIVE" },
      });
      const idx = Math.floor(Math.random() * members.length);
      beneficiaryId = members[idx]?.userId;
    }

    const tontineSession = await prisma.session.create({
      data: {
        tontineId: data.tontineId,
        sessionNumber: data.sessionNumber,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        beneficiaryId,
        amount: data.amount,
        unit: data.unit,
        drawMethod: data.drawMethod,
        notes: data.notes,
        status: "UPCOMING",
      },
    });

    if (beneficiaryId) {
      await prisma.notification.create({
        data: {
          userId: beneficiaryId,
          title: "Vous êtes le bénéficiaire !",
          message: `Vous avez été désigné(e) bénéficiaire de la session #${data.sessionNumber}.`,
          type: "SESSION_BENEFICIARY",
        },
      });
    }

    return NextResponse.json({ session: tontineSession }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
