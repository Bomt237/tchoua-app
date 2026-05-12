import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function seedV9Associations() {
  console.log("🌱 Seeding V9 Associations...");

  const demoPassword = await bcrypt.hash("demo123", 12);

  // ─── Récupération des users existants ────────────────────────────────────
  const demo = await prisma.user.findUnique({ where: { email: "demo@tchoua.cm" } });
  const jean = await prisma.user.findUnique({ where: { email: "jean@tchoua.cm" } });
  const alice = await prisma.user.findUnique({ where: { email: "alice@tchoua.cm" } });
  if (!demo || !jean || !alice) {
    console.warn("⚠️ Users de base introuvables, skip V9 seed");
    return;
  }

  // ─── Users supplémentaires ───────────────────────────────────────────────
  const pierre = await prisma.user.upsert({
    where: { email: "pierre@tchoua.cm" },
    update: {},
    create: { email: "pierre@tchoua.cm", name: "Pierre Eboa", password: demoPassword, phone: "+237677112233", profession: "comptable", location: "Yaoundé", score: 180, level: "ACTIF", isVerified: true },
  });
  const grace = await prisma.user.upsert({
    where: { email: "grace@tchoua.cm" },
    update: {},
    create: { email: "grace@tchoua.cm", name: "Grace Manga", password: demoPassword, phone: "+237699445566", profession: "enseignante", location: "Yaoundé", score: 220, level: "ACTIF", isVerified: true },
  });
  const bernard = await prisma.user.upsert({
    where: { email: "bernard@tchoua.cm" },
    update: {},
    create: { email: "bernard@tchoua.cm", name: "Bernard Fouda", password: demoPassword, phone: "+237655778899", profession: "mecanicien", location: "Yaoundé", score: 150, level: "ACTIF", isVerified: true },
  });
  const yvette = await prisma.user.upsert({
    where: { email: "yvette@tchoua.cm" },
    update: {},
    create: { email: "yvette@tchoua.cm", name: "Yvette Kotto", password: demoPassword, phone: "+237677334455", profession: "coiffeuse", location: "Douala", score: 130, level: "ACTIF", isVerified: true },
  });
  const claire = await prisma.user.upsert({
    where: { email: "claire@tchoua.cm" },
    update: {},
    create: { email: "claire@tchoua.cm", name: "Claire Ndzana", password: demoPassword, phone: "+237699112233", profession: "commercante", location: "Douala", score: 170, level: "ACTIF", isVerified: true },
  });
  const kevin = await prisma.user.upsert({
    where: { email: "kevin@tchoua.cm" },
    update: {},
    create: { email: "kevin@tchoua.cm", name: "Kevin Mbarga", password: demoPassword, phone: "+237655667788", profession: "developpeur", location: "Douala", score: 200, level: "ACTIF", isVerified: true },
  });

  // ─── Association 1 : Tontine Émergence Yaoundé ───────────────────────────
  const assoc1 = await prisma.association.upsert({
    where: { id: "assoc-emergence-yaounde" },
    update: {},
    create: {
      id: "assoc-emergence-yaounde",
      name: "Tontine Émergence Yaoundé",
      description: "Association tontinière dynamique fondée en 2023 pour favoriser l'épargne rotative et la solidarité entre ses membres.",
      type: "TONTINE_CLUB",
      status: "ACTIVE",
      isPublic: true,
      color: "#0d3d28",
      region: "Centre",
      activatedAt: new Date("2023-01-15"),
      creatorId: demo.id,
      bureauConfig: JSON.stringify({ mandatYears: 2, roles: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER", "MEMBER"] }),
      membershipConfig: JSON.stringify({ approvalProcess: "MAJORITY", admissionFee: 10000 }),
      meetingConfig: JSON.stringify({ frequency: "MONTHLY", quorumPercent: 50, convocationDays: 7 }),
      socialAidCaps: JSON.stringify({ illness_member: 50000, death_member: 300000, marriage: 50000, birth: 25000 }),
      sanctionsConfig: JSON.stringify({ late: 500, absent1: 1000, absent2: 2000, absent3: 5000 }),
      bankConfig: JSON.stringify({ bankName: "ECOBANK", paymentMode: "VIREMENT" }),
    },
  });

  const m1_demo = await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: demo.id, associationId: assoc1.id } },
    update: {},
    create: { userId: demo.id, associationId: assoc1.id, role: "PRESIDENT", status: "ACTIVE", joinedAt: new Date("2023-01-15"), memberNumber: "001" },
  });
  const m1_jean = await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: jean.id, associationId: assoc1.id } },
    update: {},
    create: { userId: jean.id, associationId: assoc1.id, role: "VICE_PRESIDENT", status: "ACTIVE", joinedAt: new Date("2023-01-15"), memberNumber: "002" },
  });
  const m1_alice = await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: alice.id, associationId: assoc1.id } },
    update: {},
    create: { userId: alice.id, associationId: assoc1.id, role: "SECRETARY", status: "ACTIVE", joinedAt: new Date("2023-02-01"), memberNumber: "003" },
  });
  const m1_pierre = await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: pierre.id, associationId: assoc1.id } },
    update: {},
    create: { userId: pierre.id, associationId: assoc1.id, role: "TREASURER", status: "ACTIVE", joinedAt: new Date("2023-02-01"), memberNumber: "004" },
  });
  const m1_grace = await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: grace.id, associationId: assoc1.id } },
    update: {},
    create: { userId: grace.id, associationId: assoc1.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2023-03-01"), memberNumber: "005" },
  });
  const m1_bernard = await prisma.associationMembership.upsert({
    where: { userId_associationId: { userId: bernard.id, associationId: assoc1.id } },
    update: {},
    create: { userId: bernard.id, associationId: assoc1.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2023-03-15"), memberNumber: "006" },
  });

  const act1_tontine = await prisma.associationActivity.upsert({
    where: { id: "act-emergence-tontine" },
    update: {},
    create: {
      id: "act-emergence-tontine", associationId: assoc1.id,
      name: "Tontine Rotative", type: "TONTINE_ROTATIVE", participation: "MANDATORY",
      contributionAmount: 25000, contributionFrequency: "MONTHLY", distributionMode: "ROTATION",
      status: "ACTIVE",
    },
  });
  const act1_aide = await prisma.associationActivity.upsert({
    where: { id: "act-emergence-aide" },
    update: {},
    create: {
      id: "act-emergence-aide", associationId: assoc1.id,
      name: "Fonds Solidarité", type: "AIDE_SOLIDAIRE", participation: "MANDATORY",
      contributionAmount: 5000, contributionFrequency: "MONTHLY",
      status: "ACTIVE",
    },
  });
  const act1_pret = await prisma.associationActivity.upsert({
    where: { id: "act-emergence-pret" },
    update: {},
    create: {
      id: "act-emergence-pret", associationId: assoc1.id,
      name: "Prêts internes", type: "PRET", participation: "OPTIONAL",
      loanRate1: 2, loanRate2: 4, loanMaxActive: 2, loanApprovalMode: "BUREAU",
      status: "ACTIVE",
    },
  });

  const meeting1_ag = await prisma.assocMeeting.upsert({
    where: { id: "meeting-emergence-ag1" },
    update: {},
    create: {
      id: "meeting-emergence-ag1", associationId: assoc1.id,
      title: "Assemblée Générale Ordinaire - Bilan 2023",
      type: "AG_ORDINARY", scheduledAt: new Date("2023-12-15T10:00:00"),
      location: "Salle communautaire, Yaoundé-Centre", status: "HELD",
      quorumRequired: 50, quorumReached: true, attendeeCount: 6,
    },
  });
  const meeting1_bureau = await prisma.assocMeeting.upsert({
    where: { id: "meeting-emergence-bureau1" },
    update: {},
    create: {
      id: "meeting-emergence-bureau1", associationId: assoc1.id,
      title: "Réunion du Bureau - Planification Q2",
      type: "BUREAU_MEETING", scheduledAt: new Date("2025-06-20T14:00:00"),
      location: "Bureau du Président", status: "PLANNED",
    },
  });
  const meeting1_reg = await prisma.assocMeeting.upsert({
    where: { id: "meeting-emergence-reg1" },
    update: {},
    create: {
      id: "meeting-emergence-reg1", associationId: assoc1.id,
      title: "Réunion mensuelle de mars",
      type: "REGULAR", scheduledAt: new Date("2024-03-10T15:00:00"),
      location: "Maison de quartier, Mvan", status: "HELD",
      quorumRequired: 50, quorumReached: true, attendeeCount: 5,
    },
  });

  const election1 = await prisma.election.upsert({
    where: { id: "election-emergence-bureau" },
    update: {},
    create: {
      id: "election-emergence-bureau", associationId: assoc1.id,
      title: "Élection du Bureau 2023-2025",
      type: "BUREAU", status: "CLOSED",
      startDate: new Date("2023-01-10T09:00:00"), endDate: new Date("2023-01-10T12:00:00"),
      quorumRequired: 60, quorumReached: true,
      result: JSON.stringify({ president: demo.id, vicePresident: jean.id, secretary: alice.id, treasurer: pierre.id }),
      createdById: demo.id,
    },
  });

  const cand1_pres = await prisma.electionCandidate.upsert({
    where: { id: "cand-emergence-pres" },
    update: {},
    create: { id: "cand-emergence-pres", electionId: election1.id, membershipId: m1_demo.id, position: "PRESIDENT", manifesto: "Continuer sur la lancée de la croissance.", votesCount: 5, isElected: true },
  });
  const cand1_vp = await prisma.electionCandidate.upsert({
    where: { id: "cand-emergence-vp" },
    update: {},
    create: { id: "cand-emergence-vp", electionId: election1.id, membershipId: m1_jean.id, position: "VICE_PRESIDENT", manifesto: "Renforcer la solidarité interne.", votesCount: 4, isElected: true },
  });

  await prisma.electionVote.upsert({ where: { id: "vote-emergence-1" }, update: {}, create: { id: "vote-emergence-1", electionId: election1.id, membershipId: m1_demo.id, candidateId: cand1_pres.id, value: 1 } });
  await prisma.electionVote.upsert({ where: { id: "vote-emergence-2" }, update: {}, create: { id: "vote-emergence-2", electionId: election1.id, membershipId: m1_jean.id, candidateId: cand1_pres.id, value: 1 } });
  await prisma.electionVote.upsert({ where: { id: "vote-emergence-3" }, update: {}, create: { id: "vote-emergence-3", electionId: election1.id, membershipId: m1_alice.id, candidateId: cand1_vp.id, value: 1 } });
  await prisma.electionVote.upsert({ where: { id: "vote-emergence-4" }, update: {}, create: { id: "vote-emergence-4", electionId: election1.id, membershipId: m1_pierre.id, candidateId: cand1_pres.id, value: 1 } });
  await prisma.electionVote.upsert({ where: { id: "vote-emergence-5" }, update: {}, create: { id: "vote-emergence-5", electionId: election1.id, membershipId: m1_grace.id, candidateId: cand1_vp.id, value: 1 } });
  await prisma.electionVote.upsert({ where: { id: "vote-emergence-6" }, update: {}, create: { id: "vote-emergence-6", electionId: election1.id, membershipId: m1_bernard.id, candidateId: cand1_pres.id, value: 1 } });

  await prisma.mandatePeriod.upsert({
    where: { id: "mandate-emergence-2023" },
    update: {},
    create: {
      id: "mandate-emergence-2023", electionId: election1.id, associationId: assoc1.id,
      membershipId: m1_demo.id, role: "PRESIDENT",
      startDate: new Date("2023-01-15"), endDate: new Date("2025-01-15"), isActive: true,
    },
  });

  const wf1_loan = await prisma.approvalWorkflow.upsert({
    where: { id: "wf-emergence-loan" },
    update: {},
    create: { id: "wf-emergence-loan", associationId: assoc1.id, name: "Validation des prêts", entityType: "LOAN", votingLevel: "STANDARD", minVotesRequired: 3, timeoutHours: 72, isActive: true },
  });
  await prisma.approvalStep.upsert({ where: { id: "step-emergence-loan-1" }, update: {}, create: { id: "step-emergence-loan-1", workflowId: wf1_loan.id, stepNumber: 1, roleRequired: "PRESIDENT", action: "APPROVE" } });
  await prisma.approvalStep.upsert({ where: { id: "step-emergence-loan-2" }, update: {}, create: { id: "step-emergence-loan-2", workflowId: wf1_loan.id, stepNumber: 2, roleRequired: "TREASURER", action: "REVIEW" } });

  const wf1_aid = await prisma.approvalWorkflow.upsert({
    where: { id: "wf-emergence-aid" },
    update: {},
    create: { id: "wf-emergence-aid", associationId: assoc1.id, name: "Validation aides sociales", entityType: "SOCIAL_AID", votingLevel: "IMPORTANT", minVotesRequired: 4, timeoutHours: 48, isActive: true },
  });
  await prisma.approvalStep.upsert({ where: { id: "step-emergence-aid-1" }, update: {}, create: { id: "step-emergence-aid-1", workflowId: wf1_aid.id, stepNumber: 1, roleRequired: "PRESIDENT", action: "APPROVE" } });
  await prisma.approvalStep.upsert({ where: { id: "step-emergence-aid-2" }, update: {}, create: { id: "step-emergence-aid-2", workflowId: wf1_aid.id, stepNumber: 2, roleRequired: "SECRETARY", action: "REVIEW" } });

  await prisma.associationReport.upsert({
    where: { id: "report-emergence-activity" },
    update: {},
    create: { id: "report-emergence-activity", associationId: assoc1.id, type: "ACTIVITY", title: "Rapport d'activité 2024", format: "PDF", status: "READY", fileUrl: "https://storage.tchoua.cm/reports/emergence-activity.pdf", generatedById: demo.id, generatedAt: new Date("2024-12-20") },
  });
  await prisma.associationReport.upsert({
    where: { id: "report-emergence-member" },
    update: {},
    create: { id: "report-emergence-member", associationId: assoc1.id, type: "MEMBER", title: "Annuaire des membres 2024", format: "PDF", status: "READY", fileUrl: "https://storage.tchoua.cm/reports/emergence-members.pdf", generatedById: alice.id, generatedAt: new Date("2024-12-22") },
  });

  // ─── Association 2 : Caisse d'Épargne Bafoussam ──────────────────────────
  const assoc2 = await prisma.association.upsert({
    where: { id: "assoc-epargne-bafoussam" },
    update: {},
    create: {
      id: "assoc-epargne-bafoussam",
      name: "Caisse d'Épargne Bafoussam",
      description: "Coopérative d'épargne et de crédit pour les entrepreneurs de l'Ouest.",
      type: "COOPERATIVE",
      status: "ACTIVE",
      isPublic: false,
      color: "#1e40af",
      region: "Ouest",
      activatedAt: new Date("2023-06-01"),
      creatorId: jean.id,
      bureauConfig: JSON.stringify({ mandatYears: 3, roles: ["PRESIDENT", "SECRETARY", "TREASURER"] }),
      membershipConfig: JSON.stringify({ approvalProcess: "MAJORITY" }),
      meetingConfig: JSON.stringify({ frequency: "MONTHLY", quorumPercent: 60 }),
    },
  });

  const m2_jean = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: jean.id, associationId: assoc2.id } }, update: {}, create: { userId: jean.id, associationId: assoc2.id, role: "PRESIDENT", status: "ACTIVE", joinedAt: new Date("2023-06-01"), memberNumber: "001" } });
  const m2_alice = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: alice.id, associationId: assoc2.id } }, update: {}, create: { userId: alice.id, associationId: assoc2.id, role: "SECRETARY", status: "ACTIVE", joinedAt: new Date("2023-06-10"), memberNumber: "002" } });
  const m2_demo = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: demo.id, associationId: assoc2.id } }, update: {}, create: { userId: demo.id, associationId: assoc2.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2023-07-01"), memberNumber: "003" } });
  const m2_grace = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: grace.id, associationId: assoc2.id } }, update: {}, create: { userId: grace.id, associationId: assoc2.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2023-08-01"), memberNumber: "004" } });

  await prisma.associationActivity.upsert({ where: { id: "act-epargne-epargne" }, update: {}, create: { id: "act-epargne-epargne", associationId: assoc2.id, name: "Épargne libre", type: "EPARGNE", participation: "OPTIONAL", contributionFrequency: "MONTHLY", status: "ACTIVE" } });
  await prisma.associationActivity.upsert({ where: { id: "act-epargne-invest" }, update: {}, create: { id: "act-epargne-invest", associationId: assoc2.id, name: "Investissement Agricole", type: "INVESTISSEMENT", participation: "OPTIONAL", contributionFrequency: "QUARTERLY", status: "ACTIVE" } });

  await prisma.associationRelation.upsert({
    where: { id: "rel-sister-2-1" },
    update: {},
    create: { id: "rel-sister-2-1", sourceId: assoc2.id, targetId: assoc1.id, type: "SISTER", status: "ACTIVE", startDate: new Date("2023-07-01"), notes: "Partenariat de solidarité et échange de bonnes pratiques." },
  });

  // ─── Association 3 : Solidarité Femmes Actives ───────────────────────────
  const assoc3 = await prisma.association.upsert({
    where: { id: "assoc-femmes-actives" },
    update: {},
    create: {
      id: "assoc-femmes-actives",
      name: "Solidarité Femmes Actives",
      description: "Association de solidarité entre femmes entrepreneures du Littoral.",
      type: "SOLIDARITY",
      status: "PENDING",
      isPublic: true,
      color: "#be123c",
      region: "Littoral",
      creatorId: alice.id,
      membershipConfig: JSON.stringify({ approvalProcess: "MAJORITY", sponsorshipRequired: true, sponsorshipCount: 1 }),
    },
  });

  const m3_alice = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: alice.id, associationId: assoc3.id } }, update: {}, create: { userId: alice.id, associationId: assoc3.id, role: "PRESIDENT", status: "PENDING", joinedAt: new Date("2024-01-10"), memberNumber: "001" } });
  const m3_demo = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: demo.id, associationId: assoc3.id } }, update: {}, create: { userId: demo.id, associationId: assoc3.id, role: "MEMBER", status: "PENDING", joinedAt: new Date("2024-01-12"), memberNumber: "002" } });
  const m3_grace = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: grace.id, associationId: assoc3.id } }, update: {}, create: { userId: grace.id, associationId: assoc3.id, role: "MEMBER", status: "PENDING", joinedAt: new Date("2024-01-15"), memberNumber: "003" } });
  const m3_yvette = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: yvette.id, associationId: assoc3.id } }, update: {}, create: { userId: yvette.id, associationId: assoc3.id, role: "MEMBER", status: "PENDING", joinedAt: new Date("2024-01-18"), memberNumber: "004" } });
  const m3_claire = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: claire.id, associationId: assoc3.id } }, update: {}, create: { userId: claire.id, associationId: assoc3.id, role: "MEMBER", status: "PENDING", joinedAt: new Date("2024-01-20"), memberNumber: "005" } });

  await prisma.associationLifecycleEvent.upsert({
    where: { id: "lifecycle-femmes-draft-pending" },
    update: {},
    create: { id: "lifecycle-femmes-draft-pending", associationId: assoc3.id, fromStatus: "DRAFT", toStatus: "PENDING", triggeredBy: "USER", userId: alice.id, reason: "Soumission pour validation du bureau." },
  });

  // ─── Association 4 : Jeunes Entrepreneurs Douala ─────────────────────────
  const assoc4 = await prisma.association.upsert({
    where: { id: "assoc-jeunes-douala" },
    update: {},
    create: {
      id: "assoc-jeunes-douala",
      name: "Jeunes Entrepreneurs Douala",
      description: "Réseau d'investissement et d'accompagnement des jeunes entrepreneurs de Douala.",
      type: "INVESTMENT",
      status: "DRAFT",
      isPublic: true,
      color: "#d4a343",
      region: "Littoral",
      creatorId: jean.id,
    },
  });

  const m4_jean = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: jean.id, associationId: assoc4.id } }, update: {}, create: { userId: jean.id, associationId: assoc4.id, role: "FOUNDER", status: "ACTIVE", joinedAt: new Date("2024-06-01"), memberNumber: "001" } });
  const m4_kevin = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: kevin.id, associationId: assoc4.id } }, update: {}, create: { userId: kevin.id, associationId: assoc4.id, role: "MEMBER", status: "PENDING", joinedAt: new Date("2024-06-05"), memberNumber: "002" } });

  // ─── Association 5 : Fonds Mutualiste Agricole ───────────────────────────
  const assoc5 = await prisma.association.upsert({
    where: { id: "assoc-mutualiste-agricole" },
    update: {},
    create: {
      id: "assoc-mutualiste-agricole",
      name: "Fonds Mutualiste Agricole",
      description: "Association agricole mutualiste pour l'achat groupé d'intrants et le soutien aux paysans.",
      type: "AGRICULTURAL",
      status: "ACTIVE",
      isPublic: true,
      color: "#15803d",
      region: "Nord-Ouest",
      activatedAt: new Date("2022-03-10"),
      creatorId: demo.id,
      bureauConfig: JSON.stringify({ mandatYears: 2, roles: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER", "NATURE_OFFICER"] }),
      membershipConfig: JSON.stringify({ approvalProcess: "MAJORITY" }),
      meetingConfig: JSON.stringify({ frequency: "MONTHLY", quorumPercent: 50 }),
    },
  });

  const m5_demo = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: demo.id, associationId: assoc5.id } }, update: {}, create: { userId: demo.id, associationId: assoc5.id, role: "PRESIDENT", status: "ACTIVE", joinedAt: new Date("2022-03-10"), memberNumber: "001" } });
  const m5_jean = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: jean.id, associationId: assoc5.id } }, update: {}, create: { userId: jean.id, associationId: assoc5.id, role: "VICE_PRESIDENT", status: "ACTIVE", joinedAt: new Date("2022-03-10"), memberNumber: "002" } });
  const m5_alice = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: alice.id, associationId: assoc5.id } }, update: {}, create: { userId: alice.id, associationId: assoc5.id, role: "SECRETARY", status: "ACTIVE", joinedAt: new Date("2022-04-01"), memberNumber: "003" } });
  const m5_pierre = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: pierre.id, associationId: assoc5.id } }, update: {}, create: { userId: pierre.id, associationId: assoc5.id, role: "TREASURER", status: "ACTIVE", joinedAt: new Date("2022-04-01"), memberNumber: "004" } });
  const m5_grace = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: grace.id, associationId: assoc5.id } }, update: {}, create: { userId: grace.id, associationId: assoc5.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2022-05-01"), memberNumber: "005" } });
  const m5_bernard = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: bernard.id, associationId: assoc5.id } }, update: {}, create: { userId: bernard.id, associationId: assoc5.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2022-05-15"), memberNumber: "006" } });
  const m5_yvette = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: yvette.id, associationId: assoc5.id } }, update: {}, create: { userId: yvette.id, associationId: assoc5.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2022-06-01"), memberNumber: "007" } });
  const m5_claire = await prisma.associationMembership.upsert({ where: { userId_associationId: { userId: claire.id, associationId: assoc5.id } }, update: {}, create: { userId: claire.id, associationId: assoc5.id, role: "MEMBER", status: "ACTIVE", joinedAt: new Date("2022-06-10"), memberNumber: "008" } });

  await prisma.associationActivity.upsert({ where: { id: "act-mutualiste-achats" }, update: {}, create: { id: "act-mutualiste-achats", associationId: assoc5.id, name: "Achats Groupés", type: "ACHATS_GROUPES", participation: "OPTIONAL", contributionFrequency: "MONTHLY", status: "ACTIVE" } });
  await prisma.associationActivity.upsert({ where: { id: "act-mutualiste-nature" }, update: {}, create: { id: "act-mutualiste-nature", associationId: assoc5.id, name: "Nature", type: "NATURE", participation: "OPTIONAL", contributionUnit: "NATURE", contributionFrequency: "QUARTERLY", status: "ACTIVE" } });

  await prisma.associationRelation.upsert({ where: { id: "rel-mother-5-1" }, update: {}, create: { id: "rel-mother-5-1", sourceId: assoc5.id, targetId: assoc1.id, type: "MOTHER", status: "ACTIVE", startDate: new Date("2023-01-15"), notes: "Fondatrice et tutrice de l'association fille." } });
  await prisma.associationRelation.upsert({ where: { id: "rel-child-5-2" }, update: {}, create: { id: "rel-child-5-2", sourceId: assoc5.id, targetId: assoc2.id, type: "CHILD", status: "ACTIVE", startDate: new Date("2023-06-01"), notes: "Partenariat de coopération régionale." } });

  const election5 = await prisma.election.upsert({
    where: { id: "election-mutualiste-draft" },
    update: {},
    create: {
      id: "election-mutualiste-draft", associationId: assoc5.id,
      title: "Élection du Bureau 2025-2027",
      type: "BUREAU", status: "DRAFT",
      createdById: demo.id,
    },
  });
  await prisma.electionCandidate.upsert({
    where: { id: "cand-mutualiste-draft" },
    update: {},
    create: { id: "cand-mutualiste-draft", electionId: election5.id, membershipId: m5_demo.id, position: "PRESIDENT", manifesto: "Moderniser les outils de gestion.", votesCount: 0, isElected: false },
  });

  const wf5_mem = await prisma.approvalWorkflow.upsert({
    where: { id: "wf-mutualiste-membership" },
    update: {},
    create: { id: "wf-mutualiste-membership", associationId: assoc5.id, name: "Admissions et exclusions", entityType: "MEMBERSHIP_ACTION", votingLevel: "ROUTINE", minVotesRequired: 2, timeoutHours: 48, isActive: true },
  });
  await prisma.approvalStep.upsert({ where: { id: "step-mutualiste-mem-1" }, update: {}, create: { id: "step-mutualiste-mem-1", workflowId: wf5_mem.id, stepNumber: 1, roleRequired: "PRESIDENT", action: "APPROVE" } });

  // ─── Données additionnelles ──────────────────────────────────────────────

  // LifecycleEvents (au moins 3)
  await prisma.associationLifecycleEvent.upsert({ where: { id: "lifecycle-emergence-draft-active" }, update: {}, create: { id: "lifecycle-emergence-draft-active", associationId: assoc1.id, fromStatus: "DRAFT", toStatus: "ACTIVE", triggeredBy: "USER", userId: demo.id, reason: "Validation des statuts et premier bureau élu." } });
  await prisma.associationLifecycleEvent.upsert({ where: { id: "lifecycle-emergence-active-suspended" }, update: {}, create: { id: "lifecycle-emergence-active-suspended", associationId: assoc1.id, fromStatus: "ACTIVE", toStatus: "SUSPENDED", triggeredBy: "SYSTEM", reason: "Retard de cotisations collectif détecté." } });
  await prisma.associationLifecycleEvent.upsert({ where: { id: "lifecycle-emergence-suspended-active" }, update: {}, create: { id: "lifecycle-emergence-suspended-active", associationId: assoc1.id, fromStatus: "SUSPENDED", toStatus: "ACTIVE", triggeredBy: "USER", userId: demo.id, reason: "Régularisation des arriérés et réunion de crise." } });

  // AuditLogs (au moins 5)
  await prisma.associationAuditLog.upsert({ where: { id: "audit-emergence-1" }, update: {}, create: { id: "audit-emergence-1", associationId: assoc1.id, userId: demo.id, action: "CREATE", entity: "Association", entityId: assoc1.id, details: "Création de l'association" } });
  await prisma.associationAuditLog.upsert({ where: { id: "audit-emergence-2" }, update: {}, create: { id: "audit-emergence-2", associationId: assoc1.id, userId: demo.id, action: "UPDATE", entity: "Association", entityId: assoc1.id, changes: JSON.stringify({ status: "ACTIVE" }), details: "Activation de l'association" } });
  await prisma.associationAuditLog.upsert({ where: { id: "audit-emergence-3" }, update: {}, create: { id: "audit-emergence-3", associationId: assoc1.id, userId: alice.id, action: "CREATE", entity: "Meeting", entityId: meeting1_ag.id, details: "Création de l'AG ordinaire" } });
  await prisma.associationAuditLog.upsert({ where: { id: "audit-emergence-4" }, update: {}, create: { id: "audit-emergence-4", associationId: assoc1.id, userId: pierre.id, action: "CREATE", entity: "Activity", entityId: act1_tontine.id, details: "Création de l'activité tontine" } });
  await prisma.associationAuditLog.upsert({ where: { id: "audit-emergence-5" }, update: {}, create: { id: "audit-emergence-5", associationId: assoc1.id, userId: jean.id, action: "UPDATE", entity: "Election", entityId: election1.id, details: "Clôture de l'élection du bureau" } });

  // AssocMeetingAttendance pour réunion passée de l'assoc 1 (AG_ORDINARY)
  await prisma.assocMeetingAttendance.upsert({ where: { id: "attendance-ag1-demo" }, update: {}, create: { id: "attendance-ag1-demo", meetingId: meeting1_ag.id, membershipId: m1_demo.id, status: "PRESENT" } });
  await prisma.assocMeetingAttendance.upsert({ where: { id: "attendance-ag1-jean" }, update: {}, create: { id: "attendance-ag1-jean", meetingId: meeting1_ag.id, membershipId: m1_jean.id, status: "PRESENT" } });
  await prisma.assocMeetingAttendance.upsert({ where: { id: "attendance-ag1-alice" }, update: {}, create: { id: "attendance-ag1-alice", meetingId: meeting1_ag.id, membershipId: m1_alice.id, status: "PRESENT" } });
  await prisma.assocMeetingAttendance.upsert({ where: { id: "attendance-ag1-pierre" }, update: {}, create: { id: "attendance-ag1-pierre", meetingId: meeting1_ag.id, membershipId: m1_pierre.id, status: "LATE", arrivedAt: new Date("2023-12-15T10:20:00") } });
  await prisma.assocMeetingAttendance.upsert({ where: { id: "attendance-ag1-grace" }, update: {}, create: { id: "attendance-ag1-grace", meetingId: meeting1_ag.id, membershipId: m1_grace.id, status: "PRESENT" } });
  await prisma.assocMeetingAttendance.upsert({ where: { id: "attendance-ag1-bernard" }, update: {}, create: { id: "attendance-ag1-bernard", meetingId: meeting1_ag.id, membershipId: m1_bernard.id, status: "ABSENT", justification: "Déplacement professionnel imprévu." } });

  // AssocMeetingFine (2 amendes)
  await prisma.assocMeetingFine.upsert({ where: { id: "fine-ag1-pierre" }, update: {}, create: { id: "fine-ag1-pierre", meetingId: meeting1_ag.id, membershipId: m1_pierre.id, reason: "LATE", amount: 500, paid: true, paidAt: new Date("2023-12-16") } });
  await prisma.assocMeetingFine.upsert({ where: { id: "fine-ag1-bernard" }, update: {}, create: { id: "fine-ag1-bernard", meetingId: meeting1_ag.id, membershipId: m1_bernard.id, reason: "ABSENT", amount: 1000, paid: false } });

  // AssocSocialAidRequest (2 demandes : 1 APPROVED, 1 PENDING)
  await prisma.assocSocialAidRequest.upsert({ where: { id: "aid-emergence-1" }, update: {}, create: { id: "aid-emergence-1", associationId: assoc1.id, membershipId: m1_grace.id, category: "ILLNESS_MEMBER", requestedAmount: 50000, approvedAmount: 50000, status: "APPROVED", urgencyLevel: "URGENT", approvedAt: new Date("2024-02-10"), approvedById: demo.id, justification: "Hospitalisation pour paludisme sévère." } });
  await prisma.assocSocialAidRequest.upsert({ where: { id: "aid-emergence-2" }, update: {}, create: { id: "aid-emergence-2", associationId: assoc1.id, membershipId: m1_bernard.id, category: "MARRIAGE", requestedAmount: 50000, status: "PENDING", urgencyLevel: "NORMAL", justification: "Mariage de ma sœur prévu en juin." } });

  // AssocLoan (2 prêts : 1 ACTIVE, 1 REPAID)
  const loan1_active = await prisma.assocLoan.upsert({
    where: { id: "loan-emergence-1" },
    update: {},
    create: {
      id: "loan-emergence-1", activityId: act1_pret.id, borrowerMembershipId: m1_grace.id,
      amount: 100000, interestRate: 2, duration: 3, totalDue: 106000,
      purpose: "Achat de marchandise pour boutique", status: "ACTIVE",
      approvedAt: new Date("2024-01-15"), approvedById: demo.id,
      disbursedAt: new Date("2024-01-16"), dueDate: new Date("2024-04-16"),
    },
  });
  const loan1_repaid = await prisma.assocLoan.upsert({
    where: { id: "loan-emergence-2" },
    update: {},
    create: {
      id: "loan-emergence-2", activityId: act1_pret.id, borrowerMembershipId: m1_bernard.id,
      amount: 50000, interestRate: 2, duration: 2, totalDue: 52000,
      purpose: "Réparation de moto", status: "REPAID",
      approvedAt: new Date("2023-08-01"), approvedById: demo.id,
      disbursedAt: new Date("2023-08-02"), dueDate: new Date("2023-10-02"), repaidAt: new Date("2023-09-25"),
    },
  });

  // AssocLoanRepayment (2 remboursements pour le prêt REPAID)
  await prisma.assocLoanRepayment.upsert({ where: { id: "repay-emergence-2a" }, update: {}, create: { id: "repay-emergence-2a", loanId: loan1_repaid.id, amount: 26000, principal: 25000, interest: 1000, paymentMethod: "CASH", paidAt: new Date("2023-09-01") } });
  await prisma.assocLoanRepayment.upsert({ where: { id: "repay-emergence-2b" }, update: {}, create: { id: "repay-emergence-2b", loanId: loan1_repaid.id, amount: 26000, principal: 25000, interest: 1000, paymentMethod: "MOBILE_MONEY", paidAt: new Date("2023-09-25") } });

  // ActivityContribution (10 cotisations payées pour l'assoc 1)
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-1" }, update: {}, create: { id: "contrib-emergence-1", activityId: act1_tontine.id, membershipId: m1_demo.id, amount: 25000, unit: "CASH", status: "PAID", paymentMethod: "MOBILE_MONEY", paidAt: new Date("2024-01-05") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-2" }, update: {}, create: { id: "contrib-emergence-2", activityId: act1_tontine.id, membershipId: m1_jean.id, amount: 25000, unit: "CASH", status: "PAID", paymentMethod: "BANK", paidAt: new Date("2024-01-06") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-3" }, update: {}, create: { id: "contrib-emergence-3", activityId: act1_tontine.id, membershipId: m1_alice.id, amount: 25000, unit: "CASH", status: "PAID", paymentMethod: "MOBILE_MONEY", paidAt: new Date("2024-01-05") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-4" }, update: {}, create: { id: "contrib-emergence-4", activityId: act1_tontine.id, membershipId: m1_pierre.id, amount: 25000, unit: "CASH", status: "PAID", paymentMethod: "CASH", paidAt: new Date("2024-01-07") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-5" }, update: {}, create: { id: "contrib-emergence-5", activityId: act1_tontine.id, membershipId: m1_grace.id, amount: 25000, unit: "CASH", status: "PAID", paymentMethod: "MOBILE_MONEY", paidAt: new Date("2024-01-08") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-6" }, update: {}, create: { id: "contrib-emergence-6", activityId: act1_tontine.id, membershipId: m1_bernard.id, amount: 25000, unit: "CASH", status: "PAID", paymentMethod: "CASH", paidAt: new Date("2024-01-06") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-7" }, update: {}, create: { id: "contrib-emergence-7", activityId: act1_aide.id, membershipId: m1_demo.id, amount: 5000, unit: "CASH", status: "PAID", paymentMethod: "MOBILE_MONEY", paidAt: new Date("2024-01-05") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-8" }, update: {}, create: { id: "contrib-emergence-8", activityId: act1_aide.id, membershipId: m1_jean.id, amount: 5000, unit: "CASH", status: "PAID", paymentMethod: "BANK", paidAt: new Date("2024-01-06") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-9" }, update: {}, create: { id: "contrib-emergence-9", activityId: act1_aide.id, membershipId: m1_alice.id, amount: 5000, unit: "CASH", status: "PAID", paymentMethod: "MOBILE_MONEY", paidAt: new Date("2024-01-05") } });
  await prisma.activityContribution.upsert({ where: { id: "contrib-emergence-10" }, update: {}, create: { id: "contrib-emergence-10", activityId: act1_aide.id, membershipId: m1_pierre.id, amount: 5000, unit: "CASH", status: "PAID", paymentMethod: "CASH", paidAt: new Date("2024-01-07") } });

  // ActivitySession (3 sessions pour l'assoc 1)
  const session1_1 = await prisma.activitySession.upsert({
    where: { id: "session-emergence-1" },
    update: {},
    create: {
      id: "session-emergence-1", activityId: act1_tontine.id, sessionNumber: 1,
      scheduledAt: new Date("2024-01-15T15:00:00"), heldAt: new Date("2024-01-15T15:30:00"),
      status: "HELD", potAmount: 150000, distributed: 150000, reliquat: 0, drawMethod: "ROTATION",
    },
  });
  const session1_2 = await prisma.activitySession.upsert({
    where: { id: "session-emergence-2" },
    update: {},
    create: {
      id: "session-emergence-2", activityId: act1_tontine.id, sessionNumber: 2,
      scheduledAt: new Date("2024-02-15T15:00:00"), heldAt: new Date("2024-02-15T15:30:00"),
      status: "HELD", potAmount: 150000, distributed: 150000, reliquat: 0, drawMethod: "ROTATION",
    },
  });
  await prisma.activitySession.upsert({
    where: { id: "session-emergence-3" },
    update: {},
    create: {
      id: "session-emergence-3", activityId: act1_tontine.id, sessionNumber: 3,
      scheduledAt: new Date("2024-03-15T15:00:00"),
      status: "UPCOMING", potAmount: 150000, drawMethod: "ROTATION",
    },
  });

  // ActivityBeneficiary (2 bénéficiaires pour les sessions passées)
  await prisma.activityBeneficiary.upsert({ where: { id: "benef-emergence-1" }, update: {}, create: { id: "benef-emergence-1", sessionId: session1_1.id, membershipId: m1_demo.id, partsCount: 1, amount: 150000, paidAt: new Date("2024-01-15") } });
  await prisma.activityBeneficiary.upsert({ where: { id: "benef-emergence-2" }, update: {}, create: { id: "benef-emergence-2", sessionId: session1_2.id, membershipId: m1_jean.id, partsCount: 1, amount: 150000, paidAt: new Date("2024-02-15") } });

  // AssociationNotification (5 pour l'assoc 1, dont 2 non lues)
  await prisma.associationNotification.upsert({ where: { id: "notif-emergence-1" }, update: {}, create: { id: "notif-emergence-1", associationId: assoc1.id, membershipId: m1_demo.id, title: "Nouveau membre admis", message: "Grace Manga a été admise le 1er mars 2023.", type: "SUCCESS", isRead: true } });
  await prisma.associationNotification.upsert({ where: { id: "notif-emergence-2" }, update: {}, create: { id: "notif-emergence-2", associationId: assoc1.id, membershipId: m1_jean.id, title: "Cotisation janvier reçue", message: "Votre cotisation de 25 000 FCFA a bien été reçue.", type: "INFO", isRead: true } });
  await prisma.associationNotification.upsert({ where: { id: "notif-emergence-3" }, update: {}, create: { id: "notif-emergence-3", associationId: assoc1.id, membershipId: m1_alice.id, title: "Réunion demain", message: "Rappel : AG ordinaire demain à 10h.", type: "WARNING", isRead: false } });
  await prisma.associationNotification.upsert({ where: { id: "notif-emergence-4" }, update: {}, create: { id: "notif-emergence-4", associationId: assoc1.id, membershipId: m1_pierre.id, title: "Amende enregistrée", message: "Une amende de 500 FCFA pour retard a été enregistrée.", type: "ACTION_REQUIRED", isRead: false } });
  await prisma.associationNotification.upsert({ where: { id: "notif-emergence-5" }, update: {}, create: { id: "notif-emergence-5", associationId: assoc1.id, title: "Rapport disponible", message: "Le rapport d'activité 2024 est prêt.", type: "INFO", isRead: true } });

  // AssociationWebhook (1 actif pour l'assoc 1)
  await prisma.associationWebhook.upsert({
    where: { id: "webhook-emergence-1" },
    update: {},
    create: {
      id: "webhook-emergence-1", associationId: assoc1.id,
      url: "https://hooks.zapier.com/hooks/catch/emergence-yaounde",
      secret: "whsec_emergence_2024",
      events: JSON.stringify(["MEMBER_JOINED", "MEETING_CREATED", "CONTRIBUTION_PAID"]),
      isActive: true, lastStatus: "200 OK", lastTriggeredAt: new Date("2024-12-01"),
    },
  });

  // ReportSchedule (1 planning mensuel pour l'assoc 1)
  await prisma.reportSchedule.upsert({
    where: { id: "schedule-emergence-1" },
    update: {},
    create: {
      id: "schedule-emergence-1", associationId: assoc1.id,
      reportType: "ACTIVITY", title: "Rapport mensuel d'activité", format: "PDF",
      frequency: "MONTHLY", dayOfMonth: 1, hour: 8,
      recipients: JSON.stringify(["demo@tchoua.cm", "pierre@tchoua.cm"]),
      isActive: true, nextRunAt: new Date("2025-06-01T08:00:00"),
    },
  });

  console.log("✓ V9 Associations seeded");
}

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

  await seedV9Associations();

  console.log("✅ Seed completed!");
  console.log("📧 Login: demo@tchoua.cm | 🔑 Password: demo123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
