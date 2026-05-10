"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import {
  LayoutDashboard, Users, PiggyBank, RotateCcw, Landmark,
  Heart, BarChart3, Settings, LogOut, ChevronLeft, ChevronDown,
  MessageCircle, Calendar, Bot, Globe, FileText,
  Building2, UserCircle, ArrowLeftRight, Check, ShieldCheck, Plus,
  ShoppingBag, PartyPopper, Trophy, GraduationCap, Coins
} from "lucide-react";

// ─── Structure du menu Membre (15 Modules complets) ─────────────────────────
const MEMBER_NAV = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Tableau de Bord" },
  { href: "/tontines",               icon: PiggyBank,       label: "Mes Tontines" },
  { href: "/epargne",                icon: Landmark,        label: "Épargne & Invest." },
  { href: "/prets",                  icon: Coins,           label: "Prêts & Crédit" },
  { href: "/solidarite",             icon: Heart,           label: "Solidarité" },
  { href: "/sessions",               icon: RotateCcw,       label: "Sessions & Tirages" },
  { href: "/dashboard/calendrier",   icon: Calendar,        label: "Calendrier" },
  { href: "/membres",                icon: Users,           label: "Membres" },
  { href: "/marketplace",            icon: ShoppingBag,     label: "Marketplace" },
  { href: "/evenements",             icon: PartyPopper,     label: "Événements" },
  { href: "/chat",                   icon: MessageCircle,   label: "Chat de Groupe" },
  { href: "/conseils",               icon: Bot,             label: "Conseils IA" },
  { href: "/rapports",               icon: BarChart3,       label: "Rapports" },
  { href: "/dashboard/gamification", icon: Trophy,          label: "Gamification" },
  { href: "/academie",               icon: GraduationCap,   label: "Académie" },
  { href: "/profil",                 icon: UserCircle,      label: "Mon Profil" },
];

