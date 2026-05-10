import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(["ROSCA", "ASCA", "NATURE", "SERVICE", "SOLIDARITY", "CULTURAL", "HYBRID"]),
  contributionAmount: z.number().min(0),
  contributionUnit: z.enum(["CASH", "NATURE", "SERVICE", "HYBRID"]).default("CASH"),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEASONAL", "ANNUAL"]),
  maxMembers: z.number().min(2).max(200).default(20),
  rules: z.string().optional(),
  region: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine") === "true";

  if (mine) {
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: {
        tontine: {
          include: {
            _count: { select: { memberships: { where: { status: "ACTIVE" } }, sessions: true } },
          },
        },
      },
    });
    return NextResponse.json({ tontines: memberships.map((m) => ({ ...m.tontine, myRole: m.role })) });
  }

  const tontines = await prisma.tontine.findMany({
    where: { isPublic: true, status: "ACTIVE" },
    include: { _count: { select: { memberships: { where: { status: "ACTIVE" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ tontines });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const tontine = await prisma.tontine.create({ data });

    await prisma.membership.create({
      data: {
        userId: session.user.id,
        tontineId: tontine.id,
        role: "PRESIDENT",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    });

    await prisma.scoringRecord.create({
      data: {
        userId: session.user.id,
        points: 20,
        reason: `Création de la tontine "${tontine.name}"`,
        category: "SOLIDARITY",
      },
    });

    return NextResponse.json({ tontine }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
