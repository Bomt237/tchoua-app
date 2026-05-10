"use client";

import { motion } from "framer-motion";
import { 
  Users, PiggyBank, Heart, Wallet, Shield, Zap, Globe, 
  BarChart3, Store, Gavel, Calendar, Smartphone, 
  CheckCircle, ArrowRight, Star, TrendingUp, Handshake,
  PieChart, Receipt, BookOpen, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";

const features = [
  {
    category: "Gestion des Tontines",
    icon: Users,
    color: "emerald",
    items: [
      {
        title: "Tontines Rotatives (ROSCA)",
        description: "Gestion automatisée des cycles, des tirages au sort et de l'attribution du pot.",
        icon: Zap
      },
      {
        title: "Tontines d'Épargne (ASCA)",
        description: "Fonds commun permettant l'épargne productive et le crédit interne avec intérêts.",
        icon: TrendingUp
      },
      {
        title: "Tontines aux Enchères",
        description: "Système dynamique où les membres enchérissent pour l'attribution du pot.",
        icon: Gavel
      }
    ]
  },
  {
    category: "Microfinance & Crédit",
    icon: Wallet,
    color: "amber",
    items: [
      {
        title: "Prêts Internes",
        description: "Demandes de prêt simplifiées, scoring de crédit communautaire et suivi des remboursements.",
        icon: Handshake
      },
      {
        title: "Épargne Collective",
        description: "Suivi des objectifs d'épargne individuels et collectifs avec capitalisation des intérêts.",
        icon: PiggyBank
      },
      {
        title: "Fonds de Garantie",
        description: "Sécurisation des engagements financiers via un fonds de réserve mutuel.",
        icon: Shield
      }
    ]
  },
  {
    category: "Solidarité & Social",
    icon: Heart,
    color: "rose",
    items: [
      {
        title: "Fonds de Solidarité",
        description: "Gestion des aides sociales (santé, deuil, heureux événements) de manière transparente.",
        icon: Heart
      },
      {
        title: "Contributions en Nature",
        description: "Valorisation et enregistrement des apports non-financiers (agriculture, services).",
        icon: Star
      },
      {
        title: "Marketplace Intégré",
        description: "Échanges commerciaux et achats groupés entre les membres de l'association.",
        icon: Store
      }
    ]
  },
  {
    category: "Gouvernance & Transparence",
    icon: BarChart3,
    color: "indigo",
    items: [
      {
        title: "Comptabilité Automatisée",
        description: "Journal des transactions, rapports financiers et bilans générés en temps réel.",
        icon: Receipt
      },
      {
        title: "Gestion des Assemblées",
        description: "Convocations, votes sécurisés et archivage numérique des procès-verbaux.",
        icon: Calendar
      },
      {
        title: "Analytique & Rapports",
        description: "Visualisation de la performance et de la santé financière du groupe.",
        icon: PieChart
      }
    ]
  }
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="space-y-24 pb-20">
        
        {/* Hero Section */}
        <section className="relative pt-12 overflow-hidden">
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100">
                L&apos;Ecosystème Complet
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
                Tout ce qu&apos;il faut pour votre <span className="text-emerald-600">Communauté.</span>
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                Tchoua digitalise chaque aspect de la vie associative, de la tontine traditionnelle 
                à la microfinance moderne, avec une transparence absolue.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="px-8 py-4 bg-[#0d3d28] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                  Ouvrir un compte gratuit
                </Link>
                <Link href="/how-it-works" className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                  Comment ça marche ?
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid gap-20">
          {features.map((group, groupIdx) => (
            <div key={group.category} className="space-y-10">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className={`w-14 h-14 rounded-2xl bg-${group.color}-50 text-${group.color}-600 flex items-center justify-center shadow-sm`}>
                  <group.icon className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">{group.category}</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {group.items.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed text-sm">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Specific Modules Showcase */}
        <section className="bg-[#0d3d28] rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#e68a00] text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                Innovation Sociale
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Le Marketplace : Faire du <span className="text-[#e68a00]">Commerce</span> au sein de votre réseau.
              </h2>
              <p className="text-lg text-emerald-50/80 font-medium leading-relaxed mb-10">
                Plus qu&apos;une application financière, Tchoua est un réseau économique. Vendez vos produits, 
                effectuez des achats groupés et stimulez l&apos;économie locale directement avec vos membres.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Paiement sécurisé via séquestre tontine",
                  "Ventes flash et enchères de produits",
                  "Système de notation des vendeurs",
                  "Catalogue partagé et gestion de stock"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#e68a00]" />
                    <span className="font-bold">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/marketplace" className="inline-flex items-center gap-2 text-[#e68a00] font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                Découvrir le marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white/5 rounded-[2rem] border border-white/10 p-8 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-black">Dernières Offres</span>
                  <Store className="w-5 h-5 text-[#e68a00]" />
                </div>
                {[
                  { name: "Sac de Riz (50kg)", price: "25 000 FCFA", seller: "Agro-Coop" },
                  { name: "Service de Livraison", price: "2 000 FCFA", seller: "Express Tontine" },
                  { name: "Matériel Scolaire", price: "12 500 FCFA", seller: "Librairie Membre" }
                ].map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm font-bold">{product.name}</div>
                      <div className="text-[10px] text-emerald-400">Par {product.seller}</div>
                    </div>
                    <div className="text-sm font-black text-[#e68a00]">{product.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Global Reach */}
        <section className="text-center space-y-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Partout où vous êtes.</h2>
            <p className="text-lg text-gray-500 font-medium">
              Disponible en plusieurs langues et adapté aux contextes locaux (Ghomala&apos;, Ewondo, Douala, Fulfulde).
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {["🇫🇷 Français", "🇺🇸 English", "🇪🇸 Español", "🇩🇪 Deutsch"].map(lang => (
              <div key={lang} className="px-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-gray-600 shadow-sm">
                {lang}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 bg-[#f7f3eb] rounded-[3rem] border-2 border-[#e2ddd4]">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8">Prêt à transformer votre association ?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/register" className="px-10 py-5 bg-[#0d3d28] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                Démarrer gratuitement
             </Link>
             <Link href="/aide" className="px-10 py-5 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
                Contacter un conseiller
             </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
