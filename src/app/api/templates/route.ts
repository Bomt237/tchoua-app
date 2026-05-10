import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const origin = searchParams.get("origin");

  const where: any = { isActive: true, visibility: "PUBLIC" };
  if (category) where.category = category;
  if (origin) where.origin = origin;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const templates = await prisma.associationTemplate.findMany({
    where,
    include: { activities: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ usageCount: "desc" }, { rating: "desc" }],
  });

  return NextResponse.json({ templates });
}
