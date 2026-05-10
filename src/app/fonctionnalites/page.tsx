"use client";

import { AdaptiveLayout } from "@/components/layout/adaptive-layout";
import Link from "next/link";
import {
  Users, ShoppingBasket, RotateCcw, ShoppingBag, Landmark, TrendingUp,
  Heart, BookOpen, HandHeart, Wheat, MessageCircle, BarChart3, Bot,
  Calendar, Trophy, Bell, Globe, Settings,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Adhésion & Gestion des Profils",
    tagline: "Onboarding fluide et profils riches",
    desc: "Inscription simple, validation par le bureau, profils détaillés avec photo, contacts, rôles (membre, président, trésorier, secrétaire, censeur). Gestion des cotisants actifs/inactifs et historique complet par membre.",
    bullets: ["Validation des nouveaux membres", "Rôles & permissions", "Historique par profil", "Photos et coordonnées"],
  },
  {
    icon: ShoppingBasket,
    title: "Cotisations & Paiements",
    tagline: "Multi-supports : cash, nature, services",
    desc: "Saisie des cotisations en FCFA, en nature (maïs, café, huile) ou en services. Intégration MTN MoMo, Orange Money, Wave, Express Union et espèces. Suivi automatique des retards et pénalités.",
    bullets: ["Multi-devises CEMAC", "Cotisations en nature", "Mobile Money intégré", "Retards & pénalités"],
  },
  {
    icon: RotateCcw,
    title: "Sessions & Rotation Bénéficiaires",
    tagline: "ROSCA, ASCA, hybride",
    desc: "Planification automatique des séances avec fréquences flexibles (1er Samedi, après le 5, jour fixe…). Plusieurs bénéficiaires par séance. Attribution montant fixe ou pourcentage de la cagnotte.",
    bullets: ["Fréquences personnalisables", "Tirage transparent", "Multi-bénéficiaires", "Reliquat en caisse"],
  },
  {
    icon: ShoppingBag,
    title: "Marketplace & Achats Groupés",
    tagline: "Pouvoir d'achat collectif",
    desc: "Marketplace communautaire pour les membres : annonces, achats groupés à prix de gros, échanges entre tontines. Réduisez les coûts en achetant ensemble.",
    bullets: ["Annonces internes", "Achats groupés", "Prix de gros", "Échanges inter-tontines"],
  },
  {
    icon: Landmark,
    title: "Prêts & Microfinance Interne",
    tagline: "Crédit interne avec amortissement",
    desc: "Octroi de prêts sur la caisse de la tontine avec taux d'intérêt mensuel, tableau d'amortissement automatique, processus d'approbation collégial et suivi des remboursements.",
    bullets: ["Taux configurable", "Tableau d'amortissement", "Approbation collégiale", "Grand livre OHADA"],
  },
  {
    icon: TrendingUp,
    title: "Investissement & Épargne",
    tagline: "Objectifs et projections",
    desc: "Définissez des objectifs d'épargne individuels ou collectifs, suivez vos projections, planifiez les investissements collectifs (terrains, immobilier, projets agricoles).",
    bullets: ["Objectifs personnels", "Projections automatiques", "Investissements collectifs", "Suivi multi-tontines"],
  },
  {
    icon: Heart,
    title: "Solidarité & Aide Sociale",
    tagline: "Fonds d'urgence et entraide",
    desc: "Fonds d'urgence pour maladie, accident, décès. Aide naissance, mariage, scolarité. Vote démocratique sur les décisions importantes et assemblée générale virtuelle.",
    bullets: ["Fonds d'urgence", "Aides évènements de vie", "Vote démocratique", "AG virtuelle"],
  },
  {
    icon: BookOpen,
    title: "Budget & Comptabilité",
    tagline: "Conformité OHADA",
    desc: "Grand livre partagé conforme à la norme OHADA. Budget prévisionnel par tontine, suivi des dépenses, rapprochement automatique avec les comptes bancaires de la tontine.",
    bullets: ["Grand livre OHADA", "Budget prévisionnel", "Comptes bancaires", "Audit trail complet"],
  },
  {
    icon: HandHeart,
    title: "Dons & Engagement",
    tagline: "Contributions volontaires",
    desc: "Recueillez des dons pour des causes communautaires, suivez l'engagement de chaque membre, valorisez les contributions exceptionnelles dans le scoring.",
    bullets: ["Dons fléchés", "Suivi engagement", "Reçus automatiques", "Reconnaissance publique"],
  },
  {
    icon: Wheat,
    title: "Tontines en Nature",
    tagline: "Maïs, café, huile, services",
    desc: "Gérez les tontines agricoles et de services avec la même rigueur que les tontines en cash. Conversion optionnelle en valeur monétaire, gestion des unités et des stocks.",
    bullets: ["Produits agricoles", "Services & compétences", "Conversion en FCFA", "Gestion des stocks"],
  },
  {
    icon: MessageCircle,
    title: "Chat de Groupe",
    tagline: "Communication temps réel",
    desc: "Messagerie instantanée par tontine avec canaux publics et restreints. Annonces officielles du bureau, discussions entre membres, partage de fichiers et photos.",
    bullets: ["Canaux par tontine", "Bureau / membres", "Partage de fichiers", "Notifications push"],
  },
  {
    icon: BarChart3,
    title: "Rapports & Analytics",
    tagline: "Décisions basées sur les données",
    desc: "Rapports individuels et croisés multi-tontines. Export CSV pour analyses externes. Tableaux de bord personnalisables, graphiques d'évolution et indicateurs clés.",
    bullets: ["Rapports croisés", "Export CSV / Excel", "Dashboards visuels", "KPIs configurables"],
  },
  {
    icon: Bot,
    title: "Conseiller Financier IA",
    tagline: "Local, sans API externe",
    desc: "Assistant IA contextualisé qui comprend votre tontine, propose des conseils d'épargne, alerte sur les retards et anomalies. 100% local, vos données restent chez vous.",
    bullets: ["Conseils contextuels", "Alertes intelligentes", "100% local & privé", "Multilingue"],
  },
  {
    icon: Calendar,
    title: "Calendrier & Événements",
    tagline: "Vue unifiée multi-tontines",
    desc: "Calendrier fusionné de toutes vos tontines : séances, AG, échéances de prêts, événements culturels. Synchronisation possible avec Google Calendar.",
    bullets: ["Calendrier unifié", "Échéances tracées", "Événements culturels", "Sync Google Cal"],
  },
  {
    icon: Trophy,
    title: "Gamification & Scoring",
    tagline: "5 niveaux, badges, classements",
    desc: "Système de score sur 4 axes (Fiabilité, Solidarité, Nature, Éthique) avec 5 niveaux Novice → Légende. Badges, avantages financiers, sanctions graduées et leaderboard.",
    bullets: ["Score 4 axes", "5 niveaux & badges", "Avantages concrets", "Leaderboard"],
  },
  {
    icon: Bell,
    title: "Notifications Intelligentes",
    tagline: "Push, SMS, email",
    desc: "Notifications multi-canaux pour rappels de cotisations, séances à venir, échéances de prêts, votes en cours. Personnalisez vos préférences par type d'alerte.",
    bullets: ["Push mobile", "SMS & email", "Préférences fines", "Rappels automatiques"],
  },
  {
    icon: Globe,
    title: "Multilingue & Multi-Pays",
    tagline: "FR, EN, ES, DE + extensible",
    desc: "Interface complète en français, anglais, espagnol, allemand. Ajoutez vos propres langues depuis les paramètres. Adapté CEMAC et diaspora avec gestion multi-devises.",
    bullets: ["4 langues natives", "Langues custom", "Multi-devises", "Adapté diaspora"],
  },
  {
    icon: Settings,
    title: "Paramètres Avancés",
    tagline: "Configurez tout, partout",
    desc: "Personnalisez les rôles, les fréquences, les pénalités, les seuils de scoring, les modèles de documents (PV, reçus). Open source : auto-hébergeable sur votre infrastructure.",
    bullets: ["Rôles personnalisés", "Modèles de documents", "Open source MIT", "Auto-hébergeable"],
  },
];

