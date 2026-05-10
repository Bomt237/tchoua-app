"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Save, ShieldCheck, Globe, Mail, 
  Lock, Zap, Database, RefreshCw, CheckCircle2,
  AlertCircle, DollarSign, ToggleLeft, ToggleRight,
  Layout, Eye, Cloud, Trash2, Sliders
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setToast({ message: "Paramètres enregistrés", type: "success" });
      } else {
        setToast({ message: "Erreur lors de l'enregistrement", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Erreur serveur", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const toggle = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-4 px-8 py-4 rounded-[2rem] shadow-2xl text-sm font-black transition-all animate-in slide-in-from-right border border-current/10 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Paramètres Plateforme</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Configurez le comportement global, la sécurité et l&apos;identité de TCHOUA.</p>
        </div>
        
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 text-white text-sm font-black shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Sauvegarde..." : "Enregistrer les Changements"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Navigation Tabs (Simulation) */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'general', label: 'Général', icon: Globe, active: true },
            { id: 'security', label: 'Sécurité & Accès', icon: Lock, active: false },
            { id: 'billing', label: 'Finances & Frais', icon: DollarSign, active: false },
            { id: 'system', label: 'Maintenance & Logs', icon: Database, active: false },
            { id: 'api', label: 'API & Intégrations', icon: Zap, active: false },
          ].map((tab, i) => (
            <button 
              key={i}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-3xl text-sm font-black transition-all ${
                tab.active 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                  : "bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 border border-gray-100"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.active && <Sliders className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
          
          <div className="mt-8 p-6 rounded-[2.5rem] bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Zone de Danger</span>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-red-600 text-xs font-black shadow-sm border border-red-100 hover:bg-red-50 transition-all">
              <Trash2 className="w-4 h-4" />
              Vider le Cache Système
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identity */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Layout className="w-6 h-6 text-blue-600" />
              Identité du Site
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Nom de la Plateforme</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={e => setSettings((s: any) => ({ ...s, siteName: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:bg-white focus:border-blue-600/20 transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Email Support</label>
                <input 
                  type="email" 
                  value={settings.supportEmail}
                  onChange={e => setSettings((s: any) => ({ ...s, supportEmail: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:bg-white focus:border-blue-600/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Business Rules */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Sliders className="w-6 h-6 text-emerald-600" />
              Règles Métier &amp; Limites
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Taux de Commission (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={settings.commissionRate}
                    onChange={e => setSettings((s: any) => ({ ...s, commissionRate: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:bg-white focus:border-emerald-600/20 transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-600 font-black">%</div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Devise par défaut</label>
                <select 
                  value={settings.defaultCurrency}
                  onChange={e => setSettings((s: any) => ({ ...s, defaultCurrency: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:bg-white focus:border-emerald-600/20 transition-all appearance-none"
                >
                  <option value="FCFA">FCFA (XAF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar (USD)</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { id: 'kycRequired', label: 'Vérification KYC obligatoire', icon: ShieldCheck, color: 'text-blue-500' },
                { id: 'allowRegistration', label: 'Autoriser les nouvelles inscriptions', icon: Zap, color: 'text-amber-500' },
                { id: 'maintenanceMode', label: 'Mode Maintenance (Public)', icon: AlertCircle, color: 'text-red-500' },
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${opt.color} shadow-sm`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{opt.label}</span>
                  </div>
                  <button onClick={() => toggle(opt.id)} className="transition-transform active:scale-90">
                    {settings[opt.id] 
                      ? <ToggleRight className="w-12 h-12 text-blue-600" /> 
                      : <ToggleLeft className="w-12 h-12 text-gray-300" />
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Server Info */}
          <div className="p-8 rounded-[3rem] bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Cloud className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Infrastructure</div>
                <div className="text-lg font-black tracking-tight">Cloud Instance : Tchoua-SRV-01</div>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-emerald-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Service Actif (Uptime 99.9%)
                </div>
              </div>
            </div>
            
            <div className="hidden sm:block text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Version Logicielle</div>
              <div className="text-xl font-black opacity-50">v2.4.0-stable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
