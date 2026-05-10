"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, Users, CreditCard, Wheat, Wrench, Zap, 
  Package, Clock, Heart, Baby, Flower2, GraduationCap, 
  Truck, BookOpen, Eye, Accessibility, Shield, 
  CheckCircle, TrendingUp, PiggyBank, ShoppingCart, 
  Drum, TreePine, Landmark, ChevronRight, UserCheck,
  ArrowRight, Award, Star
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";

gsap.registerPlugin(ScrollTrigger);

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

function JourneyPinnedSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phasesRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const phases = phasesRef.current.filter((p): p is HTMLDivElement => p !== null);
      const totalPhases = phases.length;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=400%",
          pin: true,
          scrub: 0.5,
          snap: {
            snapTo: 1 / (totalPhases - 1),
            duration: { min: 0.15, max: 0.35 },
            ease: "power1.inOut",
          },
        },
      });

      phases.forEach((phase, i) => {
        if (i === 0) {
          gsap.set(phase, { opacity: 1, y: 0 });
        } else {
          gsap.set(phase, { opacity: 0, y: 30 });
          tl.to(
            phase,
            { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
            i * 0.25
          );
          tl.to(
            phases[i - 1],
            { opacity: 0, y: -20, duration: 0.25, ease: "power2.in" },
            i * 0.25
          );
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] overflow-hidden bg-cream rounded-[3rem]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-cream" />

      {/* Phase 1: Créer */}
      <div
        ref={(el) => { phasesRef.current[0] = el; }}
        className="absolute inset-0 flex items-center justify-center px-6"
      >
        <div className="mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <span className="absolute -top-12 -left-8 text-[12rem] font-black text-stone/30 leading-none select-none">01</span>
            <div className="relative z-10 space-y-6">
              <h2 className="text-5xl md:text-6xl font-black text-charcoal">Créez Votre Groupe.</h2>
              <p className="text-xl text-graphite font-medium max-w-md leading-relaxed">
                Configurez votre tontine en quelques clics. Choisissez le type (cash, nature, hybride), 
                définissez les règles, et invitez vos membres en toute simplicité.
              </p>
              <div className="flex flex-wrap gap-2">
                {['10 membres min.', 'Parrainage obligatoire', 'Règles custom', 'Audit transparent'].map((tag) => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-forest/10 text-forest rounded-full border border-forest/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-white rounded-3xl shadow-2xl border border-stone/50 p-8 w-full max-w-sm space-y-6">
              <p className="text-xs font-black uppercase tracking-widest text-ash">Configuration Active</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CreditCard, label: 'Argent', active: true, color: 'emerald' },
                  { icon: Wheat, label: 'Nature', active: false, color: 'amber' },
                  { icon: Wrench, label: 'Services', active: false, color: 'blue' },
                  { icon: Zap, label: 'Hybride', active: false, color: 'purple' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                      item.active ? 'bg-forest/5 border-forest' : 'bg-gray-50 border-transparent opacity-50'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${item.active ? 'text-forest' : 'text-ash'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tight ${item.active ? 'text-forest' : 'text-ash'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-ash uppercase">Montant</span><span className="text-sm font-black text-charcoal">25,000 FCFA</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-ash uppercase">Cycle</span><span className="text-sm font-black text-charcoal">Mensuel</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-ash uppercase">Membres</span><span className="text-sm font-black text-charcoal">15 Actifs</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2: Cotiser */}
      <div
        ref={(el) => { phasesRef.current[1] = el; }}
        className="absolute inset-0 flex items-center justify-center px-6 opacity-0"
      >
        <div className="mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <span className="absolute -top-12 -left-8 text-[12rem] font-black text-stone/30 leading-none select-none">02</span>
             <div className="relative z-10 space-y-6">
                <h2 className="text-5xl md:text-6xl font-black text-charcoal">Cotisez Librement.</h2>
                <p className="text-xl text-graphite font-medium max-w-md leading-relaxed">
                  Contribuez selon vos moyens et les règles du groupe. Mobile Money, 
                  produits en nature ou services — tout est tracé et validé.
                </p>
             </div>
          </div>
          <div className="flex justify-center">
             <div className="relative w-full max-w-sm space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 flex items-center gap-4 shadow-sm">
                   <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div className="flex-1">
                      <p className="text-lg font-black text-charcoal">25,000 FCFA</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">MoMo — Validé</p>
                   </div>
                   <CheckCircle className="w-6 h-6 text-emerald-600" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="bg-amber-50 rounded-2xl border border-amber-100 p-5 flex items-center gap-4 shadow-sm">
                   <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Wheat className="w-6 h-6 text-amber-600" />
                   </div>
                   <div className="flex-1">
                      <p className="text-lg font-black text-charcoal">1 Sac Maïs (50kg)</p>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Nature — Livré</p>
                   </div>
                   <Package className="w-6 h-6 text-amber-600" />
                </motion.div>
                <div className="text-center py-2 bg-stone/20 rounded-xl text-[10px] font-black text-ash uppercase tracking-widest">
                   Conversion : 1 Sac Maïs = 12,500 FCFA
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Phase 3: Distribuer */}
      <div
        ref={(el) => { phasesRef.current[2] = el; }}
        className="absolute inset-0 flex items-center justify-center px-6 opacity-0"
      >
        <div className="mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <span className="absolute -top-12 -left-8 text-[12rem] font-black text-stone/30 leading-none select-none">03</span>
             <div className="relative z-10 space-y-6">
                <h2 className="text-5xl md:text-6xl font-black text-charcoal">Distribuer avec Justice.</h2>
                <p className="text-xl text-graphite font-medium max-w-md leading-relaxed">
                   Tirage au sort transparent, calendrier automatisé et notifications en temps réel. 
                   Chaque membre reçoit sa part au moment convenu.
                </p>
             </div>
          </div>
          <div className="flex justify-center">
             <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone/50 p-8 w-full max-w-sm space-y-6">
                <div className="grid grid-cols-7 gap-1">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <span key={`${d}-${i}`} className="text-[10px] text-center text-ash font-black">{d}</span>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        i === 14 ? 'bg-forest text-white shadow-lg' : 'hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="bg-forest/5 rounded-2xl p-5 border-l-4 border-forest space-y-2">
                   <p className="text-[10px] font-black text-forest uppercase tracking-widest">Bénéficiaire du Mois</p>
                   <p className="text-xl font-black text-charcoal">Mariette B.</p>
                   <p className="text-sm font-bold text-forest">+ 150,000 FCFA</p>
                </div>
                <p className="text-[8px] font-mono text-ash/50 text-center uppercase tracking-tighter">Verified by Tchoua Engine (SHA-256)</p>
             </div>
          </div>
        </div>
      </div>

      {/* Phase 4: Grandir */}
      <div
        ref={(el) => { phasesRef.current[3] = el; }}
        className="absolute inset-0 flex items-center justify-center px-6 opacity-0"
      >
        <div className="mx-auto max-w-4xl w-full text-center space-y-12">
          <div className="space-y-4">
             <h2 className="text-5xl md:text-7xl font-black text-charcoal">Et l&apos;Histoire Continue.</h2>
             <p className="text-xl text-graphite font-medium max-w-2xl mx-auto leading-relaxed">
                Une fois le cycle terminé, l&apos;écosystème s&apos;étend. Prêts internes, épargne, 
                investissements et projets communautaires — votre groupe grandit ensemble.
             </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Landmark, label: 'Banque Commune' },
              { icon: PiggyBank, label: 'Épargne' },
              { icon: Heart, label: 'Solidarité' },
              { icon: ShoppingCart, label: 'Commerce' },
              { icon: Award, label: 'Succès' },
              { icon: GraduationCap, label: 'Formation' },
            ].map((node) => (
              <div key={node.label} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-3xl bg-forest text-white flex items-center justify-center shadow-xl shadow-forest/20 animate-bounce" style={{ animationDelay: `${Math.random() * 2}s` }}>
                  <node.icon className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black text-charcoal uppercase tracking-widest">{node.label}</span>
              </div>
            ))}
          </div>
          <div className="pt-8">
            <Link href="/register" className="px-10 py-5 bg-[#0d3d28] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
               Créer ma première tontine
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faq = [
    {
      q: "Tchoua remplace-t-il la tontine traditionnelle ?",
      a: "Non, il l'amplifie. Nous numérisons la gestion pour plus de sécurité, mais le cœur humain (confiance, entraide) reste défini par votre groupe."
    },
    {
      q: "Comment fonctionne le tirage au sort ?",
      a: "Notre algorithme utilise un hash SHA-256 vérifiable collectivement. Aucun membre, ni même l'administrateur, ne peut manipuler les résultats."
    },
    {
      q: "Puis-je l'utiliser sans internet ?",
      a: "Oui ! Nous supportons le USSD (*123#) et les SMS pour permettre aux membres sans smartphone de participer activement."
    }
  ];

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest text-white text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-forest/20">
              Processus Digital
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
               De la Tradition à la <span className="text-forest">Transparence.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Découvrez comment Tchoua renforce votre tontine en la faisant passer 
              du carnet papier à un écosystème digital sécurisé.
            </p>
            <div className="pt-10 flex flex-col items-center gap-3">
               <div className="animate-bounce">
                  <ChevronDown className="w-6 h-6 text-gray-300" />
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faites défiler pour voir le parcours</span>
            </div>
          </motion.div>
        </section>

        {/* Journey Section */}
        <JourneyPinnedSection />

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900">Questions Fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-black text-gray-900">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-gray-500 font-medium leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/pattern-kente.svg)', backgroundSize: '200px' }} />
           <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-5xl font-black leading-tight">Prêt à digitaliser votre confiance ?</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="px-10 py-5 bg-forest text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                  Ouvrir un compte
                </Link>
                <Link href="/academie" className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                  En savoir plus
                </Link>
              </div>
           </div>
        </section>
      </div>
    </PublicLayout>
  );
}
