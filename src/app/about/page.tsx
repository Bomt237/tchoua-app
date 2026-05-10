"use client";

import { motion } from "framer-motion";
import { 
  Users, Target, Rocket, Heart, Shield, Eye,
  Globe, Zap, Globe2, MessageSquare, 
  Handshake, Sparkles, Award, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="space-y-24 pb-20">
        
        {/* Hero Section */}
        <section className="relative pt-12 text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100">
              Notre Mission
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
              Digitaliser la <span className="text-emerald-600">Solidarité.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Tchoua est né de la volonté de moderniser les tontines traditionnelles 
              en leur offrant la puissance du numérique tout en préservant leurs valeurs humaines.
            </p>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <h2 className="text-4xl font-black text-gray-900 leading-tight">D&apos;une tradition ancestrale à un écosystème moderne.</h2>
              <div className="space-y-6 text-lg text-gray-500 font-medium leading-relaxed">
                 <p>
                    Les tontines sont le socle de l&apos;économie sociale en Afrique et dans le monde. 
                    Elles permettent de financer des projets, d&apos;épargner et de s&apos;entraider. 
                    Pourtant, leur gestion manuelle limite souvent leur potentiel.
                 </p>
                 <p>
                    Tchoua apporte la transparence, l&apos;automatisation et la sécurité nécessaire 
                    pour que ces groupes puissent passer à l&apos;échelle supérieure, sans perdre 
                    l&apos;âme de la solidarité.
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                 <div>
                    <p className="text-4xl font-black text-emerald-600">100%</p>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Open Source</p>
                 </div>
                 <div>
                    <p className="text-4xl font-black text-emerald-600">Gratuit</p>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Pour les petits groupes</p>
                 </div>
              </div>
           </div>
           <div className="bg-gray-100 rounded-[3rem] h-[500px] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/pattern-kente.svg)', backgroundSize: '300px' }} />
              <div className="relative z-10 w-4/5 h-4/5 bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 flex flex-col justify-between">
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                       <Heart className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">La Confiance Digitale</h3>
                    <p className="text-sm text-gray-400 font-medium">
                       Nous construisons les outils qui permettent à la confiance de s&apos;épanouir dans le monde numérique.
                    </p>
                 </div>
                 <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="w-12 h-12 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center text-xs font-black text-gray-400">
                          M{i}
                       </div>
                    ))}
                    <div className="w-12 h-12 rounded-full bg-emerald-600 border-4 border-white flex items-center justify-center text-xs font-black text-white">
                       +50
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Values */}
        <section className="space-y-16">
           <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900">Nos Valeurs Fondamentales</h2>
           </div>
           <div className="grid md:grid-cols-3 gap-8">
              {[
                 {
                    title: "Transparence Radicale",
                    desc: "Chaque transaction, chaque vote et chaque tirage au sort est auditable par tous les membres concernés.",
                    icon: Eye,
                    color: "emerald"
                 },
                 {
                    title: "Inclusivité Sans Faille",
                    desc: "Du smartphone dernier cri au téléphone basique via USSD, nous incluons tout le monde.",
                    icon: Globe2,
                    color: "blue"
                 },
                 {
                    title: "Souveraineté Africaine",
                    desc: "Conçu pour et par les contextes locaux, avec des données hébergées prioritairement sur le continent.",
                    icon: Shield,
                    color: "amber"
                 }
              ].map((item, idx) => (
                 <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-10 bg-white rounded-[2.5rem] border border-gray-100 text-center space-y-6 hover:shadow-xl transition-all"
                 >
                    <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mx-auto`}>
                       <item.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{item.title}</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-20 bg-emerald-900 rounded-[3rem] text-white">
           <h2 className="text-3xl md:text-5xl font-black mb-8">Rejoignez le mouvement.</h2>
           <p className="text-lg text-emerald-100/70 font-medium mb-12 max-w-2xl mx-auto">
              Soyez parmi les premiers à transformer la gestion de votre tontine et à 
              participer à la construction d&apos;une finance plus solidaire.
           </p>
           <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="px-10 py-5 bg-white text-emerald-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                Démarrer Maintenant
              </Link>
              <Link href="/contact" className="px-10 py-5 bg-emerald-800 text-white border border-emerald-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all">
                Nous Contacter
              </Link>
           </div>
        </section>
      </div>
    </PublicLayout>
  );
}
