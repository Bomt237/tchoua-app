"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Building2, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  HelpCircle,
  Activity,
  History,
  Search,
  Bell,
  ArrowLeftRight,
  Wallet,
  ChevronRight,
  Landmark
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (status === "unauthenticated") {
        router.push("/login");
      } else if (status === "authenticated" && !user?.systemRoleId) {
        router.push("/403");
      }
    }
  }, [mounted, status, user, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-forest font-bold animate-pulse uppercase tracking-widest text-xs">Chargement de la console...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && !user?.systemRoleId) {
    return null; // Redirection en cours vers 403
  }

  const menuItems = [
    { name: "Tableau de Bord", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs Système", href: "/admin/users", icon: Users },
    { name: "Rôles & Permissions", href: "/admin/roles", icon: ShieldCheck },
    { name: "Modèles d'Associations", href: "/admin/templates", icon: FileText },
    { name: "Supervision des Assos", href: "/admin/associations", icon: Building2 },
    { name: "Supervision des Wallets", href: "/admin/wallets", icon: Wallet },
    { name: "Audit Financier Global", href: "/admin/finance", icon: Landmark },
    { name: "Journaux (Logs)", href: "/admin/audit", icon: History },
    { name: "Notifications Système", href: "/admin/notifications", icon: Bell },
    { name: "Paramètres Plateforme", href: "/admin/settings", icon: Settings },
    { name: "Paramètres Wallet", href: "/admin/settings/wallet", icon: Settings },
  ];

  // Breadcrumb logic
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { name, href };
  });

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 gradient-forest flex-col h-screen sticky top-0 border-r border-white/5">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cream shadow-lg shadow-black/20">
              <img src="/logo.png" alt="TCHOUA" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="text-white font-black text-xl tracking-tight">Tchoua</div>
              <div className="text-[10px] uppercase font-black tracking-widest text-gold">Admin Console</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-gold/10 text-gold border border-gold/20 shadow-sm" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-gold" : "group-hover:text-gold"}`} />
                <span className="font-bold text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Space Toggle Button */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50">
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/5 transition-all group border border-transparent hover:border-emerald-400/10"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black">Espace Membre</div>
              <div className="text-[10px] text-slate-500 font-bold">Gérer mes tontines</div>
            </div>
          </Link>
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-red-500/10 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400" />
            <span className="font-bold text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-slate-600 hover:text-slate-900 font-medium">Admin</Link>
              {breadcrumbs.slice(1).map((crumb, i) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <Link 
                    href={crumb.href} 
                    className={`font-bold ${i === breadcrumbs.length - 2 ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {crumb.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 border border-forest/10">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span className="text-[10px] font-black uppercase tracking-wider text-forest">Mode Administration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center flex-1 max-w-xs bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
              <Search className="w-4 h-4 text-slate-600 mr-2" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>

            <button className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>
            
            <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />
            
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-forest leading-none">{user?.name}</div>
                <div className="text-[10px] text-gold font-bold uppercase tracking-widest mt-1">{user?.systemRoleName ?? 'Super Admin'}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center font-black text-white shadow-sm text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-80 bg-[#0f172a] flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0d3d28] to-[#051f14] rounded-xl flex items-center justify-center shadow-lg shadow-[#0d3d28]/20">
                <img src="/logo.png" alt="TCHOUA" className="w-6 h-6 object-contain" />
              </div>
                <div className="text-white font-black text-lg">Tchoua Admin</div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-400"
              >
                <ArrowLeftRight className="w-5 h-5" />
                <span className="font-bold text-sm">Espace Membre</span>
              </Link>
            </div>

            <div className="p-6 border-t border-white/5">
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold text-sm">Déconnexion</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
