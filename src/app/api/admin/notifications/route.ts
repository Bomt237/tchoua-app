import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    // On récupère les notifications système envoyées récemment par les admins
    const notifications = await prisma.notification.findMany({
      where: { type: "SYSTEM" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("[GET /api/admin/notifications]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    const { title, message, target } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });
    }

    // Si target === "ALL", on envoie à tout le monde
    // Note: Dans une vraie app, on utiliserait un worker de fond.
    if (target === "ALL") {
      const users = await prisma.user.findMany({ select: { id: true } });
      
      // On crée les notifications en batch (Prisma n'a pas createMany pour SQLite sur des relations, mais ici on peut simuler)
      await Promise.all(users.map(user => 
        prisma.notification.create({
          data: {
            userId: user.id,
            title,
            message,
            type: "SYSTEM",
          }
        })
      ));
    } else {
      // Pour une association spécifique par exemple
      const memberships = await prisma.associationMembership.findMany({
        where: { associationId: target },
        select: { userId: true }
      });

      await Promise.all(memberships.map(m => 
        prisma.notification.create({
          data: {
            userId: m.userId,
            title,
            message,
            type: "SYSTEM",
          }
        })
      ));
    }

    // Audit
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "NOTIFICATION_SENT",
        entity: "NOTIFICATIONS",
        details: `Envoi d'une notification système : "${title}" à la cible "${target}"`,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/notifications]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
