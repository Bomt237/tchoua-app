import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/admin/users — Liste des utilisateurs système
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");
    const status = searchParams.get("status"); // active, inactive

    const users = await prisma.user.findMany({
      where: {
        // Un utilisateur système est un utilisateur qui a un systemRoleId
        // OU on peut vouloir lister tous les utilisateurs pour leur assigner un rôle
        systemRoleId: roleId ? roleId : { not: null },
        ...(status === "active" ? { isActive: true } : {}),
        ...(status === "inactive" ? { isActive: false } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        avatar: true,
        systemRoleId: true,
        systemRole: {
          select: { id: true, name: true }
        },
        createdAt: true,
        // Dernier login peut être déduit des logs ou d'un champ lastLogin s'il existait
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/admin/users — Créer un nouvel utilisateur système
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    const { name, email, password, systemRoleId, phone } = body;

    if (!name || !email || !password || !systemRoleId) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        systemRoleId,
        phone,
        isActive: true,
      },
    });

    // Logger l'action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "USER_CREATE",
        entity: "USER",
        entityId: user.id,
        details: `Création de l'utilisateur système ${user.email} avec le rôle ${systemRoleId}`,
      }
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    console.error("[POST /api/admin/users]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
