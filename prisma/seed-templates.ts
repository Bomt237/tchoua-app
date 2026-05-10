import { prisma } from "../src/lib/prisma";

async function seedTemplates() {
  console.log("🌱 Seeding system templates...");

  const templates = [
    {
      id: "tpl_tontine_rotative",
      name: "Tontine Rotative Simple",
      description: "Le modèle de départ pour toute première tontine. Simple, transparent et efficace, il organise une distribution mensuelle du pot selon un ordre fixé. Idéal pour les groupes débutants qui souhaitent se lancer sans complexité.",
      category: "TONTINE",
      origin: "SYSTEM",
      visibility: "PUBLIC",
      targetAudience: "Débutants, groupes de proches",
      iconEmoji: "🔄",
      color: "#0d3d28",
      reglementHtml: "<h2>Règlement Type — Tontine Rotative</h2><p><strong>Article 1 :</strong> L'association se réunit chaque 1er samedi du mois à partir de 15h00.</p><p><strong>Article 2 :</strong> Chaque membre verse une cotisation mensuelle fixe dont le montant est défini en assemblée.</p><p><strong>Article 3 :</strong> La cagnotte est remise au membre désigné selon l'ordre de rotation décidé collectivement.</p>",
      activities: [
        {
          name: "Tontine Principale",
          description: "La cotisation mensuelle regroupée en un pot remis à un membre selon l'ordre de rotation.",
          type: "TONTINE_ROTATIVE",
          participation: "MANDATORY",
          contributionAmount: 25000,
          contributionFrequency: "MONTHLY",
          distributionMode: "ROTATION",
          penaltyLatePercent: 15,
          sortOrder: 1,
          isDefaultEnabled: true,
          docObjective: "Permettre à chaque membre de recevoir, à tour de rôle, une somme importante pour réaliser un projet personnel.",
          docImportance: "C'est le cœur de la tontine. Son bon fonctionnement repose sur la confiance et la régularité de chacun.",
          docTips: "Définissez l'ordre de rotation dès la première réunion. Faites signer une reconnaissance de dette avant remise de la cagnotte.",
          docPitfalls: "Évitez de changer l'ordre de rotation en cours de cycle. Ne remettez jamais la cagnotte avant d'avoir vérifié les arriérés du bénéficiaire.",
        },
      ],
    },
    {
      id: "tpl_famille_complete",
      name: "Tontine Familiale Complète",
      description: "Conçu pour les familles élargies et les groupes de proches. Ce modèle combine la tontine principale avec une caisse solidarité pour les décès et les naissances, reflétant les valeurs d'entraide des familles africaines.",
      category: "FAMILLE",
      origin: "SYSTEM",
      visibility: "PUBLIC",
      targetAudience: "Familles élargies, groupes de proches",
      iconEmoji: "👨‍👩‍👧‍👦",
      color: "#7c3aed",
      activities: [
        { name: "Tontine Principale", type: "TONTINE_ROTATIVE", participation: "MANDATORY", contributionAmount: 20000, contributionFrequency: "MONTHLY", distributionMode: "ROTATION", penaltyLatePercent: 15, sortOrder: 1, isDefaultEnabled: true, docObjective: "Constituer le pot rotatif mensuel pour les membres.", docImportance: "Obligation centrale de l'association.", docTips: "Définissez l'ordre avec toute la famille.", docPitfalls: "Soyez ferme sur les délais de paiement même en famille." },
        { name: "Caisse Solidarité Décès", type: "AIDE_SOLIDAIRE", participation: "MANDATORY", contributionAmount: 5000, contributionFrequency: "PER_SESSION", penaltyLatePercent: 10, sortOrder: 2, isDefaultEnabled: true, docObjective: "Constituer un fonds pour soutenir les familles en cas de décès d'un proche.", docImportance: "Permet à chaque membre de faire face dignement aux obsèques sans s'endetter.", docTips: "Fixez des plafonds clairs par type de décès (membre, conjoint, parent, enfant).", docPitfalls: "Ne laissez pas le fonds être utilisé pour autre chose qu'un décès déclaré et prouvé." },
        { name: "Caisse Naissance & Mariage", type: "COLLECTION", participation: "OPTIONAL", contributionAmount: 2000, contributionFrequency: "PER_SESSION", sortOrder: 3, isDefaultEnabled: true, docObjective: "Célébrer ensemble les heureux événements de la vie familiale.", docImportance: "Renforce les liens et la cohésion du groupe.", docTips: "Ouvrez la souscription 2 mois avant l'événement.", docPitfalls: "Ne rendez pas cette caisse obligatoire, certains membres pourraient être dans des périodes financières difficiles." },
      ],
    },
    {
      id: "tpl_commercants",
      name: "Association Commerçants",
      description: "Pensé pour les commerçants et petits entrepreneurs qui ont besoin de liquidités fréquentes. Cycle hebdomadaire, accès au crédit rapide et épargne individuelle sont les piliers de ce modèle.",
      category: "COMMERCE",
      origin: "SYSTEM",
      visibility: "PUBLIC",
      targetAudience: "Commerçants, artisans, petit business",
      iconEmoji: "🛒",
      color: "#dc6b19",
      activities: [
        { name: "Tontine Hebdomadaire", type: "TONTINE_ROTATIVE", participation: "MANDATORY", contributionAmount: 10000, contributionFrequency: "WEEKLY", distributionMode: "ROTATION", penaltyLatePercent: 20, sortOrder: 1, isDefaultEnabled: true, docObjective: "Assurer un flux de liquidités rapide pour les besoins commerciaux.", docImportance: "La fréquence hebdomadaire est adaptée au cycle de trésorerie des commerçants.", docTips: "Organisez les réunions en dehors des jours de marché.", docPitfalls: "La pénalité de retard doit être dissuasive étant donné la fréquence élevée." },
        { name: "Caisse de Crédit Rapide", type: "PRET", participation: "MANDATORY", contributionAmount: 5000, contributionFrequency: "MONTHLY", sortOrder: 2, isDefaultEnabled: true, docObjective: "Offrir un accès rapide au crédit pour les opportunités commerciales.", docImportance: "Permet de saisir des opportunités de stock ou de marché sans attendre une banque.", docTips: "Limitez les prêts à 2x la cotisation cumulée du membre. Exigez un garant.", docPitfalls: "Gérez la liste d'attente en cas de demandes simultanées. Fixez une limite d'encours par membre." },
        { name: "Épargne Personnelle", type: "EPARGNE", participation: "OPTIONAL", contributionFrequency: "MONTHLY", sortOrder: 3, isDefaultEnabled: true, docObjective: "Permettre à chaque membre de se constituer une épargne personnelle sécurisée.", docImportance: "Protège contre les dépenses impulsives en période de vaches maigres.", docTips: "Laissez le membre configurer sa clé de répartition (montant fixe ou % du versement).", docPitfalls: "N'immobilisez pas l'épargne plus de 6 mois sans accord du membre." },
      ],
    },
    {
      id: "tpl_groupe_projet",
      name: "Groupe de Projet Commun",
      description: "Idéal pour financer un objectif collectif précis : construction, achat de terrain, création d'entreprise. Toutes les cotisations ont un but défini et la discipline est maximale.",
      category: "PROJET",
      origin: "SYSTEM",
      visibility: "PUBLIC",
      targetAudience: "Groupes porteurs d'un projet commun",
      iconEmoji: "🏗️",
      color: "#0284c7",
      activities: [
        { name: "Épargne Projet (Capital)", type: "INVESTISSEMENT", participation: "MANDATORY", contributionAmount: 50000, contributionFrequency: "MONTHLY", sortOrder: 1, isDefaultEnabled: true, docObjective: "Constituer le capital nécessaire à la réalisation du projet commun.", docImportance: "C'est le cœur du dispositif. Toute défection compromet le projet de tous.", docTips: "Fixez une date cible et calculez rétrospectivement le montant mensuel requis.", docPitfalls: "Ne remettez jamais le capital avant d'avoir atteint le seuil minimal du projet." },
        { name: "Caisse de Fonctionnement", type: "COLLECTION", participation: "MANDATORY", contributionAmount: 5000, contributionFrequency: "MONTHLY", sortOrder: 2, isDefaultEnabled: true, docObjective: "Couvrir les frais de gestion de l'association (réunions, documents, déplacements).", docImportance: "Évite que les frais de fonctionnement ne viennent ponctionner le capital projet.", docTips: "Produisez un bilan de cette caisse à chaque réunion.", docPitfalls: "Intervenez rapidement si cette caisse devient un fourre-tout dépenses." },
        { name: "Caisse Solidarité", type: "AIDE_SOLIDAIRE", participation: "MANDATORY", contributionAmount: 2000, contributionFrequency: "PER_SESSION", sortOrder: 3, isDefaultEnabled: false, docObjective: "Soutenir les membres en difficulté ponctuelle sans compromettre le projet.", docImportance: "Renforce la cohésion du groupe sur la durée du projet.", docTips: "Définissez des cas d'aide strictement (maladie, décès) pour éviter les abus.", docPitfalls: "Cette caisse ne doit jamais être mélangée avec le capital projet." },
      ],
    },
    {
      id: "tpl_villageoise",
      name: "Association Villageoise",
      description: "Pour les ressortissants d'un village ou d'une région, souvent en diaspora. Ce modèle combine la solidarité (décès, maladie) avec le développement communautaire du village d'origine.",
      category: "VILLAGE",
      origin: "SYSTEM",
      visibility: "PUBLIC",
      targetAudience: "Ressortissants villageois, diaspora africaine",
      iconEmoji: "🏡",
      color: "#059669",
      activities: [
        { name: "Cotisation Mensuelle", type: "TONTINE_ROTATIVE", participation: "MANDATORY", contributionAmount: 15000, contributionFrequency: "MONTHLY", distributionMode: "ROTATION", sortOrder: 1, isDefaultEnabled: true, docObjective: "Assurer un revenu tournant entre les membres.", docImportance: "Finance les projets personnels des membres.", docTips: "Priorisez les membres présents aux réunions pour le tirage.", docPitfalls: "Assurez-vous que tous les membres comprennent l'ordre de rotation." },
        { name: "Caisse Décès (Prioritaire)", type: "AIDE_SOLIDAIRE", participation: "MANDATORY", contributionAmount: 10000, contributionFrequency: "PER_SESSION", sortOrder: 2, isDefaultEnabled: true, docObjective: "Organiser des obsèques dignes pour chaque membre ou proche décédé.", docImportance: "Dans la culture africaine, les obsèques sont un devoir sacré de la communauté.", docTips: "Définissez des montants précis par catégorie (membre, conjoint, parent, enfant).", docPitfalls: "Ne laissez jamais cette caisse tomber à zéro." },
        { name: "Fonds Développement Village", type: "COLLECTION", participation: "MANDATORY", contributionAmount: 5000, contributionFrequency: "MONTHLY", sortOrder: 3, isDefaultEnabled: true, docObjective: "Financer des projets d'intérêt général au village (école, forage, route).", docImportance: "Concrétise l'attachement de la diaspora à ses racines.", docTips: "Désignez un Commissaire aux comptes spécifique pour ce fonds.", docPitfalls: "Publiez régulièrement l'état des dépenses pour maintenir la confiance de tous." },
        { name: "Caisse Maladie", type: "AIDE_SOLIDAIRE", participation: "OPTIONAL", contributionAmount: 3000, contributionFrequency: "MONTHLY", sortOrder: 4, isDefaultEnabled: true, docObjective: "Aider les membres hospitalisés à faire face aux frais médicaux.", docImportance: "La maladie est imprévisible; cette caisse apporte une sécurité collective.", docTips: "Exigez un certificat médical pour tout décaissement.", docPitfalls: "Définissez un plafond par hospitalisation pour maintenir la viabilité du fonds." },
      ],
    },
    {
      id: "tpl_religieux",
      name: "Groupe Religieux / Paroisse",
      description: "Adapté aux groupes de prière, chorales, et communautés religieuses. Mêle les offrandes optionnelles avec une caisse solidarité pour les membres et un fonds pour les projets paroissiaux.",
      category: "RELIGIEUX",
      origin: "SYSTEM",
      visibility: "PUBLIC",
      targetAudience: "Groupes de prière, chorales, paroisses",
      iconEmoji: "⛪",
      color: "#9333ea",
      activities: [
        { name: "Dîmes & Offrandes", type: "COLLECTION", participation: "OPTIONAL", contributionFrequency: "MONTHLY", sortOrder: 1, isDefaultEnabled: true, docObjective: "Permettre à chaque membre de contribuer librement selon ses moyens et sa foi.", docImportance: "Le caractère optionnel respecte la situation financière de chacun.", docTips: "Proposez des moyens de paiement modernes (Mobile Money) pour faciliter les dons.", docPitfalls: "Ne forcez jamais la participation. L'aspect spirituel doit primer sur le financier." },
        { name: "Caisse Solidarité Membres", type: "AIDE_SOLIDAIRE", participation: "MANDATORY", contributionAmount: 1000, contributionFrequency: "MONTHLY", sortOrder: 2, isDefaultEnabled: true, docObjective: "Porter secours aux membres dans le besoin (maladie, décès, accident).", docImportance: "Concrétise les valeurs de charité et de fraternité de la communauté.", docTips: "Constituez un comité de 3 personnes pour décider des attributions.", docPitfalls: "Gardez des critères d'attribution clairs pour éviter la favoritisme." },
        { name: "Fonds Projet Paroissial", type: "EPARGNE", participation: "OPTIONAL", contributionFrequency: "MONTHLY", sortOrder: 3, isDefaultEnabled: false, docObjective: "Financer des projets de la communauté (rénovation, événement, équipement).", docImportance: "Donne aux membres un sentiment de contribution tangible à leur communauté.", docTips: "Votez les projets en assemblée et publiez les comptes.", docPitfalls: "Ne démarrez pas un projet avant d'avoir collecté au moins 50% du budget." },
      ],
    },
  ];

  for (const templateData of templates) {
    const { activities, ...tmpl } = templateData;

    await prisma.associationTemplate.upsert({
      where: { id: tmpl.id },
      update: {},
      create: {
        ...tmpl,
        activities: {
          create: activities.map((act, idx) => ({
            ...act,
            sortOrder: idx + 1,
          })),
        },
      },
    });
    console.log(`  ✅ Template: ${tmpl.name}`);
  }

  console.log(`\n✨ Done! ${templates.length} system templates seeded.`);
}

seedTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
