"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Star, Users, BookOpen, LayoutGrid, Sparkles } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "Tous", emoji: "🌍" },
  { value: "TONTINE", label: "Tontine", emoji: "🔄" },
  { value: "FAMILLE", label: "Famille", emoji: "👨‍👩‍👧‍👦" },
  { value: "COMMERCE", label: "Commerce", emoji: "🛒" },
  { value: "VILLAGE", label: "Village", emoji: "🏡" },
  { value: "PROJET", label: "Projet", emoji: "🏗️" },
  { value: "RELIGIEUX", label: "Religieux", emoji: "⛪" },
  { value: "EPARGNE", label: "Épargne", emoji: "💰" },
];

export default function TemplatesLibraryPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (debouncedSearch) params.set("q", debouncedSearch);

    fetch(`/api/templates?${params.toString()}`)
      .then(res => res.json())
      .then(data => { setTemplates(data.templates || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory, debouncedSearch]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
    ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1f14] to-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/40 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Bibliothèque de Modèles
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Créez votre association<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">en quelques minutes.</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg mb-8">
            Choisissez un modèle conçu par des experts, personnalisez-le, et lancez votre association sans partir de zéro.
          </p>

          {/* Search */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 max-w-lg backdrop-blur-sm">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un modèle (ex: famille, commerce, village...)"
              className="bg-transparent text-white placeholder-gray-500 flex-1 focus:outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.value
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-lg">Aucun modèle trouvé pour cette recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <Link
                key={tpl.id}
                href={`/templates/${tpl.id}`}
                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/40 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/20"
              >
                {/* Top colored band */}
                <div className="h-2 w-full" style={{ backgroundColor: tpl.color }} />

                <div className="p-6">
                  {/* Icon + Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{tpl.iconEmoji}</span>
                    <div className="flex gap-2">
                      {tpl.origin === "SYSTEM" && (
                        <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/20">
                          Système
                        </span>
                      )}
                      {tpl.origin === "COMMUNITY" && (
                        <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                          Communauté
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-green-300 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {tpl.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{tpl.activities.length} activité{tpl.activities.length > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{tpl.usageCount} utilisations</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {renderStars(tpl.rating)}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4">
                  <div className="w-full text-center bg-white/0 group-hover:bg-green-500/10 border border-white/10 group-hover:border-green-500/30 text-gray-400 group-hover:text-green-300 py-2 rounded-xl text-sm font-semibold transition-all">
                    Voir le modèle →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA from scratch */}
        <div className="mt-12 text-center border border-white/10 rounded-2xl p-8 bg-white/5">
          <h3 className="text-white font-bold text-xl mb-2">Vous n'avez pas trouvé votre modèle ?</h3>
          <p className="text-gray-400 text-sm mb-6">Créez votre association entièrement sur mesure, sans partir d'un modèle.</p>
          <Link
            href="/associations/new"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
          >
            Créer de zéro
          </Link>
        </div>

      </div>
    </div>
  );
}
