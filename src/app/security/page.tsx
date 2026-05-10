"use client";

import { motion } from "framer-motion";
import { 
  Shield, Lock, Eye, EyeOff, Server, 
  Smartphone, Fingerprint, Key, CheckCircle, 
  AlertTriangle, ShieldCheck, Globe, Zap
} from "lucide-react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";

export default function SecurityPage() {
  return (
    <PublicLayout>
      <div className="space-y-24 pb-20">
        
        {/* Hero Section */}
        <section className="relative pt-12 text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
              La Confiance par la <span className="text-indigo-600">Sécurité.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Chez Tchoua, la protection de vos fonds et de vos données n&apos;est pas une option. 
              C&apos;est le socle sur lequel repose notre plateforme.
            </p>
          </motion.div>
        </section>

        {/* Security Pillars */}
        <section className="grid md:grid-cols-3 gap-8">
           {[
              {
                title: "Cryptage de Bout en Bout",
                desc: "Toutes vos données sensibles et transactions sont cryptées (AES-256) avant même de quitter votre appareil.",
                icon: Lock,
                color: "indigo"
              },
              {
                title: "Architecture Décentralisée",
                desc: "Nous utilisons des technologies de registre partagé pour garantir l'immutabilité de vos historiques financiers.",
                icon: Server,
                color: "blue"
              },
              {
                title: "Vérification Multi-Facteurs",
                desc: "Chaque action critique nécessite une double validation (SMS/Email) ou une approbation par les pairs.",
                icon: Key,
                color: "emerald"
              }
           ].map((item, idx) => (
              <motion.div
                 key={item.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="p-10 bg-white rounded-[2.5rem] border border-gray-100 space-y-6 hover:shadow-xl transition-all"
              >
                 <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center`}>
                    <item.icon className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
           ))}
        </section>

        {/* Detailed Security Features */}
        <section className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-white">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                 <h2 className="text-4xl font-black leading-tight">Une Protection Multi-Couches pour votre Association.</h2>
                 <div className="space-y-8">
                    {[
                       { title: "Souveraineté des Données", desc: "Vos données sont hébergées dans des centres de données sécurisés, avec une priorité pour les infrastructures locales africaines." },
                       { title: "Audit en Temps Réel", desc: "Chaque membre peut consulter le journal d'audit complet de l'association. Plus aucune zone d'ombre." },
                       { title: "Conformité Réglementaire", desc: "Tchoua est conçu pour respecter les normes de protection des données et les régulations financières locales." }
                    ].map(feature => (
                       <div key={feature.title} className="flex gap-6">
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                             <CheckCircle className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-lg font-black">{feature.title}</h4>
                             <p className="text-sm text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full" />
                 <div className="relative z-10 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                       <span className="font-black text-sm uppercase tracking-widest text-indigo-400">Statut du Système</span>
                       <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="space-y-4">
                       {[
                          { label: "Cryptage des Données", status: "Actif", color: "emerald" },
                          { label: "Authentification 2FA", status: "Actif", color: "emerald" },
                          { label: "Pare-feu de Réseau", status: "Sécurisé", color: "emerald" },
                          { label: "Intégrité des Registres", status: "100%", color: "emerald" }
                       ].map(item => (
                          <div key={item.label} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                             <span className="text-sm font-bold text-gray-300">{item.label}</span>
                             <span className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-400 bg-${item.color}-400/10 px-3 py-1 rounded-full`}>
                                {item.status}
                             </span>
                          </div>
                       ))}
                    </div>
                    <div className="p-4 bg-indigo-900/30 rounded-2xl border border-indigo-500/20 text-center">
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Dernier Scan de Sécurité</p>
                       <p className="text-xs font-bold text-white">Aujourd&apos;hui à 12:45 (GMT+1)</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 bg-indigo-50 rounded-[3rem] border-2 border-indigo-100">
           <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900">Transparence Totale.</h2>
              <p className="text-lg text-gray-500 font-medium">
                 Vous voulez en savoir plus sur nos protocoles techniques ou signaler une vulnérabilité ? 
                 Consultez notre documentation de sécurité.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                 <Link href="/developpeurs" className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                   Espace Développeur
                 </Link>
                 <Link href="/aide" className="px-10 py-5 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                   Support Sécurité
                 </Link>
              </div>
           </div>
        </section>
      </div>
    </PublicLayout>
  );
}