type MyAssociation = { id: string; name: string; color?: string; myRole?: string };

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user?: { name?: string | null; email?: string | null; score?: number; level?: string; systemRoleId?: string | null; systemRoleName?: string | null };
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, availableLangs } = useI18n();

  const [myAssocs, setMyAssocs] = useState<MyAssociation[]>([]);
  const [selectedAssoc, setSelectedAssoc] = useState<MyAssociation | null>(null);
  const [assocDropOpen, setAssocDropOpen] = useState(false);

  const hasSystemRole = !!user?.systemRoleId;

  // Détection de l'association courante dans l'URL
  const assocMatch = pathname.match(/^\/associations\/([^/]+)(?:\/|$)/);
  const currentAssocId = assocMatch?.[1];

  useEffect(() => {
    fetch("/api/associations")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list: MyAssociation[] = (data?.associations ?? []).map((a: any) => ({
          id: a.id, name: a.name, color: a.color, myRole: a.myRole,
        }));
        setMyAssocs(list);
        if (currentAssocId) {
          const found = list.find(a => a.id === currentAssocId);
          if (found) setSelectedAssoc(found);
        }
      })
      .catch(() => {});
  }, [currentAssocId]);

  const handleSelectAssoc = (assoc: MyAssociation | null) => {
    setSelectedAssoc(assoc);
    setAssocDropOpen(false);
    if (assoc) {
      router.push(`/associations/${assoc.id}`);
    } else {
      router.push("/dashboard");
    }
  };

  // Navigation contextuelle association
  const assocNavItems = currentAssocId ? [
    { href: `/associations/${currentAssocId}`,              label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
    { href: `/associations/${currentAssocId}/activities?type=TONTINE`, label: "Tontines", icon: PiggyBank },
    { href: `/associations/${currentAssocId}/activities?type=SAVINGS`, label: "Épargne", icon: BarChart3 },
    { href: `/associations/${currentAssocId}/prets`,        label: "Prêts",          icon: Landmark },
    { href: `/associations/${currentAssocId}/aides`,        label: "Solidarité",     icon: Heart },
    { href: `/associations/${currentAssocId}/reunions`,     label: "Sessions",       icon: RotateCcw },
    { href: `/associations/${currentAssocId}/rapports`,     label: "Rapports",       icon: BarChart3 },
    { href: `/associations/${currentAssocId}?tab=members`,  label: "Membres",        icon: Users },
  ] : [];

  const inAssocContext = !!currentAssocId;

  return (
    <aside
      className={cn(
        "h-full flex flex-col transition-all duration-300 flex-shrink-0 relative",
        collapsed ? "w-16" : "w-64",
        "gradient-forest"
      )}
    >
      {/* ── Logo + Toggle ────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#f7f3eb]">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden flex-1">
            <div className="font-black text-white text-sm leading-none">Tchoua</div>
            <div className="text-[10px] font-black uppercase tracking-widest mt-0.5"
              style={{ color: "#E38513" }}>Espace Membre</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex-shrink-0 transition-colors ml-auto p-1 rounded-lg hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.8)" }}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* ── Sélecteur d'Association ─────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-3 py-3 relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setAssocDropOpen(!assocDropOpen)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
          >
            <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: "#E38513" }} />
            <span className="flex-1 text-left truncate">
              {selectedAssoc ? selectedAssoc.name : "Toutes mes associations"}
            </span>
            <ChevronDown className={cn("w-4 h-4 flex-shrink-0 transition-transform", assocDropOpen && "rotate-180")}
              style={{ color: "rgba(255,255,255,0.8)" }} />
          </button>

          {/* Dropdown */}
          {assocDropOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: "#0a2e1e", border: "1px solid rgba(255,255,255,0.1)" }}>
              {/* Option "Toutes" */}
              <button
                onClick={() => handleSelectAssoc(null)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/10 text-left"
                style={{ color: !selectedAssoc ? "white" : "rgba(255,255,255,0.9)" }}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">Toutes mes associations</span>
                {!selectedAssoc && <Check className="w-3 h-3 text-[#E38513]" />}
              </button>

              {myAssocs.length > 0 && (
                <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  {myAssocs.map(assoc => (
                    <button
                      key={assoc.id}
                      onClick={() => handleSelectAssoc(assoc)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/10 text-left"
                      style={{ color: selectedAssoc?.id === assoc.id ? "white" : "rgba(255,255,255,0.9)" }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: assoc.color || "#E38513" }} />
                      <span className="flex-1 truncate">{assoc.name}</span>
                      {selectedAssoc?.id === assoc.id && <Check className="w-3 h-3 text-[#E38513]" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Créer une association */}
              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <Link
                  href="/associations/new"
                  onClick={() => setAssocDropOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/10"
                  style={{ color: "#E38513" }}
                >
                  <Plus className="w-4 h-4" />
                  Créer une association
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicateur association sélectionnée (mode collapsed) */}
      {collapsed && selectedAssoc && (
        <div className="px-2 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-2 h-2 rounded-full mx-auto" style={{ background: selectedAssoc.color || "#E38513" }} />
        </div>
      )}

      {/* ── Navigation principale ──────────────────────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Bandeau retour en contexte association */}
        {inAssocContext && !collapsed && (
          <div className="px-3 mb-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
              style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)" }}
            >
              ← Toutes les associations
            </Link>
          </div>
        )}

        {/* Items de navigation */}
        {(inAssocContext ? assocNavItems : MEMBER_NAV.map(i => ({
          href: i.href,
          label: i.label,
          icon: i.icon,
          exact: i.href === "/dashboard",
        }))).map(({ href, label, icon: Icon, exact }) => {
          const cleanHref = href.split("?")[0];
          const active = exact
            ? pathname === cleanHref
            : pathname.startsWith(cleanHref) && cleanHref !== "/dashboard";

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm transition-all mb-0.5 group"
              )}
              style={
                active
                  ? { background: "rgba(212,163,67,0.15)", color: "white", borderLeft: "3px solid #E38513" }
                  : { color: "rgba(255,255,255,0.85)" }
              }
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors",
                active ? "text-[#E38513]" : "group-hover:text-white")} />
              {!collapsed && <span className="truncate font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Pied de sidebar ───────────────────────────────────────────── */}
      <div className="flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Bouton bascule Admin (seulement si systemRole présent) */}
        {hasSystemRole && (
          <Link
            href="/admin"
            title={collapsed ? "Console Admin" : undefined}
            className="flex items-center gap-3 px-4 py-3 transition-all group"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
              style={{ background: "rgba(59,130,246,0.2)" }}>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-black text-blue-400">Console Admin</div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {user?.systemRoleName ?? "Admin"}
                </div>
              </div>
            )}
            {!collapsed && <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400 opacity-60" />}
          </Link>
        )}

        {/* Profil utilisateur */}
        {!collapsed && user && (
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
              style={{ background: "#E38513" }}>
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px]" style={{ color: "#E38513" }}>
                {user.score ?? 0} pts · {user.level ?? "Novice"}
              </div>
            </div>
          </div>
        )}

        {/* Actions bas */}
        <div className="px-3 pb-3 space-y-0.5">
          {/* Langue */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg"
            style={{ color: "rgba(255,255,255,0.8)" }}>
            <Globe className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none cursor-pointer"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {availableLangs.map(l => (
                  <option key={l.code} value={l.code} style={{ background: "#0d3d28" }}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            )}
            {collapsed && <span className="text-[10px] font-black" style={{ color: "rgba(255,255,255,0.8)" }}>{lang.toUpperCase()}</span>}
          </div>

          <Link href="/profil"
            title={collapsed ? "Mon Profil" : undefined}
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all group"
            style={{ color: "rgba(255,255,255,0.8)" }}>
            <UserCircle className="w-4 h-4 flex-shrink-0 group-hover:text-white" />
            {!collapsed && <span className="group-hover:text-white transition-colors">Mon Profil</span>}
          </Link>

          <Link href="/parametres"
            title={collapsed ? "Paramètres" : undefined}
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all group"
            style={{ color: "rgba(255,255,255,0.8)" }}>
            <Settings className="w-4 h-4 flex-shrink-0 group-hover:text-white" />
            {!collapsed && <span className="group-hover:text-white transition-colors">Paramètres</span>}
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Déconnexion" : undefined}
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all w-full text-left group"
            style={{ color: "rgba(239,68,68,0.6)" }}>
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-400" />
            {!collapsed && <span className="group-hover:text-red-400 transition-colors">Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
