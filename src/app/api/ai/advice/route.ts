import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Rule-based AI financial advisor — no external API, fully local
function generateAdvice(context: {
  totalContributed: number;
  totalReceived: number;
  activeLoanAmount: number;
  loanRepaid: number;
  savingsProgress: number;
  score: number;
  level: string;
  lateCount: number;
  tontineCount: number;
  monthlyCommitment: number;
}): string[] {
  const advice: string[] = [];

  // Score-based recommendations
  if (context.score < 100) {
    advice.push("🎯 Votre score de fiabilité est encore bas. Payez vos cotisations à l'heure pour gagner des points rapidement.");
  } else if (context.score >= 400) {
    advice.push("⭐ Excellent score ! Vous pouvez accéder à des prêts plus importants. Pensez à investir collectivement.");
  }

  // Loan management
  if (context.activeLoanAmount > 0) {
    const repaidPct = context.loanRepaid / context.activeLoanAmount * 100;
    if (repaidPct < 30) {
      advice.push("⚠️ Remboursez rapidement votre prêt en cours pour libérer votre capacité d'emprunt et améliorer votre score.");
    } else if (repaidPct >= 70) {
      advice.push("✅ Vous avez remboursé plus de 70% de votre prêt. Excellent rythme, continuez ainsi !");
    }
  }

  // Late payments
  if (context.lateCount > 0) {
    advice.push(`⏰ Vous avez ${context.lateCount} retard(s) de cotisation. Les retards réduisent votre score de 5 points chacun. Activez les rappels automatiques.`);
  } else {
    advice.push("✅ Aucun retard de cotisation. Votre régularité est votre meilleur atout dans la tontine.");
  }

  // Monthly commitment
  if (context.monthlyCommitment > 100000) {
    advice.push(`💡 Vos engagements mensuels (${context.monthlyCommitment.toLocaleString()} FCFA) sont élevés. Assurez-vous d'avoir une réserve de 2 mois de cotisations.`);
  }

  // Multi-tontine
  if (context.tontineCount > 3) {
    advice.push(`📊 Vous appartenez à ${context.tontineCount} tontines. Consultez vos rapports croisés pour éviter les sur-engagements.`);
  }

  // Savings encouragement
  if (context.savingsProgress < 20 && context.score > 100) {
    advice.push("💰 Définissez un objectif d'épargne personnel. Même 1 000 FCFA/semaine représente 52 000 FCFA en un an !");
  }

  // Net balance
  const netBalance = context.totalReceived - context.totalContributed - context.activeLoanAmount;
  if (netBalance < 0) {
    advice.push(`📉 Votre balance nette est négative (${Math.abs(netBalance).toLocaleString()} FCFA). Priorisez les remboursements avant de contracter un nouveau prêt.`);
  }

  // Default encouragement
  if (advice.length === 0) {
    advice.push("🌟 Votre situation financière dans la tontine est saine. Continuez sur cette lancée et envisagez un investissement collectif !");
  }

  return advice;
}

