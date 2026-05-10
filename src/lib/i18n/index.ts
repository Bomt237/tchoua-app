export * from "./context";
export * from "./translations";

export const SUPPORTED_LOCALES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ghomala", label: "Ghomala'", flag: "🇨🇲" },
  { code: "ewondo", label: "Ewondo", flag: "🇨🇲" },
  { code: "douala", label: "Douala", flag: "🇨🇲" },
  { code: "fulfulde", label: "Fulfulde", flag: "🇨🇲" },
];

export type Locale = "fr" | "en" | "es" | "de" | "ghomala" | "ewondo" | "douala" | "fulfulde";
