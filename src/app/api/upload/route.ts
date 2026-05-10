import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const tontineId = formData.get("tontineId") as string | null;
  const docType = (formData.get("type") as string) || "AUTRE";
  const docName = (formData.get("name") as string) || file?.name || "document";

  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (!tontineId) return NextResponse.json({ error: "tontineId manquant" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorisé (PDF, JPEG, PNG seulement)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10MB)" }, { status: 400 });
  }

  // Verify membership
  const member = await prisma.membership.findUnique({
    where: { userId_tontineId: { userId: session.user.id, tontineId } },
  });
  if (!member) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  // Save file
  const uploadDir = join(process.cwd(), "public", "uploads", "tontines", tontineId);
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);

  const url = `/uploads/tontines/${tontineId}/${filename}`;

  const doc = await prisma.document.create({
    data: {
      tontineId,
      name: docName,
      type: docType,
      url,
      mimeType: file.type,
      fileSize: file.size,
      isPublic: true,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
