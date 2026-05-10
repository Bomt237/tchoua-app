"use client";

import { useState } from "react";
import { Calendar, Clock, Sun, CalendarDays, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type FrequencyType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type MonthlyMode = "FIXED_DATE" | "RELATIVE" | "FORTNIGHT";
export type YearlyMode = "FIXED_DATE" | "RELATIVE_MONTH" | "SPECIFIC_MONTHS";

export interface FrequencyConfig {
  type: FrequencyType;
  interval: number;
  
  // Journalier / Hebdo
  daysOfWeek: number[]; // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  workingDaysOnly?: boolean;
  excludeHolidays?: boolean;
  
  // Mensuel
  monthlyMode?: MonthlyMode;
  fixedDate?: number; // 1-31
  relativePosition?: "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST";
  fortnight?: "FIRST" | "SECOND";
  
  // Annuel
  yearlyMode?: YearlyMode;
  months?: number[]; // 1-12
}

const DAYS = [
  { value: 1, label: "Lun", full: "Lundi" },
  { value: 2, label: "Mar", full: "Mardi" },
  { value: 3, label: "Mer", full: "Mercredi" },
  { value: 4, label: "Jeu", full: "Jeudi" },
  { value: 5, label: "Ven", full: "Vendredi" },
  { value: 6, label: "Sam", full: "Samedi" },
  { value: 0, label: "Dim", full: "Dimanche" },
];

const MONTHS = [
  { value: 1, label: "Jan" }, { value: 2, label: "Fév" }, { value: 3, label: "Mar" },
  { value: 4, label: "Avr" }, { value: 5, label: "Mai" }, { value: 6, label: "Juin" },
  { value: 7, label: "Juil" }, { value: 8, label: "Aoû" }, { value: 9, label: "Sep" },
  { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Déc" },
];

interface FrequencyConfiguratorProps {
  value?: FrequencyConfig;
  onChange?: (config: FrequencyConfig) => void;
}

export function FrequencyConfigurator({ value, onChange }: FrequencyConfiguratorProps) {
  const [config, setConfig] = useState<FrequencyConfig>(value || {
    type: "MONTHLY",
    interval: 1,
    daysOfWeek: [6], // Samedi par défaut
    monthlyMode: "RELATIVE",
    relativePosition: "FIRST",
    fixedDate: 5,
  });

  const updateConfig = (updates: Partial<FrequencyConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  const toggleDay = (day: number) => {
    const newDays = config.daysOfWeek.includes(day)
      ? config.daysOfWeek.filter((d) => d !== day)
      : [...config.daysOfWeek, day];
    updateConfig({ daysOfWeek: newDays });
  };

  const toggleMonth = (month: number) => {
    const currentMonths = config.months || [];
    const newMonths = currentMonths.includes(month)
      ? currentMonths.filter((m) => m !== month)
      : [...currentMonths, month];
    updateConfig({ months: newMonths });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-[#0d3d28]" />
          Planification des Sessions
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Configurez la fréquence exacte à laquelle cette activité se tiendra.
        </p>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "DAILY", label: "Journalière", icon: Sun },
          { id: "WEEKLY", label: "Hebdomadaire", icon: Clock },
          { id: "MONTHLY", label: "Mensuelle", icon: Calendar },
          { id: "YEARLY", label: "Annuelle", icon: RefreshCw },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => updateConfig({ type: type.id as FrequencyType, interval: 1 })}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
              config.type === type.id
                ? "border-[#0d3d28] bg-[#0d3d28]/5 text-[#0d3d28]"
                : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100"
            )}
          >
            <type.icon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Options Dynamiques */}
      <div className="space-y-6 pt-4 border-t border-gray-100">
        
        {/* INTERVALLE COMMUN (Sauf Journalier) */}
        {config.type !== "DAILY" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalle
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">Toutes les</span>
              <input
                type="number"
                min={1}
                value={config.interval}
                onChange={(e) => updateConfig({ interval: Number(e.target.value) || 1 })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3d28] focus:border-[#0d3d28] text-center"
              />
              <span className="text-gray-500 text-sm">
                {config.type === "WEEKLY" ? "semaines" : config.type === "MONTHLY" ? "mois" : "années"}
              </span>
            </div>
          </div>
        )}

        {/* --- JOURNALIÈRE --- */}
        {config.type === "DAILY" && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.workingDaysOnly || false}
                  onChange={(e) => updateConfig({ workingDaysOnly: e.target.checked })}
                  className="rounded text-[#0d3d28] focus:ring-[#0d3d28]"
                />
                Jours ouvrés uniquement (Lundi au Vendredi)
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.excludeHolidays || false}
                  onChange={(e) => updateConfig({ excludeHolidays: e.target.checked })}
                  className="rounded text-[#0d3d28] focus:ring-[#0d3d28]"
                />
                Exclure les jours fériés
              </label>
            </div>
          </div>
        )}

        {/* --- HEBDOMADAIRE --- */}
        {config.type === "WEEKLY" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jours de la semaine
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                    config.daysOfWeek.includes(day.value)
                      ? "bg-[#0d3d28] text-white border-[#0d3d28]"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {day.full}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- MENSUELLE --- */}
        {config.type === "MONTHLY" && (
          <div className="space-y-5">
            <label className="block text-sm font-medium text-gray-700">Mode de calcul</label>
            <div className="flex gap-4">
              {[
                { id: "FIXED_DATE", label: "Date fixe" },
                { id: "RELATIVE", label: "Position (ex: 1er Samedi)" },
                { id: "FORTNIGHT", label: "Par quinzaine" },
              ].map((mode) => (
                <label key={mode.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="monthlyMode"
                    checked={config.monthlyMode === mode.id}
                    onChange={() => updateConfig({ monthlyMode: mode.id as MonthlyMode })}
                    className="text-[#0d3d28] focus:ring-[#0d3d28]"
                  />
                  {mode.label}
                </label>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              {config.monthlyMode === "FIXED_DATE" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Le</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={config.fixedDate || 1}
                    onChange={(e) => updateConfig({ fixedDate: Number(e.target.value) })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                  <span className="text-sm text-gray-600">de chaque mois</span>
                </div>
              )}

              {config.monthlyMode === "RELATIVE" && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">Le</span>
                  <select
                    value={config.relativePosition || "FIRST"}
                    onChange={(e) => updateConfig({ relativePosition: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="FIRST">Premier (1er)</option>
                    <option value="SECOND">Deuxième (2ème)</option>
                    <option value="THIRD">Troisième (3ème)</option>
                    <option value="FOURTH">Quatrième (4ème)</option>
                    <option value="LAST">Dernier</option>
                  </select>
                  <select
                    value={config.daysOfWeek[0] || 1}
                    onChange={(e) => updateConfig({ daysOfWeek: [Number(e.target.value)] })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.full}</option>)}
                  </select>
                  <span className="text-sm text-gray-600">du mois</span>
                </div>
              )}

              {config.monthlyMode === "FORTNIGHT" && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">Le</span>
                  <select
                    value={config.daysOfWeek[0] || 1}
                    onChange={(e) => updateConfig({ daysOfWeek: [Number(e.target.value)] })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.full}</option>)}
                  </select>
                  <span className="text-sm text-gray-600">de la</span>
                  <select
                    value={config.fortnight || "FIRST"}
                    onChange={(e) => updateConfig({ fortnight: e.target.value as "FIRST" | "SECOND" })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="FIRST">1ère quinzaine (1-15)</option>
                    <option value="SECOND">2ème quinzaine (16-fin)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ANNUELLE --- */}
        {config.type === "YEARLY" && (
          <div className="space-y-5">
            <label className="block text-sm font-medium text-gray-700">Mode de calcul</label>
            <div className="flex gap-4 flex-wrap">
              {[
                { id: "FIXED_DATE", label: "Date fixe" },
                { id: "RELATIVE_MONTH", label: "Position dans un mois" },
                { id: "SPECIFIC_MONTHS", label: "Mois spécifiques (Trimestriel/Semestriel)" },
              ].map((mode) => (
                <label key={mode.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="yearlyMode"
                    checked={config.yearlyMode === mode.id}
                    onChange={() => updateConfig({ yearlyMode: mode.id as YearlyMode })}
                    className="text-[#0d3d28] focus:ring-[#0d3d28]"
                  />
                  {mode.label}
                </label>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              {config.yearlyMode === "FIXED_DATE" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Le</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={config.fixedDate || 1}
                    onChange={(e) => updateConfig({ fixedDate: Number(e.target.value) })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                  <select
                    value={config.months?.[0] || 1}
                    onChange={(e) => updateConfig({ months: [Number(e.target.value)] })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              )}

              {config.yearlyMode === "RELATIVE_MONTH" && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">Le</span>
                  <select
                    value={config.relativePosition || "FIRST"}
                    onChange={(e) => updateConfig({ relativePosition: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="FIRST">1er</option>
                    <option value="SECOND">2ème</option>
                    <option value="THIRD">3ème</option>
                    <option value="FOURTH">4ème</option>
                    <option value="LAST">Dernier</option>
                  </select>
                  <select
                    value={config.daysOfWeek[0] || 1}
                    onChange={(e) => updateConfig({ daysOfWeek: [Number(e.target.value)] })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.full}</option>)}
                  </select>
                  <span className="text-sm text-gray-600">de</span>
                  <select
                    value={config.months?.[0] || 1}
                    onChange={(e) => updateConfig({ months: [Number(e.target.value)] })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              )}

              {config.yearlyMode === "SPECIFIC_MONTHS" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">1. Sélectionnez les mois :</label>
                    <div className="flex flex-wrap gap-2">
                      {MONTHS.map((month) => (
                        <button
                          key={month.value}
                          type="button"
                          onClick={() => toggleMonth(month.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                            (config.months || []).includes(month.value)
                              ? "bg-[#0d3d28] text-white border-[#0d3d28]"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {month.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm text-gray-700 mb-2">2. Règle applicable pour ces mois :</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Le</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={config.fixedDate || 1}
                        onChange={(e) => updateConfig({ fixedDate: Number(e.target.value) })}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                      />
                      <span className="text-sm text-gray-600">des mois sélectionnés</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}