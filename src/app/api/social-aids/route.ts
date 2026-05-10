import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const aidSchema = z.object({
  tontineId: z.string(),
  type: z.enum(["BIRTH", "MARRIAGE", "DEATH", "ILLNESS", "DISASTER", "UNEMPLOYMENT", "EDUCATION", "ENTREPRENEURSHIP", "OTHER"]),
  description: z.string().min(10),
  cashAmount: z.number().min(0).default(0),
  natureDetails: z.string().optional(),
  serviceDetails: z.string().optional(),
  urgencyLevel: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).default("NORMAL"),
  isAnonymous: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tontineId = searchParams.get("tontineId");

  const aids = await prisma.socialAid.findMany({
    where: tontineId ? { tontineId } : { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      requester: { select: { name: true, avatar: true } },
      tontine: { select: { name: true } },
    },
  });

  const safeAids = aids.map((a) => ({
    ...a,
    requester: a.isAnonymous ? null : a.requester,
  }));

  return NextResponse.json({ aids: safeAids });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = aidSchema.parse(body);

    const membership = await prisma.membership.findUnique({
      where: { userId_tontineId: { userId: session.user.id, tontineId: data.tontineId } },
    });
    if (!membership || membership.status !== "ACTIVE") {
      return NextResponse.json({ error: "Vous n'êtes pas membre actif de cette tontine" }, { status: 403 });
    }

    const aid = await prisma.socialAid.create({
      data: {
        requesterId: session.user.id,
        tontineId: data.tontineId,
        type: data.type,
        description: data.description,
        cashAmount: data.cashAmount,
        natureDetails: data.natureDetails,
        serviceDetails: data.serviceDetails,
        urgencyLevel: data.urgencyLevel,
        isAnonymous: data.isAnonymous,
      },
    });

    return NextResponse.json({ aid }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
