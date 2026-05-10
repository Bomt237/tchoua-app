"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Settings, 
  ChevronRight, 
  Layout, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  AlertCircle,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  usageCount: number;
  status: string;
  createdAt: string;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (err) {
      setError("Erreur lors du chargement des modèles");
    } finally {
      setLoading(false);
    }
  };

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Modèles d&apos;Associations</h1>
          <p className="text-gray-500 mt-1 font-medium">Configurez les structures types pour les nouvelles associations</p>
        </div>
        <Button 
          className="px-8"
        >
          <Plus className="w-5 h-5" />
          Nouveau Modèle
        </Button>
      </div>

      {/* Categories / Filters */}
      <div className="flex flex-wrap gap-3">
        {["Tous", "Tontine", "MFI", "Social", "Culturel", "Sportif"].map(cat => (
          <Button 
            key={cat}
            variant={cat === "Tous" ? "default" : "outline"}
            size="sm"
            className="px-8"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-gray-400">Chargement des modèles...</p>
        </div>
      ) : error ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4 text-red-500">
          <AlertCircle className="w-10 h-10" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layout className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    template.status === "PUBLISHED" ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {template.status}
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6">{template.description}</p>
                
                <div className="flex items-center justify-between py-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-black text-gray-900">{template.usageCount} Utilisations</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{template.category}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="h-10">
                    <Eye className="w-4 h-4" />
                    Aperçu
                  </Button>
                  <Button size="sm" className="h-10">
                    <Settings className="w-4 h-4" />
                    Configurer
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* New Template Card */}
          <button className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center p-12 hover:border-blue-600/20 hover:bg-blue-50/10 transition-all group">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-gray-300 group-hover:text-blue-600" />
            </div>
            <span className="text-sm font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">Créer un nouveau modèle</span>
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <FileText className="w-64 h-64 -mr-20 -mt-20" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-4">Standardisation & Scalabilité</h2>
          <p className="text-slate-400 font-medium leading-relaxed">
            Les modèles permettent aux utilisateurs de lancer leur association en moins de 2 minutes. 
            Chaque modèle définit les activités par défaut (Tontine, Caisse de secours), les rôles du bureau et les règlements types.
          </p>
          <div className="mt-8 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-black uppercase tracking-widest">Automatisation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest">Expertise métier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
