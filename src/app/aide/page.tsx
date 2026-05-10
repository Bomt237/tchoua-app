"use client";

import { useState } from "react";
import { AdaptiveLayout } from "@/components/layout/adaptive-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { HelpCircle, Search, MessageCircle, Mail, Book, Video, ChevronRight } from "lucide-react";

const topics = [
  { id: "premiers-pas", icon: "🚀", title: "Premiers pas", desc: "Créer son compte, rejoindre une tontine, première cotisation" },
  { id: "tontines", icon: "🔄", title: "Tontines & Sessions", desc: "Comprendre les types, le tirage, les enchères et la rotation" },
  { id: "cotisations", icon: "💰", title: "Cotisations & Paiements", desc: "Mobile Money, virement, espèces, calendriers de paiement" },
  { id: "prets", icon: "🤝", title: "Prêts & Caisse", desc: "Demander un prêt, les taux, les garanties, le remboursement" },
  { id: "scoring", icon: "🏆", title: "Score de Confiance", desc: "Comment le score est calculé, niveaux, badges, contestation" },
  { id: "associations", icon: "🏛️", title: "Associations", desc: "Wizard de création, modèles A30/AMSED, bureau, règlement" },
  { id: "reunions", icon: "📅", title: "Réunions & Présence", desc: "Planning, quorum, procurations, amendes de retard" },
  { id: "aides", icon: "❤️", title: "Aides Sociales", desc: "Catégories AMSED, plafonds, justificatifs, vote du bureau" },
  { id: "securite", icon: "🔒", title: "Sécurité & Confidentialité", desc: "Authentification, données personnelles, RGPD" },
];

const faqs = [
  { q: "Comment rejoindre une tontine existante ?", a: "Demandez le code d'invitation au président. Allez dans \"Mes Associations\" → \"Rejoindre\" et entrez le code. Votre adhésion sera validée par le bureau." },
  { q: "Comment payer ma cotisation par Mobile Money ?", a: "Sur la page Cotisations, cliquez \"Payer\". Choisissez Mobile Money. Composez *126# ou utilisez le bouton de paiement automatique. Le reçu est généré automatiquement." },
  { q: "Que se passe-t-il si je manque une session ?", a: "Une amende fixe configurée par le règlement intérieur s'applique. Vous pouvez l'éviter en envoyant une procuration ou en présentant un justificatif validé par le bureau." },
  { q: "Mon score de confiance a baissé, pourquoi ?", a: "Les baisses sont toujours détaillées dans l'historique du score (page Gamification). Les causes habituelles : retard de cotisation, absence non excusée, prêt non remboursé. Vous pouvez contester via le formulaire dédié." },
  { q: "Puis-je créer plusieurs associations ?", a: "Oui, il n'y a pas de limite. Chaque association est indépendante avec son propre bureau, ses activités, son scoring." },
];

export default function AidePage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = topics.filter((tp) => tp.title.toLowerCase().includes(search.toLowerCase()) || tp.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdaptiveLayout title={t.nav.aide ?? "Aide"}>
      <div className="space-y-8">
        {/* Search hero */}
        <div className="rounded-3xl p-8 text-white text-center" style={{ background: "linear-gradient(135deg,#0d3d28 0%,#0a2f1f 100%)" }}>
          <HelpCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#e68a00" }} />
          <h1 className="text-3xl font-bold mb-2">Comment pouvons-nous vous aider ?</h1>
          <p className="opacity-70 mb-6">Centre d'aide, FAQ et assistance contextuelle</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans l'aide…"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Topics grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sujets populaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((tp) => (
              <Card key={tp.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{tp.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{tp.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{tp.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <Card key={i}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-5 flex items-center justify-between gap-4">
                  <span className="font-medium text-gray-900">{f.q}</span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 -mt-2">{f.a}</div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Besoin de plus d'aide ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 text-center">
                <Book className="w-8 h-8 mx-auto mb-2" style={{ color: "#0d3d28" }} />
                <div className="font-semibold text-gray-900">Académie</div>
                <div className="text-sm text-gray-500 mt-1">Manuel utilisateur complet</div>
                <a href="/academie" className="text-sm font-medium mt-2 inline-block" style={{ color: "#e68a00" }}>Consulter →</a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#0d3d28" }} />
                <div className="font-semibold text-gray-900">Chat communautaire</div>
                <div className="text-sm text-gray-500 mt-1">Posez la question à votre groupe</div>
                <a href="/chat" className="text-sm font-medium mt-2 inline-block" style={{ color: "#e68a00" }}>Ouvrir →</a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <Mail className="w-8 h-8 mx-auto mb-2" style={{ color: "#0d3d28" }} />
                <div className="font-semibold text-gray-900">Support email</div>
                <div className="text-sm text-gray-500 mt-1">support@tchoua.app</div>
                <a href="mailto:support@tchoua.app" className="text-sm font-medium mt-2 inline-block" style={{ color: "#e68a00" }}>Contacter →</a>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AdaptiveLayout>
  );
}
