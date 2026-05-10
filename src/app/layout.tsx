import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Tchoua - Gestion de Tontines",
  description: "Système de gestion de tontines africaines - Finance, Nature, Services & Solidarité",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
