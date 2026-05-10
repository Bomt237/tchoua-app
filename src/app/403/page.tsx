"use client";

import Link from "next/link";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">403</h1>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Accès Refusé</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Vous n&apos;avez pas les droits nécessaires pour accéder à cette section.
            L&apos;espace d&apos;administration est réservé aux utilisateurs système avec un rôle attribué.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-[#0d3d28] text-[#0d3d28] hover:bg-[#0d3d28] hover:text-white transition-all"
          >
            <Home className="w-4 h-4" />
            Mon Tableau de Bord
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
        <p className="text-xs text-gray-300">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez l&apos;administrateur système.
        </p>
      </div>
    </div>
  );
}
