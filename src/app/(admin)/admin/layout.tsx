import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/layout/admin-shell";
import { getSettingsMap } from "@/features/settings/repositories/settings.repositories";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin/login");

  const s = await getSettingsMap();

  return (
    <AdminShell
      user={{ email: user.email ?? "", name: user.user_metadata?.full_name ?? user.email ?? "Admin" }}
      logoUrl={s.logo_url ?? null}
      siteName={s.site_name ?? "TopTrenzo"}
    >
      {children}
    </AdminShell>
  );
}