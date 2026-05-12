import { PrismaClient } from "@prisma/client";

// ─── R-001 : Validation du nom / slug ─────────────────────────────────────
export async function validateAssociationName(
  name: string,
  prisma: PrismaClient
): Promise<{ valid: boolean; error?: string }> {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (!slug || slug.length < 2) {
    return { valid: false, error: "Nom trop court ou slug invalide" };
  }

  const existing = await prisma.association.findFirst({
    where: { nameSlug: slug },
  });

  if (existing) {
    return { valid: false, error: "Une association avec ce slug existe déjà" };
  }

  return { valid: true };
}

// ─── R-003 : Vérifie la présence des 3 rôles clés pour activation ─────────
export async function validateActivationRequirements(
  associationId: string,
  prisma: PrismaClient
): Promise<{ valid: boolean; error?: string }> {
  const requiredRoles = ["PRESIDENT", "SECRETARY", "TREASURER"];

  const memberships = await prisma.associationMembership.findMany({
    where: {
      associationId,
      status: "ACTIVE",
      role: { in: requiredRoles },
    },
  });

  const presentRoles = new Set(memberships.map((m) => m.role));
  const missing = requiredRoles.filter((r) => !presentRoles.has(r));

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Rôles manquants pour activation : ${missing.join(", ")}`,
    };
  }

  return { valid: true };
}

// ─── R-016 : Max 10 associations actives par membre ───────────────────────
export async function getMemberActiveAssociationCount(
  userId: string,
  prisma: PrismaClient
): Promise<number> {
  return prisma.associationMembership.count({
    where: {
      userId,
      status: "ACTIVE",
      association: { status: "ACTIVE" },
    },
  });
}

export async function validateMaxAssociationsPerMember(
  userId: string,
  prisma: PrismaClient
): Promise<{ valid: boolean; error?: string }> {
  const count = await getMemberActiveAssociationCount(userId, prisma);
  if (count >= 10) {
    return { valid: false, error: "Limite de 10 associations actives atteinte" };
  }
  return { valid: true };
}

// ─── R-021 : Total prêts actifs ≤ 80 % des fonds totaux ───────────────────
export async function validateLoanToFundRatio(
  associationId: string,
  prisma: PrismaClient
): Promise<{ valid: boolean; error?: string }> {
  const activities = await prisma.associationActivity.findMany({
    where: { associationId },
    select: { caisseBalance: true },
  });

  const totalFunds = activities.reduce(
    (sum, a) => sum + (a.caisseBalance ?? 0),
    0
  );

  const loans = await prisma.assocLoan.findMany({
    where: {
      activity: { associationId },
      status: { in: ["ACTIVE", "APPROVED"] },
    },
    select: { amount: true },
  });

  const totalLoans = loans.reduce(
    (sum, l) => sum + (l.amount ?? 0),
    0
  );

  if (totalFunds <= 0) {
    if (totalLoans > 0) {
      return {
        valid: false,
        error: "Pas de fonds disponibles mais des prêts actifs existent",
      };
    }
    return { valid: true };
  }

  const ratio = totalLoans / totalFunds;
  if (ratio > 0.8) {
    return {
      valid: false,
      error: `Ratio prêts/fonds de ${(ratio * 100).toFixed(1)}% dépasse la limite de 80%`,
    };
  }

  return { valid: true };
}

// ─── R-023 : Double validation pour les montants > 500 000 FCFA ──────────
export function validateDoubleValidation(
  amount: number,
  validators: string[]
): { valid: boolean; error?: string } {
  if (amount > 500_000 && validators.length < 2) {
    return {
      valid: false,
      error: "Montant supérieur à 500 000 FCFA : 2 validateurs requis",
    };
  }
  return { valid: true };
}

// ─── R-033 : Éligibilité à la conversion de modèle (90 jours actif) ───────
export async function validateTemplateConversionEligibility(
  associationId: string,
  prisma: PrismaClient
): Promise<{ valid: boolean; error?: string }> {
  const association = await prisma.association.findUnique({
    where: { id: associationId },
    select: { status: true, activatedAt: true },
  });

  if (!association) {
    return { valid: false, error: "Association introuvable" };
  }

  if (association.status !== "ACTIVE") {
    return { valid: false, error: "L'association doit être ACTIVE" };
  }

  if (!association.activatedAt) {
    return { valid: false, error: "Date d'activation inconnue" };
  }

  const daysActive =
    (Date.now() - new Date(association.activatedAt).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysActive < 90) {
    return {
      valid: false,
      error: `L'association est active depuis ${Math.floor(daysActive)} jours (minimum 90 requis)`,
    };
  }

  return { valid: true };
}

// ─── Matrice de transitions de statut ─────────────────────────────────────
export function validateStatusTransition(
  current: string,
  next: string
): boolean {
  const allowed: Record<string, string[]> = {
    DRAFT: ["PENDING"],
    PENDING: ["ACTIVE", "DRAFT"],
    ACTIVE: ["SUSPENDED", "DISSOLVED"],
    SUSPENDED: ["ACTIVE", "DISSOLVED"],
    DISSOLVED: [],
  };

  return allowed[current]?.includes(next) ?? false;
}