export default function FonctionnalitesPage() {
  return (
    <AdaptiveLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(13,61,40,0.08)", color: "#0d3d28" }}>
            18 modules · Un écosystème complet
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#0d3d28" }}>
            Fonctionnalités
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tout ce dont une tontine moderne a besoin pour gérer ses membres, ses cotisations,
            ses prêts et son développement collectif — en un seul outil open source.
          </p>
        </div>

        {/* Features alternating layout */}
        <div className="space-y-16">
          {features.map((f, i) => {
            const Icon = f.icon;
            const reverse = i % 2 === 1;
            return (
              <div
                key={i}
                className={`grid md:grid-cols-2 gap-8 items-center ${reverse ? "md:[direction:rtl]" : ""}`}
              >
                <div className="md:[direction:ltr]">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: "rgba(13,61,40,0.08)" }}>
                    <Icon className="w-6 h-6" style={{ color: "#0d3d28" }} />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    Module {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#0d3d28" }}>
                    {f.title}
                  </h2>
                  <div className="text-sm font-medium mb-4" style={{ color: "#e68a00" }}>
                    {f.tagline}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-5">{f.desc}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {f.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#0d3d28" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual block */}
                <div className="md:[direction:ltr]">
                  <div
                    className="aspect-[4/3] rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #0d3d28 0%, #1a5c3a 100%)",
                    }}
                  >
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }} />
                    <Icon className="w-32 h-32 text-white/30" />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-lg p-3 backdrop-blur">
                      <div className="text-xs font-semibold" style={{ color: "#0d3d28" }}>
                        {f.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{f.tagline}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-2xl p-8 md:p-12 text-center" style={{ background: "#0d3d28" }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Prêt à moderniser votre tontine ?
          </h2>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            Open source, gratuit, multilingue. Auto-hébergez ou démarrez en quelques clics.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="px-6 py-3 rounded-lg font-semibold text-sm" style={{ background: "#e68a00", color: "#0d3d28" }}>
              Commencer gratuitement
            </Link>
            <Link href="/academie" className="px-6 py-3 rounded-lg font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors">
              Consulter l'Académie
            </Link>
          </div>
        </div>
      </div>
    </AdaptiveLayout>
  );
}
