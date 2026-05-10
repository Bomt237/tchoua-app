"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Pencil, Plus, Trash2 } from "lucide-react";

export default function UseTemplatePage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 3 form state
  const [assocName, setAssocName] = useState("");
  const [assocType, setAssocType] = useState("TONTINE_CLUB");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/templates/${templateId}`)
      .then(res => res.json())
      .then(data => {
        if (data.template) {
          setTemplate(data.template);
          setAssocName(`${data.template.name} — Ma version`);
          // Pre-populate activities from template (only enabled ones by default)
          setActivities(
            data.template.activities
              .filter((a: any) => a.isDefaultEnabled)
              .map((a: any) => ({
                ...a,
                enabled: true,
                modified: false,
              }))
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [templateId]);

  const toggleActivity = (idx: number) => {
    setActivities(prev => prev.map((a, i) => i === idx ? { ...a, enabled: !a.enabled } : a));
  };

  const updateActivity = (idx: number, field: string, value: any) => {
    setActivities(prev => prev.map((a, i) =>
      i === idx ? { ...a, [field]: value, modified: true } : a
    ));
  };

  const handleCreate = async () => {
    if (!assocName.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/associations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: assocName,
          type: assocType,
          description,
          region,
          templateId,
          activities: activities.filter(a => a.enabled).map(a => ({
            name: a.name,
            type: a.type,
            participation: a.participation,
            contributionAmount: a.contributionAmount,
            contributionFrequency: a.contributionFrequency,
            distributionMode: a.distributionMode,
            sortOrder: a.sortOrder,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.association?.id) {
        router.push(`/associations/${data.association.id}?welcome=1`);
      } else {
        alert(data.error || "Erreur lors de la création");
      }
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1f14] to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-4">
          <Link href={`/templates/${templateId}`} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition">
            <ArrowLeft className="w-4 h-4" /> Retour au modèle
          </Link>
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-400">
              Personnalisation de : <span className="text-white font-semibold">{template?.name}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        {/* Section 1: Association name & basics */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">1</span>
            Informations de base
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nom de votre association *</label>
              <input
                type="text"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={assocName}
                onChange={e => setAssocName(e.target.value)}
                placeholder="Ex: Tontine des Amis du Quartier Bali"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Type d'association</label>
              <select
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                value={assocType}
                onChange={e => setAssocType(e.target.value)}
              >
                <option value="TONTINE_CLUB">Tontine / Club</option>
                <option value="COOPERATIVE">Coopérative</option>
                <option value="SOLIDARITY">Association Solidarité</option>
                <option value="INVESTMENT">Groupe Investissement</option>
                <option value="AGRICULTURAL">Agricole</option>
                <option value="MUTUAL">Mutuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Région / Ville</label>
              <input
                type="text"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="Ex: Douala, Yaoundé..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Description (optionnel)</label>
              <textarea
                rows={2}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez votre association en quelques mots..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Activities */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">2</span>
            Activités incluses
          </h2>
          <p className="text-sm text-gray-400 mb-5">Activez/désactivez les activités et ajustez leurs paramètres. Les éléments <span className="text-amber-400 font-semibold">modifiés</span> sont mis en évidence.</p>

          <div className="space-y-4">
            {activities.map((act, idx) => (
              <div
                key={act.id || idx}
                className={`rounded-xl border transition-all ${act.enabled
                  ? act.modified
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-white/10 bg-white/5"
                  : "border-white/5 bg-white/2 opacity-50"
                }`}
              >
                {/* Activity header */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleActivity(idx)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${act.enabled ? "border-green-500 bg-green-500" : "border-gray-600 bg-transparent"}`}
                  >
                    {act.enabled && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{act.name}</div>
                    <div className="text-xs text-gray-400">{act.participation} · {act.type}</div>
                  </div>
                  {act.modified && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Modifié</span>
                  )}
                </div>

                {/* Activity params (only if enabled) */}
                {act.enabled && (
                  <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-white/10 pt-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Montant (FCFA)</label>
                      <input
                        type="number"
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                        value={act.contributionAmount || ""}
                        onChange={e => updateActivity(idx, "contributionAmount", Number(e.target.value))}
                        placeholder="Montant"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fréquence</label>
                      <select
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                        value={act.contributionFrequency}
                        onChange={e => updateActivity(idx, "contributionFrequency", e.target.value)}
                      >
                        <option value="WEEKLY">Hebdomadaire</option>
                        <option value="MONTHLY">Mensuelle</option>
                        <option value="QUARTERLY">Trimestrielle</option>
                        <option value="PER_SESSION">Par session</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Obligation</label>
                      <select
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                        value={act.participation}
                        onChange={e => updateActivity(idx, "participation", e.target.value)}
                      >
                        <option value="MANDATORY">Obligatoire</option>
                        <option value="OPTIONAL">Optionnelle</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create button */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <button
            onClick={handleCreate}
            disabled={submitting || !assocName.trim()}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-bold px-10 py-4 rounded-2xl text-base transition shadow-xl shadow-green-500/20"
          >
            {submitting ? "Création en cours..." : "Créer mon association"}
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-500 text-sm">
            {activities.filter(a => a.enabled).length} activité{activities.filter(a => a.enabled).length > 1 ? "s" : ""} sélectionnée{activities.filter(a => a.enabled).length > 1 ? "s" : ""}
          </p>
        </div>

      </div>
    </div>
  );
}
