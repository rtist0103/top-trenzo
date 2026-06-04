import { redirect } from "next/navigation";

import { createClient }
  from "@/lib/supabase/server";

export async function requireRole(
  allowedRoles: string[],
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (
    !profile ||
    !allowedRoles.includes(
      profile.role,
    )
  ) {
    redirect("/");
  }

  return {
    user,
    profile,
  };
}