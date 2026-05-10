"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type Locale = "fr" | "en" | "es" | "de" | "ghomala" | "ewondo" | "douala" | "fulfulde";

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string; rtl?: boolean }[] = [
  { code: "fr",       label: "Français",   flag: "🇫🇷" },
  { code: "en",       label: "English",    flag: "🇬🇧" },
  { code: "es",       label: "Español",    flag: "🇪🇸" },
  { code: "de",       label: "Deutsch",    flag: "🇩🇪" },
  { code: "ghomala",  label: "Ghomala'",   flag: "🇨🇲" },
  { code: "ewondo",   label: "Ewondo",     flag: "🇨🇲" },
  { code: "douala",   label: "Douala",     flag: "🇨🇲" },
  { code: "fulfulde", label: "Fulfulde",   flag: "🇨🇲" },
];

export const DEFAULT_LOCALE: Locale = "fr";
const COOKIE_NAME = "tchoua_lang";

// ─── Context ─────────────────────────────────────────────────────────────────

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
});

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Reads a deeply nested key like "caisse.statuses.SUCCESS" from a dict object */
function getNestedValue(obj: any, key: string): string | undefined {
  const parts = key.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

/** Gets locale from cookie if exists */
function getStoredLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  const val = match[1] as Locale;
  return SUPPORTED_LOCALES.some(l => l.code === val) ? val : null;
}

/** Gets locale from browser Accept-Language header (best effort) */
function getSystemLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const lang = navigator.language?.split("-")[0]?.toLowerCase();
  const found = SUPPORTED_LOCALES.find(l => l.code === lang);
  return found ? found.code : DEFAULT_LOCALE;
}

// ─── Dynamic dictionary loader ────────────────────────────────────────────────

const dictionaries: Partial<Record<Locale, any>> = {};

async function loadDictionary(locale: Locale): Promise<any> {
  if (dictionaries[locale]) return dictionaries[locale];
  
  const dict = await import(`./locales/${locale}.json`).then(m => m.default || m);
  dictionaries[locale] = dict;
  return dict;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [dict, setDict] = useState<any>({});

  // Load initial locale from cookie or browser preferences
  useEffect(() => {
    const stored = getStoredLocale();
    const initial = stored ?? getSystemLocale();
    setLocaleState(initial);
    loadDictionary(initial).then(setDict);
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    const newDict = await loadDictionary(newLocale);
    setDict(newDict);
    setLocaleState(newLocale);
    // Persist in cookie (1 year)
    document.cookie = `${COOKIE_NAME}=${newLocale}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  /** Translation function with optional parameter interpolation */
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(dict, key);
    if (value === undefined) {
      // Fallback: return the last segment of the key
      return key.split(".").pop() ?? key;
    }
    if (!params) return value;
    // Replace {{param}} placeholders
    return value.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(params[k] ?? `{{${k}}}`));
  }, [dict]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTranslation() {
  return useContext(I18nContext);
}

/** Convenience alias */
export const useI18n = useTranslation;
