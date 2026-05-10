import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "FCFA"): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " " + currency;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-CM", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-CM", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getLevelInfo(level: string) {
  const levels: Record<string, { label: string; color: string; icon: string; minScore: number }> = {
    NOVICE: { label: "Novice", color: "text-amber-600", icon: "🌱", minScore: 0 },
    ACTIF: { label: "Actif", color: "text-gray-500", icon: "🌿", minScore: 100 },
    ENGAGE: { label: "Engagé", color: "text-yellow-500", icon: "🌳", minScore: 300 },
    LEADER: { label: "Leader", color: "text-cyan-400", icon: "🦁", minScore: 600 },
    LEGENDE: { label: "Légende", color: "text-yellow-400", icon: "👑", minScore: 1000 },
  };
  return levels[level] || levels.NOVICE;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    SUSPENDED: "bg-red-100 text-red-800",
    PAUSED: "bg-gray-100 text-gray-800",
    PAID: "bg-green-100 text-green-800",
    LATE: "bg-orange-100 text-orange-800",
    DEFAULTED: "bg-red-100 text-red-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    REPAID: "bg-blue-100 text-blue-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    CASH: "Espèces",
    MTN_MOMO: "MTN MoMo",
    ORANGE_MONEY: "Orange Money",
    WAVE: "Wave",
    BANK_TRANSFER: "Virement bancaire",
    EXPRESS_UNION: "Express Union",
    NATURE: "En nature",
    SERVICE: "Service",
  };
  return methods[method] || method;
}

export function getTontineTypeLabel(type: string): string {
  const types: Record<string, string> = {
    ROSCA: "ROSCA (Rotation Simple)",
    ASCA: "ASCA (Épargne & Crédit)",
    NATURE: "En Nature",
    SERVICE: "Services",
    SOLIDARITY: "Solidarité",
    CULTURAL: "Culturelle",
    HYBRID: "Hybride",
  };
  return types[type] || type;
}

export function getFrequencyLabel(freq: string): string {
  const freqs: Record<string, string> = {
    DAILY: "Quotidienne",
    WEEKLY: "Hebdomadaire",
    BIWEEKLY: "Bimensuelle",
    MONTHLY: "Mensuelle",
    QUARTERLY: "Trimestrielle",
    SEASONAL: "Saisonnière",
    ANNUAL: "Annuelle",
  };
  return freqs[freq] || freq;
}
