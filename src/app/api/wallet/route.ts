import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rechercher ou créer le wallet du membre
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!wallet) {
      // Création du wallet si inexistant
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: "FCFA",
          status: "ACTIVE",
        },
        include: {
          transactions: true,
        },
      });
    }

    return NextResponse.json({ wallet });
  } catch (error: any) {
    console.error("Erreur GET /api/wallet:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
