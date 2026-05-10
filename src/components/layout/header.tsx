"use client";

import { 
  Bell, Search, Menu, Building2, ShieldCheck, 
  ArrowLeftRight, LayoutDashboard, Check, ChevronDown,
  MessageSquare, UserCircle, LogOut, Settings, Wallet
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getInitials, getLevelInfo, cn } from "@/lib/utils";

interface Association {
  id: string;
  name: string;
  color: string;
}

interface HeaderProps {
  onMobileMenuOpen: () => void;
  title?: string;
}

export function Header({ onMobileMenuOpen, title }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const pathname = usePathname();
  const router = useRouter();
  const levelInfo = user?.level ? getLevelInfo(user.level) : null;

  const [associations, setAssociations] = useState<Association[]>([]);
  const [selectedAssoc, setSelectedAssoc] = useState<Association | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Détection de l'association courante dans l'URL
  const assocMatch = pathname.match(/^\/associations\/([^/]+)(?:\/|$)/);
  const currentAssocId = assocMatch?.[1];

  useEffect(() => {
    fetch("/api/associations")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.associations) {
          setAssociations(data.associations);
          if (currentAssocId) {
            const found = data.associations.find((a: any) => a.id === currentAssocId);
            if (found) setSelectedAssoc(found);
          }
        }
      })
      .catch(() => {});

    // Fetch Wallet Balance
    if (session) {
      fetch("/api/wallet")
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.wallet) {
            setWalletBalance(data.wallet.balance);
          }
        })
        .catch(() => {});
    }
  }, [currentAssocId, session]);

  const handleSelectAssoc = (assoc: Association | null) => {
    setSelectedAssoc(assoc);
    setIsSelectorOpen(false);
    if (assoc) {
      router.push(`/associations/${assoc.id}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md flex items-center px-4 sm:px-8 gap-4 flex-shrink-0 sticky top-0 z-[40] border-b border-[#e2ddd4]/50">
      
      {/* Mobile menu toggle */}
      <button 
        onClick={onMobileMenuOpen} 
        className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-500 hover:text-[#0d3d28] transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* ── ASSOCIATION SELECTOR (Central) ── */}
      <div className="flex-1 flex items-center justify-start md:justify-center relative">
        <button 
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all border",
            selectedAssoc 
              ? "bg-emerald-50 border-emerald-100 text-[#0d3d28]" 
              : "bg-[#f7f3eb] border-[#e2ddd4] text-gray-900"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
            selectedAssoc ? "" : "bg-white"
          )} style={{ background: selectedAssoc?.color }}>
            {selectedAssoc ? <Building2 className="w-4 h-4 text-white" /> : <LayoutDashboard className="w-4 h-4 text-[#e68a00]" />}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-50 leading-none mb-0.5">Espace Actuel</div>
            <div className="text-sm font-black truncate max-w-[150px] md:max-w-[200px]">
              {selectedAssoc ? selectedAssoc.name : "Toutes mes associations"}
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 opacity-30 transition-transform", isSelectorOpen && "rotate-180")} />
        </button>

        {/* Dropdown Selector */}
        {isSelectorOpen && (
          <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-50 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => handleSelectAssoc(null)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#e68a00]">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left font-black text-sm text-gray-900">Vue Globale</div>
              {!selectedAssoc && <Check className="w-4 h-4 text-emerald-500" />}
            </button>
            
            <div className="my-2 border-t border-gray-50" />
            
            <div className="max-h-60 overflow-y-auto space-y-1">
              {associations.map(assoc => (
                <button 
                  key={assoc.id}
                  onClick={() => handleSelectAssoc(assoc)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm" style={{ background: assoc.color }}>
                    {getInitials(assoc.name)}
                  </div>
                  <div className="flex-1 text-left font-black text-sm text-gray-900 truncate">{assoc.name}</div>
                  {selectedAssoc?.id === assoc.id && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>

            <div className="mt-2 border-t border-gray-50 pt-2">
              <Link 
                href="/associations/new"
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-[#e68a00] hover:bg-emerald-50 transition-colors font-black text-xs uppercase tracking-widest"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e68a00]/10 flex items-center justify-center">
                  <Menu className="w-4 h-4" />
                </div>
                Créer une association
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTIONS (Right) ── */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-[#f7f3eb] rounded-xl px-4 py-2 border border-[#e2ddd4] focus-within:ring-2 focus-within:ring-[#0d3d28]/10 transition-all w-48 lg:w-64">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent border-none outline-none text-sm w-full font-bold placeholder:text-gray-400"
          />
        </div>

        {/* Chat Button */}
        <Link href="/chat" className="p-3 rounded-2xl hover:bg-gray-50 transition-colors relative group">
          <MessageSquare className="w-5 h-5 text-gray-500 group-hover:text-[#0d3d28]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
        </Link>

        {/* Wallet Shortcut */}
        <Link href="/dashboard/wallet" className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100/50">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="hidden lg:block text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 leading-none mb-0.5">Wallet</div>
            <div className="text-sm font-black text-emerald-900 leading-none">
              {walletBalance !== null ? `${walletBalance.toLocaleString("fr-FR")} F` : "..."}
            </div>
          </div>
        </Link>

        {/* Notifications */}
        <button className="p-3 rounded-2xl hover:bg-gray-50 transition-colors relative group">
          <Bell className="w-5 h-5 text-gray-500 group-hover:text-[#0d3d28]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
        
        <div className="h-8 w-px bg-[#e2ddd4] mx-1 hidden sm:block" />

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1 rounded-2xl hover:bg-gray-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-[#0d3d28]/10 group-hover:scale-105 transition-transform"
              style={{ background: "#0d3d28" }}>
              {getInitials(user?.name || "U")}
            </div>
            <ChevronDown className={cn("w-4 h-4 opacity-30 transition-transform hidden lg:block", isUserMenuOpen && "rotate-180")} />
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="p-4 flex items-center gap-3 border-b border-gray-50 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#e68a00] flex items-center justify-center text-white font-black text-lg shadow-sm">
                  {getInitials(user?.name || "U")}
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">{user?.name}</div>
                  <div className="text-[10px] font-black text-[#e68a00] uppercase tracking-widest">{levelInfo?.label || "Membre"}</div>
                </div>
              </div>

              <Link href="/profil" className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors font-black text-sm text-gray-600">
                <UserCircle className="w-5 h-5 opacity-50" />
                Mon Profil
              </Link>
              
              <Link href="/parametres" className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors font-black text-sm text-gray-600">
                <Settings className="w-5 h-5 opacity-50" />
                Paramètres
              </Link>

              {user?.systemRoleId && (
                <Link href="/admin" className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-black text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  Console Admin
                  <ArrowLeftRight className="w-3 h-3 ml-auto opacity-50" />
                </Link>
              )}

              <div className="my-2 border-t border-gray-50" />

              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-black text-sm"
              >
                <LogOut className="w-5 h-5 opacity-50" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
