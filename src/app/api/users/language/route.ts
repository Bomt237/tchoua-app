import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { language } = await req.json();
  const builtin = ["fr", "en", "es", "de"];
  if (!builtin.includes(language)) {
    const exists = await prisma.appLanguage.findUnique({ where: { code: language } });
    if (!exists || !exists.enabled) return NextResponse.json({ error: "Langue invalide" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: session.user.id }, data: { language } });
  return NextResponse.json({ success: true });
}
