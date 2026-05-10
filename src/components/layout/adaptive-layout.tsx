"use client";

import { useSession } from "next-auth/react";
import { DashboardLayout } from "./dashboard-layout";
import { PublicLayout } from "./public-layout";

export function AdaptiveLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (session) return <DashboardLayout title={title}>{children}</DashboardLayout>;
  return <PublicLayout title={title}>{children}</PublicLayout>;
}
