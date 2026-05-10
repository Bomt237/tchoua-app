"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { Globe, Check, ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
  compact?: boolean;
}

export function LanguageSwitcher({ variant = "light", compact = false }: LanguageSwitcherProps) {
  const { lang, setLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === lang) ?? SUPPORTED_LOCALES[0];

  // International locales (ISO)
  const intlLocales = SUPPORTED_LOCALES.filter(l => ["fr", "en", "es", "de"].includes(l.code));
  // Local Cameroonian languages
  const localLocales = SUPPORTED_LOCALES.filter(l => !["fr", "en", "es", "de"].includes(l.code));

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (code: Locale) => {
    setLang(code);
    setIsOpen(false);
  };

  const isDark = variant === "dark";

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isDark
            ? "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
        }`}
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        {!compact && (
          <>
            <span>{currentLocale.flag}</span>
            <span className="hidden sm:inline">{currentLocale.label}</span>
          </>
        )}
        {compact && <span>{currentLocale.flag}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-xl border overflow-hidden ${
          isDark
            ? "bg-slate-900 border-white/10"
            : "bg-white border-gray-200"
        }`}>
          {/* International */}
          <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            International
          </div>
          {intlLocales.map(l => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code as Locale)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                isDark
                  ? "text-gray-300 hover:bg-white/5 hover:text-white"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-lg">{l.flag}</span>
                <span className="font-medium">{l.label}</span>
              </span>
              {lang === l.code && <Check className="w-4 h-4 text-green-500" />}
            </button>
          ))}

          {/* Local languages */}
          <div className={`px-3 pt-3 pb-2 text-xs font-bold uppercase tracking-wider border-t ${
            isDark ? "text-gray-500 border-white/10" : "text-gray-400 border-gray-100"
          }`}>
            🇨🇲 Langues locales
          </div>
          {localLocales.map(l => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code as Locale)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                isDark
                  ? "text-gray-300 hover:bg-white/5 hover:text-white"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-lg">{l.flag}</span>
                <span className="font-medium">{l.label}</span>
              </span>
              {lang === l.code && <Check className="w-4 h-4 text-green-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
