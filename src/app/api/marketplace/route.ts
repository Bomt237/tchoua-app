import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const associationId = searchParams.get("associationId");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  // Get all associations the user belongs to
  const userMemberships = await prisma.associationMembership.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { associationId: true },
  });
  const assocIds = userMemberships.map((m) => m.associationId);

  const listings = await prisma.marketplaceListing.findMany({
    where: {
      status: "ACTIVE",
      ...(associationId 
        ? { tontineId: associationId } // We use tontineId field for now as it maps to associationId in legacy-to-new bridge
        : { OR: [{ tontineId: { in: assocIds } }, { tontineId: null }] }
      ),
      ...(category ? { category } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { description: { contains: search } }] } : {}),
    },
    include: {
      seller: { select: { id: true, name: true, avatar: true, location: true } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { title, description, category, price, unit, quantity, location, associationId, type, isGroupBuy, minGroupQty } = body;

  if (!title || !price) return NextResponse.json({ error: "title et price requis" }, { status: 400 });

  const listing = await prisma.marketplaceListing.create({
    data: {
      sellerId: session.user.id,
      title,
      description,
      category: category || "PRODUIT",
      price: parseFloat(price),
      unit: unit || "unité",
      quantity: quantity ? parseFloat(quantity) : null,
      location,
      tontineId: associationId || null, // Mapping associationId to tontineId field
      type: type || "VENTE",
      isGroupBuy: !!isGroupBuy,
      minGroupQty: minGroupQty ? parseInt(minGroupQty) : null,
    },
    include: {
      seller: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
