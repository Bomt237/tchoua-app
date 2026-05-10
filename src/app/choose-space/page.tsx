"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShieldCheck, ArrowRight } from "lucide-react";

export default function ChooseSpacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const user = session?.user as any;
  const hasSystemRole = !!user?.systemRoleId;
  const hasMembership = true; // On suppose membre par défaut — à affiner si API disponible

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      // Si utilisateur n'a PAS de rôle système → directement vers Espace Membre
      if (!hasSystemRole) {
        router.push("/dashboard");
        return;
      }
    }
  }, [mounted, status, hasSystemRole, router]);

  if (status === "loading" || !hasSystemRole) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f3eb" }}>
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
          <span className="text-sm font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#f7f3eb" }}>
      {/* Header */}
      <div className="mb-12 text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "#0d3d28" }}>
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="text-left">
            <div className="font-black text-2xl" style={{ color: "#0d3d28" }}>Tchoua</div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#e68a00" }}>Solidarité Digitale</div>
          </div>
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Bonjour, {user?.name?.split(" ")[0] ?? "Utilisateur"} 👋
        </h1>
        <p className="text-gray-500 max-w-sm">
          Vous avez accès à deux espaces distincts. Dans lequel souhaitez-vous commencer ?
        </p>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">

        {/* Espace Membre */}
        <Link
          href="/dashboard"
          className="group relative bg-white rounded-3xl p-8 border-2 border-transparent hover:border-[#0d3d28]/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
        >
          {/* Gradient accent */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(13,61,40,0.03) 0%, rgba(212,163,67,0.03) 100%)" }} />

          <div className="relative">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 duration-300"
              style={{ background: "linear-gradient(135deg, #0d3d28, #1a5c3a)" }}>
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
              style={{ background: "rgba(13,61,40,0.08)", color: "#0d3d28" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Espace Membre
            </div>

            <h2 className="text-xl font-black text-gray-900 mb-2">Mes Associations</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Gérez vos tontines, cotisations, prêts, solidarité et suivez vos associations de près.
            </p>

            {/* Features */}
            <ul className="space-y-2 mb-8">
              {["Sélecteur d'association", "Mes Tontines & Cotisations", "Prêts, Épargne, Solidarité", "Sessions & Tirages"].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1 h-1 rounded-full bg-[#0d3d28] opacity-50" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 font-black text-sm group-hover:gap-4 transition-all duration-300"
              style={{ color: "#0d3d28" }}>
              Accéder
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Espace Admin */}
        <Link
          href="/admin"
          className="group relative rounded-3xl p-8 border-2 border-transparent hover:border-[#1e293b]/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden"
          style={{ background: "#1e293b" }}
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #60a5fa 0%, transparent 50%)" }} />

          <div className="relative">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 duration-300"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
              style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Mode Administration
            </div>

            <h2 className="text-xl font-black text-white mb-2">Console Admin</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              Supervisez la plateforme, gérez les utilisateurs système, rôles, associations et journaux d'audit.
            </p>

            {/* Features */}
            <ul className="space-y-2 mb-8">
              {["Gestion des utilisateurs système", "Rôles & Permissions RBAC", "Supervision des associations", "Journaux d'audit complets"].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <div className="w-1 h-1 rounded-full bg-blue-400 opacity-50" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 font-black text-sm group-hover:gap-4 transition-all duration-300 text-blue-400">
              Accéder
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-gray-400 text-center max-w-sm">
        Vous pouvez basculer entre les deux espaces à tout moment depuis le menu, sans vous déconnecter.
      </p>
    </div>
  );
}
