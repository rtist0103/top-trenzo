"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();

  // Clear Supabase session cookies + our idle tracking cookie
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-") || cookie.name === "admin_last_active") {
      cookieStore.delete(cookie.name);
    }
  }

  redirect("/admin/login");
}