function generateResponse(message: string, context: any): string {
  const msg = message.toLowerCase();

  if (msg.includes("solde") || msg.includes("balance")) {
    return `Votre solde net est de **${(context.totalReceived - context.totalContributed).toLocaleString()} FCFA**. Vous avez cotisé ${context.totalContributed.toLocaleString()} FCFA et reçu ${context.totalReceived.toLocaleString()} FCFA depuis votre inscription.`;
  }

  if (msg.includes("score") || msg.includes("niveau") || msg.includes("points")) {
    const nextLevelInfo: Record<string, { next: string; points: number }> = {
      NOVICE: { next: "ACTIF", points: 100 },
      ACTIF: { next: "ENGAGÉ", points: 250 },
      ENGAGE: { next: "LEADER", points: 500 },
      LEADER: { next: "LÉGENDE", points: 1000 },
      LEGENDE: { next: "MAXIMUM", points: 0 },
    };
    const lvl = context.level || "NOVICE";
    const info = nextLevelInfo[lvl] || { next: "MAX", points: 0 };
    const remaining = info.points - context.score;
    return `Votre score est de **${context.score} points** (niveau **${lvl}**). Il vous manque ${remaining > 0 ? remaining + " points" : "0 point"} pour atteindre le niveau **${info.next}**. Payez vos cotisations à temps (+10 pts chacune) !`;
  }

  if (msg.includes("prêt") || msg.includes("emprunt") || msg.includes("crédit")) {
    const limits: Record<string, number> = { NOVICE: 50000, ACTIF: 200000, ENGAGE: 500000, LEADER: 1000000, LEGENDE: 2000000 };
    const limit = limits[context.level] || 50000;
    return `Avec votre niveau **${context.level}**, vous pouvez emprunter jusqu'à **${limit.toLocaleString()} FCFA**. Pour augmenter cette limite, améliorez votre score de fiabilité en cotisant régulièrement.`;
  }

  if (msg.includes("épargne") || msg.includes("objectif") || msg.includes("économiser")) {
    return `Pour commencer à épargner, fixez-vous un objectif dans le module **Épargne**. Une stratégie efficace : mettez de côté 10% de chaque cotisation reçue. Sur 12 mois, cela peut représenter une somme significative !`;
  }

  if (msg.includes("conseil") || msg.includes("recommand") || msg.includes("aide")) {
    const tips = generateAdvice(context);
    return `Voici mes conseils personnalisés :\n\n${tips.map((t) => `• ${t}`).join("\n")}`;
  }

  if (msg.includes("cotisation") || msg.includes("paiement")) {
    return `Vous avez cotisé **${context.totalContributed.toLocaleString()} FCFA** au total. Chaque cotisation payée à temps vous rapporte +10 points de fiabilité. En cas de difficultés, prévenez votre trésorier à l'avance.`;
  }

  // Default intelligent response
  const tips = generateAdvice(context);
  return `Je suis votre conseiller financier Tchoua 🤖. Basé sur votre profil (**${context.level}** · ${context.score} pts), voici ce que je vous recommande :\n\n${tips.slice(0, 2).map((t) => `• ${t}`).join("\n")}\n\nPosez-moi une question sur votre solde, score, prêts, ou épargne !`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { message, conversationId } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message requis" }, { status: 400 });

  // Build user context
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { score: true, level: true },
  });

  const [contributions, loans, memberships] = await Promise.all([
    prisma.contribution.findMany({
      where: { userId: session.user.id },
      select: { amount: true, status: true, paidAt: true, dueAt: true },
    }),
    prisma.loan.findMany({
      where: { borrowerId: session.user.id },
      include: { repayments: { select: { amount: true } } },
    }),
    prisma.membership.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { tontineId: true },
    }),
  ]);

  const totalContributed = contributions.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
  const activeLoan = loans.find((l) => ["REPAYING", "APPROVED"].includes(l.status));
  const activeLoanAmount = activeLoan?.amount || 0;
  const loanRepaid = activeLoan?.repayments.reduce((s, r) => s + r.amount, 0) || 0;
  const lateCount = contributions.filter((c) => c.status === "LATE").length;
  const monthlyCommitment = contributions.slice(-3).reduce((s, c) => s + c.amount, 0) / 3;

  const context = {
    totalContributed,
    totalReceived: totalContributed * 0.6, // simplified
    activeLoanAmount,
    loanRepaid,
    savingsProgress: 0,
    score: user?.score || 0,
    level: user?.level || "NOVICE",
    lateCount,
    tontineCount: memberships.length,
    monthlyCommitment,
  };

  const reply = generateResponse(message, context);

  // Save conversation
  let convId = conversationId;
  if (!convId) {
    const conv = await prisma.aiConversation.create({
      data: { userId: session.user.id, title: message.slice(0, 50) },
    });
    convId = conv.id;
  }

  await prisma.aiMessage.createMany({
    data: [
      { conversationId: convId, role: "USER", content: message },
      { conversationId: convId, role: "ASSISTANT", content: reply },
    ],
  });

  return NextResponse.json({ reply, conversationId: convId, advice: generateAdvice(context) });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Return personalized dashboard advice
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { score: true, level: true },
  });

  const [contributions, loans, memberships] = await Promise.all([
    prisma.contribution.findMany({ where: { userId: session.user.id }, select: { amount: true, status: true } }),
    prisma.loan.findMany({ where: { borrowerId: session.user.id, status: { in: ["REPAYING", "APPROVED"] } }, select: { amount: true } }),
    prisma.membership.findMany({ where: { userId: session.user.id, status: "ACTIVE" }, select: { tontineId: true } }),
  ]);

  const totalContributed = contributions.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
  const activeLoanAmount = loans.reduce((s, l) => s + l.amount, 0);
  const lateCount = contributions.filter((c) => c.status === "LATE").length;

  const context = {
    totalContributed,
    totalReceived: totalContributed * 0.6,
    activeLoanAmount,
    loanRepaid: 0,
    savingsProgress: 0,
    score: user?.score || 0,
    level: user?.level || "NOVICE",
    lateCount,
    tontineCount: memberships.length,
    monthlyCommitment: totalContributed / 12,
  };

  return NextResponse.json({ advice: generateAdvice(context) });
}
