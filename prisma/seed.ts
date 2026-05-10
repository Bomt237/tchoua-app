import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Tchoua database...");

  // ─── RBAC Système ────────────────────────────────────────────────────────
  console.log("🌱 Creating System RBAC...");

  // Permissions CRUD pour les ressources principales
  const resources = ["USERS", "ASSOCIATIONS", "TRANSACTIONS", "TEMPLATES", "LOGS", "SETTINGS", "CONTENT"];
  const actions = ["CREATE", "READ", "UPDATE", "DELETE"];

  for (const resource of resources) {
    for (const action of actions) {
      await prisma.systemPermission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action },
      });
    }
  }

  // Rôle Admin Principal
  const adminRole = await prisma.systemRole.upsert({
    where: { name: "Admin Principal" },
    update: {},
    create: {
      name: "Admin Principal",
      description: "Accès total à toutes les fonctionnalités et données de la plateforme.",
      permissions: {
        connect: resources.flatMap(resource => 
          actions.map(action => ({ resource_action: { resource, action } }))
        ),
      },
    },
  });

  // Utilisateur Admin par défaut
  const adminPassword = await bcrypt.hash("Admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@tchoua.com" },
    update: {},
    create: {
      email: "admin@tchoua.com",
      name: "Admin Principal",
      password: adminPassword,
      phone: "+237000000000",
      isVerified: true,
      role: "ADMIN",
      systemRoleId: adminRole.id,
    },
  });

  console.log("✓ Default Admin created: admin@tchoua.com / Admin1234");

  // Demo Users
  const demoPassword = await bcrypt.hash("demo123", 12);

  const demo = await prisma.user.upsert({
    where: { email: "demo@tchoua.cm" },
    update: {},
    create: {
      email: "demo@tchoua.cm", name: "Marie Ngono", password: demoPassword,
      phone: "+237677001122", profession: "commerce", location: "Yaoundé",
      score: 250, level: "ACTIF", isVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jean@tchoua.cm" },
    update: {},
    create: {
      email: "jean@tchoua.cm", name: "Jean-Baptiste Nkomo", password: demoPassword,
      phone: "+237699334455", profession: "agriculture", location: "Bafoussam",
      score: 480, level: "ENGAGE", isVerified: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "alice@tchoua.cm" },
    update: {},
    create: {
      email: "alice@tchoua.cm", name: "Alice Mballa", password: demoPassword,
      phone: "+237655223344", profession: "sante", location: "Douala",
      score: 120, level: "ACTIF", isVerified: true,
    },
  });

  console.log("✓ Users created");

  // Tontines
  const t1 = await prisma.tontine.upsert({
    where: { id: "tontine-demo-1" },
    update: {},
    create: {
      id: "tontine-demo-1", name: "Tontine des Femmes Entrepreneurs",
      description: "Tontine mensuelle pour les femmes entrepreneures de Yaoundé.",
      type: "ROSCA", contributionAmount: 25000, frequency: "MONTHLY",
      maxMembers: 12, region: "Yaoundé", status: "ACTIVE", isPublic: true,
      rules: "1. Cotisation payée avant le 5 du mois\n2. Pénalité de 2500 FCFA par jour de retard",
    },
  });

  const t2 = await prisma.tontine.upsert({
    where: { id: "tontine-demo-2" },
    update: {},
    create: {
      id: "tontine-demo-2", name: "Coopérative Agricole Bamiléké",
      description: "Tontine en nature pour les agriculteurs.",
      type: "NATURE", contributionAmount: 0, contributionUnit: "NATURE",
      frequency: "QUARTERLY", maxMembers: 20, region: "Bafoussam", status: "ACTIVE",
    },
  });

  const t3 = await prisma.tontine.upsert({
    where: { id: "tontine-demo-3" },
    update: {},
    create: {
      id: "tontine-demo-3", name: "Entraide Famille Mballa",
      description: "Fonds familial de solidarité.",
      type: "SOLIDARITY", contributionAmount: 5000, frequency: "MONTHLY",
      maxMembers: 30, region: "Douala", status: "ACTIVE",
    },
  });

  console.log("✓ Tontines created");

  // Memberships
  const membershipData = [
    { userId: demo.id, tontineId: t1.id, role: "PRESIDENT", joinedAt: new Date("2024-01-15") },
    { userId: user2.id, tontineId: t1.id, role: "TREASURER", joinedAt: new Date("2024-01-15") },
    { userId: user3.id, tontineId: t1.id, role: "MEMBER", joinedAt: new Date("2024-01-20") },
    { userId: user2.id, tontineId: t2.id, role: "PRESIDENT", joinedAt: new Date("2024-02-01") },
    { userId: demo.id, tontineId: t3.id, role: "MEMBER", joinedAt: new Date("2024-01-10") },
    { userId: user3.id, tontineId: t3.id, role: "SECRETARY", joinedAt: new Date("2024-01-10") },
  ];

  for (const m of membershipData) {
    await prisma.membership.upsert({
      where: { userId_tontineId: { userId: m.userId, tontineId: m.tontineId } },
      update: {},
      create: { ...m, status: "ACTIVE" },
    });
  }

  // Sessions
  for (let i = 1; i <= 3; i++) {
    await prisma.session.upsert({
      where: { id: `session-t1-${i}` },
      update: {},
      create: {
        id: `session-t1-${i}`, tontineId: t1.id, sessionNumber: i,
        startDate: new Date(`2024-0${i}-01`), endDate: new Date(`2024-0${i}-28`),
        amount: 300000, beneficiaryId: [demo.id, user2.id, user3.id][i - 1],
        status: i < 3 ? "COMPLETED" : "ACTIVE", drawMethod: "RANDOM",
      },
    });
  }

  // Contributions
  const contribs = [
    { userId: demo.id, tontineId: t1.id, amount: 25000, month: "2024-01", method: "MTN_MOMO" },
    { userId: demo.id, tontineId: t1.id, amount: 25000, month: "2024-02", method: "ORANGE_MONEY" },
    { userId: demo.id, tontineId: t1.id, amount: 25000, month: "2024-03", method: "MTN_MOMO" },
    { userId: demo.id, tontineId: t3.id, amount: 5000, month: "2024-01", method: "CASH" },
    { userId: demo.id, tontineId: t3.id, amount: 5000, month: "2024-02", method: "CASH" },
    { userId: user2.id, tontineId: t1.id, amount: 25000, month: "2024-01", method: "WAVE" },
    { userId: user2.id, tontineId: t1.id, amount: 25000, month: "2024-02", method: "WAVE" },
  ];

  for (let i = 0; i < contribs.length; i++) {
    const c = contribs[i];
    await prisma.contribution.upsert({
      where: { id: `contrib-${i}` },
      update: {},
      create: {
        id: `contrib-${i}`, userId: c.userId, tontineId: c.tontineId,
        amount: c.amount, unit: "CASH", paymentMethod: c.method as any,
        status: "PAID", type: "COTISATION",
        paidAt: new Date(`${c.month}-05`), createdAt: new Date(`${c.month}-05`),
      },
    });
  }

  // Loan
  await prisma.loan.upsert({
    where: { id: "loan-demo-1" },
    update: {},
    create: {
      id: "loan-demo-1", borrowerId: demo.id, tontineId: t1.id,
      amount: 75000, interestRate: 5, duration: 3,
      purpose: "Achat de stock pour ma boutique de tissu",
      status: "REPAYING", disbursedAt: new Date("2024-02-10"), dueDate: new Date("2024-05-10"),
    },
  });

  await prisma.loanRepayment.upsert({
    where: { id: "repayment-1" },
    update: {},
    create: {
      id: "repayment-1", loanId: "loan-demo-1",
      amount: 26250, paymentMethod: "MTN_MOMO", paidAt: new Date("2024-03-10"),
    },
  });

  // Social Aid
  await prisma.socialAid.upsert({
    where: { id: "aid-demo-1" },
    update: {},
    create: {
      id: "aid-demo-1", requesterId: user3.id, tontineId: t3.id,
      type: "ILLNESS", description: "Hospitalisation suite à un accident de la route.",
      cashAmount: 150000, urgencyLevel: "HIGH", status: "VALIDATED", isAnonymous: false,
    },
  });

  // Chat channels
  const generalChannel = await prisma.chatChannel.upsert({
    where: { id: "channel-t1-general" },
    update: {},
    create: { id: "channel-t1-general", tontineId: t1.id, name: "Général", type: "PUBLIC" },
  });

  const tresoChannel = await prisma.chatChannel.upsert({
    where: { id: "channel-t1-treso" },
    update: {},
    create: { id: "channel-t1-treso", tontineId: t1.id, name: "Trésorerie", type: "RESTRICTED" },
  });

  // Messages
  const msgs = [
    { id: "msg-1", tontineId: t1.id, channelId: null, senderId: demo.id, content: "Bonjour tout le monde ! La réunion de ce mois est confirmée pour le 5.", type: "TEXT", createdAt: new Date("2024-03-01T09:00:00") },
    { id: "msg-2", tontineId: t1.id, channelId: null, senderId: user2.id, content: "Merci Marie. J'ai déjà effectué ma cotisation via MTN MoMo 👍", type: "TEXT", createdAt: new Date("2024-03-01T09:15:00") },
    { id: "msg-3", tontineId: t1.id, channelId: null, senderId: user3.id, content: "Moi aussi, c'est fait ! Hâte de voir tout le monde.", type: "TEXT", createdAt: new Date("2024-03-01T10:00:00") },
    { id: "msg-4", tontineId: t1.id, channelId: null, senderId: demo.id, content: "Super ! Notre tontine grandit bien. Nous avons maintenant 10 membres actifs 🎉", type: "SYSTEM", createdAt: new Date("2024-03-02T08:00:00") },
  ];

  for (const m of msgs) {
    await prisma.message.upsert({
      where: { id: m.id },
      update: {},
      create: m as any,
    });
  }

  // Savings goals
  await prisma.savingsGoal.upsert({
    where: { id: "savings-demo-1" },
    update: {},
    create: {
      id: "savings-demo-1", userId: demo.id, name: "Terrain à Yaoundé",
      targetAmount: 2000000, currentAmount: 450000,
      category: "TERRAIN", type: "PERSONAL", status: "ACTIVE",
      deadline: new Date("2025-12-31"),
    },
  });

  await prisma.savingsGoal.upsert({
    where: { id: "savings-demo-2" },
    update: {},
    create: {
      id: "savings-demo-2", userId: demo.id, name: "Éducation des enfants",
      targetAmount: 500000, currentAmount: 500000,
      category: "EDUCATION", type: "PERSONAL", status: "COMPLETED",
    },
  });

  for (let i = 1; i <= 4; i++) {
    await prisma.savingsContribution.upsert({
      where: { id: `savings-contrib-${i}` },
      update: {},
      create: {
        id: `savings-contrib-${i}`, goalId: "savings-demo-1",
        amount: 112500, createdAt: new Date(`2024-0${i}-15`),
      },
    });
  }

  // Marketplace
  await prisma.marketplaceListing.upsert({
    where: { id: "listing-demo-1" },
    update: {},
    create: {
      id: "listing-demo-1", sellerId: user2.id, tontineId: t2.id,
      title: "Sacs de maïs - Récolte 2025", description: "Maïs local de qualité A, récolte mars 2025.",
      category: "AGRICULTURE", price: 15000, unit: "sac 50kg", quantity: 50,
      location: "Bafoussam", status: "ACTIVE", type: "VENTE", isGroupBuy: true, minGroupQty: 5,
    },
  });

  await prisma.marketplaceListing.upsert({
    where: { id: "listing-demo-2" },
    update: {},
    create: {
      id: "listing-demo-2", sellerId: user3.id,
      title: "Consultation médicale à domicile", description: "Infirmière disponible pour consultations et soins à domicile.",
      category: "SERVICE", price: 5000, unit: "consultation",
      location: "Douala", status: "ACTIVE", type: "VENTE", isGroupBuy: false,
    },
  });

  await prisma.marketplaceListing.upsert({
    where: { id: "listing-demo-3" },
    update: {},
    create: {
      id: "listing-demo-3", sellerId: demo.id, tontineId: t1.id,
      title: "Tissus ankara - Collection printemps", description: "Superbes tissus wax authentiques. Commande groupée disponible.",
      category: "PRODUIT", price: 3500, unit: "mètre", quantity: 200,
      location: "Yaoundé", status: "ACTIVE", type: "VENTE", isGroupBuy: true, minGroupQty: 10,
    },
  });

  // Cultural event
  await prisma.culturalEvent.upsert({
    where: { id: "event-demo-1" },
    update: {},
    create: {
      id: "event-demo-1", tontineId: t1.id,
      title: "Assemblée Générale Annuelle 2025",
      description: "Présentation des bilans, vote du nouveau bureau, et perspectives 2025-2026.",
      type: "ASSEMBLEE", startDate: new Date("2025-06-15T09:00:00"),
      endDate: new Date("2025-06-15T13:00:00"),
      location: "Salle communautaire, Yaoundé-Centre",
      budget: 50000, status: "PLANNED", isVirtual: false,
    },
  });

  await prisma.culturalEvent.upsert({
    where: { id: "event-demo-2" },
    update: {},
    create: {
      id: "event-demo-2", tontineId: t1.id,
      title: "Formation : Gestion financière pour entrepreneures",
      description: "Session de formation sur la comptabilité simple et la gestion des flux de trésorerie.",
      type: "FORMATION", startDate: new Date("2025-05-20T14:00:00"),
      endDate: new Date("2025-05-20T17:00:00"),
      isVirtual: true, meetingLink: "https://meet.google.com/tchoua-formation",
      budget: 0, status: "PLANNED", maxAttendees: 30,
    },
  });

  // Event attendees
  for (const userId of [demo.id, user2.id, user3.id]) {
    await prisma.culturalEventAttendee.upsert({
      where: { eventId_userId: { eventId: "event-demo-1", userId } },
      update: {},
      create: { eventId: "event-demo-1", userId, status: userId === demo.id ? "CONFIRMED" : "INVITED" },
    });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: demo.id, title: "Cotisation due dans 3 jours", message: "Votre cotisation de 25 000 FCFA est due le 5 mai.", type: "CONTRIBUTION_DUE", isRead: false },
      { userId: demo.id, title: "Félicitations ! 250 points", message: "Vous avez atteint le niveau Actif !", type: "SCORING_UPDATE", isRead: false },
      { userId: demo.id, title: "Nouvel événement : Assemblée Générale", message: "L'AG annuelle est planifiée pour le 15 juin.", type: "EVENT", isRead: false },
    ],
  });

  // Scoring records
  await prisma.scoringRecord.createMany({
    data: [
      { userId: demo.id, points: 10, reason: "Inscription sur la plateforme", category: "COMPLIANCE_ETHICS" },
      { userId: demo.id, points: 20, reason: "Création de la tontine", category: "SOLIDARITY" },
      { userId: demo.id, points: 10, reason: "Cotisation janvier payée à temps", category: "FINANCIAL_RELIABILITY" },
      { userId: demo.id, points: 10, reason: "Cotisation février payée à temps", category: "FINANCIAL_RELIABILITY" },
      { userId: demo.id, points: 10, reason: "Cotisation mars payée à temps", category: "FINANCIAL_RELIABILITY" },
    ],
  });

  // ─── Associations démo (A30, NDI MBE, AMSED) ───────────────────────────
  // Données issues des règlements intérieurs réels.

  // 1) A30 — Association Amicale du Trente
  const a30 = await prisma.association.upsert({
    where: { id: "assoc-a30" },
    update: {},
    create: {
      id: "assoc-a30",
      name: "Association Amicale du Trente (A30)",
      description: "Tontine + fonds de solidarité, mandat de 2 ans, 2 tontines (mensuelle + tirage unique).",
      type: "TONTINE_CLUB", isPublic: true, region: "Cameroun",
      templateUsed: "A30", color: "#0d3d28",
      creatorId: demo.id,
      bureauConfig: JSON.stringify({
        mandatYears: 2,
        roles: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "SECRETARY_ADJ",
                "TREASURER", "TREASURER_ADJ", "ADVISOR"],
      }),
      membershipConfig: JSON.stringify({
        sponsorshipRequired: true, sponsorshipCount: 1,
        approvalProcess: "MAJORITY", admissionFeeInstallments: 2,
      }),
      meetingConfig: JSON.stringify({
        frequency: "MONTHLY", quorumPercent: 50, convocationDays: 7, venue: "ROTATING",
      }),
      socialAidCaps: JSON.stringify({
        illness_member: 50000, death_member: 500000, marriage: 50000, birth: 20000,
      }),
      sanctionsConfig: JSON.stringify({
        late: 500, absent1: 1000, absent2: 3000, absent3: 5000,
        indiscipline: 3000, agNationale: 20000,
      }),
      bankConfig: JSON.stringify({ bankName: "CCA Bank", paymentMode: "VIREMENT" }),
    },
  });

  await prisma.assocBankAccount.upsert({
    where: { id: "bank-a30" },
    update: {},
    create: {
      id: "bank-a30", associationId: a30.id, label: "Compte principal A30",
      type: "BANK", bankName: "CCA Bank",
      accountNumber: "10022 01449845901 28",
      accountHolder: "Association Amicale du Trente",
      isDefault: true,
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-a30-petite" },
    update: {},
    create: {
      id: "act-a30-petite", associationId: a30.id,
      name: "Petite Tontine mensuelle", type: "TONTINE_ROTATIVE",
      participation: "MANDATORY",
      contributionAmount: 10000, contributionFrequency: "MONTHLY",
      distributionMode: "LOTTERY_MONTHLY",
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-a30-grande" },
    update: {},
    create: {
      id: "act-a30-grande", associationId: a30.id,
      name: "Grande Tontine (tirage unique annuel)", type: "TONTINE_ROTATIVE",
      participation: "OPTIONAL",
      contributionAmount: 25000, contributionFrequency: "MONTHLY",
      distributionMode: "LOTTERY_UNIQUE",
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-a30-pret" },
    update: {},
    create: {
      id: "act-a30-pret", associationId: a30.id,
      name: "Caisse de prêts (résidus tontine)", type: "PRET",
      participation: "OPTIONAL",
      loanRate1: 5, loanRate2: 5, loanMaxActive: 1,
      caisseLoanDuration: 1, loanApprovalMode: "BUREAU",
    },
  });

  await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: demo.id, associationId: a30.id } },
    update: {},
    create: {
      userId: demo.id, associationId: a30.id, role: "PRESIDENT",
      status: "ACTIVE", joinedAt: new Date("2023-01-15"), memberNumber: "001",
    },
  });

  // 2) NDI MBE ET FILS — Fonds d'investissement familial
  const ndi = await prisma.association.upsert({
    where: { id: "assoc-ndi" },
    update: {},
    create: {
      id: "assoc-ndi",
      name: "NDI MBE ET FILS",
      description: "Fonds d'investissement familial créé le 02/11/2022, capital libre, prêts à 2-4%/mois.",
      type: "INVESTMENT", isPublic: false, region: "Cameroun",
      templateUsed: "NDI_MBE", color: "#1e3a8a",
      creatorId: user2.id,
      bureauConfig: JSON.stringify({ mandatYears: 2, roles: ["PRESIDENT", "TREASURER", "SECRETARY"] }),
      membershipConfig: JSON.stringify({ approvalProcess: "UNANIMOUS", scope: "FAMILY" }),
      meetingConfig: JSON.stringify({ frequency: "QUARTERLY", quorumPercent: 60 }),
      bankConfig: JSON.stringify({ bankName: "CCP Bank", paymentMode: "VIREMENT" }),
    },
  });

  await prisma.assocBankAccount.upsert({
    where: { id: "bank-ndi" },
    update: {},
    create: {
      id: "bank-ndi", associationId: ndi.id, label: "Compte NDI MBE",
      type: "BANK", bankName: "CCP Bank",
      accountNumber: "10039 10040 00268280901 58",
      accountHolder: "NDI MBE ET FILS",
      isDefault: true,
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-ndi-invest" },
    update: {},
    create: {
      id: "act-ndi-invest", associationId: ndi.id,
      name: "Apports en capital (libre)", type: "INVESTISSEMENT",
      participation: "OPTIONAL", contributionFrequency: "MONTHLY",
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-ndi-pret" },
    update: {},
    create: {
      id: "act-ndi-pret", associationId: ndi.id,
      name: "Prêts aux membres", type: "PRET", participation: "OPTIONAL",
      loanRate1: 2, loanRate2: 4, caisseLoanDuration: 3,
      loanApprovalMode: "BUREAU", loanMaxActive: 1,
    },
  });

  await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: user2.id, associationId: ndi.id } },
    update: {},
    create: {
      userId: user2.id, associationId: ndi.id, role: "PRESIDENT",
      status: "ACTIVE", joinedAt: new Date("2022-11-02"), memberNumber: "001",
    },
  });

  // Donne accès à demo (en lecture) sur les 3 associations de démonstration
  await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: demo.id, associationId: ndi.id } },
    update: {},
    create: {
      userId: demo.id, associationId: ndi.id, role: "MEMBER",
      status: "ACTIVE", joinedAt: new Date("2023-06-01"), memberNumber: "DEMO",
    },
  });
  await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: demo.id, associationId: a30.id } },
    update: {},
    create: {
      userId: demo.id, associationId: a30.id, role: "MEMBER",
      status: "ACTIVE", joinedAt: new Date("2023-06-01"), memberNumber: "DEMO",
    },
  });

  // 3) AMSED — Association Bansoa Douala
  const amsed = await prisma.association.upsert({
    where: { id: "assoc-amsed" },
    update: {},
    create: {
      id: "assoc-amsed",
      name: "AMSED Bansoa Douala",
      description: "Association mutuelle Bansoa : tontine enchères + Fonds Solidarité + Fonds Investissement, mandat 3 ans.",
      type: "MUTUAL", isPublic: true, region: "Douala",
      templateUsed: "AMSED", color: "#7c2d12",
      creatorId: user3.id,
      bureauConfig: JSON.stringify({
        mandatYears: 3,
        roles: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "SECRETARY_ADJ",
                "TREASURER", "TREASURER_ADJ", "CENSOR", "AUDITOR", "AUDITOR", "ADVISOR"],
      }),
      membershipConfig: JSON.stringify({
        sponsorshipRequired: true, sponsorshipCount: 2,
        approvalProcess: "MAJORITY", admissionFee: 50000,
      }),
      meetingConfig: JSON.stringify({
        frequency: "MONTHLY", dayOfWeek: 6, weekOfMonth: 1,
        hourStart: "15:00", hourEnd: "19:00", quorumPercent: 50, venue: "ROTATING",
      }),
      socialAidCaps: JSON.stringify({
        illness_member: 70000, illness_spouse: 50000,
        marriage: 50000, birth: 20000, birth_twins: 30000,
        death_member: 900000, death_spouse: 405000,
        death_child_under5: 50000, death_child_over5: 100000,
        death_parent: 100000,
        annual_solidarity_contribution: 72000,
      }),
      sanctionsConfig: JSON.stringify({
        late: 500, absent1: 1000, absent2: 3000, absent3: 5000,
        indiscipline: 3000, missedCommission: 5000, agNationale: 20000,
      }),
      bankConfig: JSON.stringify({ paymentMode: "VIREMENT" }),
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-amsed-tontine" },
    update: {},
    create: {
      id: "act-amsed-tontine", associationId: amsed.id,
      name: "Tontine aux enchères (25 000 FCFA)", type: "TONTINE_ENCHERES",
      participation: "MANDATORY",
      contributionAmount: 25000, contributionFrequency: "MONTHLY",
      distributionMode: "AUCTION",
      auctionMinBidPct: 5, auctionMinBidders: 4,
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-amsed-solidarite" },
    update: {},
    create: {
      id: "act-amsed-solidarite", associationId: amsed.id,
      name: "Fonds de Solidarité", type: "AIDE_SOLIDAIRE",
      participation: "MANDATORY",
      contributionAmount: 6000, contributionFrequency: "MONTHLY",
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-amsed-fi" },
    update: {},
    create: {
      id: "act-amsed-fi", associationId: amsed.id,
      name: "Fonds d'Investissement (FI)", type: "INVESTISSEMENT",
      participation: "OPTIONAL",
      contributionAmount: 5000, contributionFrequency: "MONTHLY",
      loanRate1: 3, loanRate2: 3, caisseLoanDuration: 2,
      loanApprovalMode: "BUREAU",
    },
  });

  await prisma.associationActivity.upsert({
    where: { id: "act-amsed-collation" },
    update: {},
    create: {
      id: "act-amsed-collation", associationId: amsed.id,
      name: "Collation mensuelle", type: "COLLECTION",
      participation: "MANDATORY",
      collectionAmount: 3000, contributionFrequency: "PER_SESSION",
    },
  });

  await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: user3.id, associationId: amsed.id } },
    update: {},
    create: {
      userId: user3.id, associationId: amsed.id, role: "PRESIDENT",
      status: "ACTIVE", joinedAt: new Date("2020-01-04"), memberNumber: "001",
    },
  });

  await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: demo.id, associationId: amsed.id } },
    update: {},
    create: {
      userId: demo.id, associationId: amsed.id, role: "TREASURER",
      status: "ACTIVE", joinedAt: new Date("2020-02-01"), memberNumber: "002",
    },
  });

  console.log("✓ Associations démo créées (A30, NDI MBE, AMSED)");

  // ─── Données réelles NDI MBE ET FILS (extraites de ETS NDI MBE.xlsx) ────
  const ndiPath = path.join(__dirname, "data", "ndi-mbe.json");
  if (fs.existsSync(ndiPath)) {
    type NdiRow = { name?: string; member?: string; date?: string|null;
                    amount?: number; id?: number; duration?: number; rate?: number;
                    echeance?: string|null; interest?: number; totalDue?: number;
                    encours?: number; status?: string };
    const ndiData: { versements: NdiRow[]; prets: NdiRow[]; remboursements: NdiRow[] } =
      JSON.parse(fs.readFileSync(ndiPath, "utf-8"));

    // 7 membres réels
    const ndiMembers: Record<string, { email: string; phone: string }> = {
      "ANDRE SOH":         { email: "andre.soh@ndimbe.cm",        phone: "+237699000001" },
      "PALO VALENTIN":     { email: "palo.valentin@ndimbe.cm",    phone: "+237699000002" },
      "WAFFO MAURICE":     { email: "waffo.maurice@ndimbe.cm",    phone: "+237699000003" },
      "KENDOUM ERNEST":    { email: "kendoum.ernest@ndimbe.cm",   phone: "+237699000004" },
      "TAMPOLLA SERGE":    { email: "tampolla.serge@ndimbe.cm",   phone: "+237699000005" },
      "FONGANG JEAN NOEL": { email: "fongang.noel@ndimbe.cm",     phone: "+237699000006" },
      "TALLA VALENTIN":    { email: "talla.valentin@ndimbe.cm",   phone: "+237699000007" },
    };

    const memberIdByName: Record<string, string> = {};       // user.id
    const membershipIdByName: Record<string, string> = {};   // membership.id

    let memberNo = 0;
    for (const [name, info] of Object.entries(ndiMembers)) {
      memberNo++;
      const u = await prisma.user.upsert({
        where: { email: info.email },
        update: {},
        create: {
          email: info.email, name, password: demoPassword,
          phone: info.phone, profession: "investissement", location: "Cameroun",
          score: 200, level: "ACTIF", isVerified: true,
        },
      });
      memberIdByName[name] = u.id;

      const m = await prisma.associationMembership.upsert({
        where: { userId_associationId: { userId: u.id, associationId: ndi.id } },
        update: {},
        create: {
          userId: u.id, associationId: ndi.id,
          role: name === "ANDRE SOH" ? "PRESIDENT" : name === "FONGANG JEAN NOEL" ? "TREASURER" : "MEMBER",
          status: "ACTIVE", joinedAt: new Date("2022-11-02"),
          memberNumber: String(memberNo).padStart(3, "0"),
        },
      });
      membershipIdByName[name] = m.id;
    }

    // Versements en capital → ActivityContribution sur act-ndi-invest
    for (let i = 0; i < ndiData.versements.length; i++) {
      const v = ndiData.versements[i];
      if (!v.name || !v.amount) continue;
      const memId = membershipIdByName[v.name];
      if (!memId) continue;
      const paidAt = v.date ? new Date(v.date) : new Date("2022-11-02");
      await prisma.activityContribution.upsert({
        where: { id: `ndi-vers-${i}` },
        update: {},
        create: {
          id: `ndi-vers-${i}`, activityId: "act-ndi-invest",
          membershipId: memId, amount: v.amount, unit: "CASH",
          status: "PAID", paymentMethod: "BANK", paidAt,
          notes: "Apport en capital",
        },
      });
    }

    // Prêts → AssocLoan sur act-ndi-pret + repayment de bouclage si Terminé
    for (const p of ndiData.prets) {
      if (!p.member || !p.amount || p.id == null) continue;
      const memId = membershipIdByName[p.member];
      if (!memId) continue;
      const loanId = `ndi-loan-${p.id}`;
      const isClosed = (p.status ?? "").trim().toLowerCase().startsWith("termin");
      const interest = p.interest ?? 0;
      const totalDue = p.totalDue ?? (p.amount + interest);

      await prisma.assocLoan.upsert({
        where: { id: loanId },
        update: {},
        create: {
          id: loanId, activityId: "act-ndi-pret",
          borrowerMembershipId: memId,
          amount: p.amount, interestRate: (p.rate ?? 0.02) * 100,
          duration: p.duration ?? 3, totalDue,
          status: isClosed ? "REPAID" : "ACTIVE",
          disbursedAt: p.date ? new Date(p.date) : null,
          dueDate: p.echeance ? new Date(p.echeance) : null,
          repaidAt: isClosed && p.echeance ? new Date(p.echeance) : null,
          purpose: "Prêt FI NDI MBE",
        },
      });

      if (isClosed) {
        await prisma.assocLoanRepayment.upsert({
          where: { id: `ndi-rep-${p.id}` },
          update: {},
          create: {
            id: `ndi-rep-${p.id}`, loanId,
            amount: totalDue,
            principal: p.amount, interest,
            paymentMethod: "BANK",
            paidAt: p.echeance ? new Date(p.echeance) : new Date(),
          },
        });
      }
    }

    console.log(`✓ NDI MBE: ${Object.keys(ndiMembers).length} membres, ${ndiData.versements.length} versements, ${ndiData.prets.length} prêts chargés`);
  }

  console.log("✅ Seed completed!");
  console.log("📧 Login: demo@tchoua.cm | 🔑 Password: demo123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
