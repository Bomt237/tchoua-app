import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — liste publique des langues custom (pour fusion côté client)
export async function GET() {
  const langs = await prisma.appLanguage.findMany({ where: { enabled: true }, orderBy: { code: "asc" } });
  return NextResponse.json({
    languages: langs.map((l) => ({
      code: l.code,
      name: l.name,
      flag: l.flag,
      translations: safeParse(l.translations),
    })),
  });
}

// POST — ajout d'une langue custom (admin / authentifié)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { code, name, flag, translations } = body;
  if (!code || !name || !flag) return NextResponse.json({ error: "code, name, flag requis" }, { status: 400 });
  if (!/^[a-z]{2,8}$/.test(code)) return NextResponse.json({ error: "code invalide (2–8 lettres minuscules)" }, { status: 400 });

  const existing = await prisma.appLanguage.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "code déjà utilisé" }, { status: 409 });

  const lang = await prisma.appLanguage.create({
    data: {
      code, name, flag,
      translations: typeof translations === "string" ? translations : JSON.stringify(translations ?? {}),
      createdBy: session.user.id,
    },
  });
  return NextResponse.json({ language: lang }, { status: 201 });
}

// PATCH — édition (par code dans body)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { code, name, flag, translations, enabled } = body;
  if (!code) return NextResponse.json({ error: "code requis" }, { status: 400 });

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (flag !== undefined) data.flag = flag;
  if (enabled !== undefined) data.enabled = enabled;
  if (translations !== undefined) data.translations = typeof translations === "string" ? translations : JSON.stringify(translations);

  const lang = await prisma.appLanguage.update({ where: { code }, data });
  return NextResponse.json({ language: lang });
}

// DELETE ?code=xx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code requis" }, { status: 400 });

  await prisma.appLanguage.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return {}; }
}
