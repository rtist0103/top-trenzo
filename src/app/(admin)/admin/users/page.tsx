import { revalidatePath } from "next/cache";
import { Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { UserRoleSelector } from "@/features/auth/components/user-role-selector";

async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at, avatar_url")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function updateRole(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const role = formData.get("role") as string;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/users");
}

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string;
  avatar_url: string | null;
};

export default async function UsersPage() {
  const users = await getUsers() as User[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage team members and their roles.</p>
      </div>

      <Card>
        <div className="p-4 border-b flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{users.length} members</span>
        </div>

        {users.length === 0 ? (
          <p className="p-6 text-sm text-center text-muted-foreground">No users found.</p>
        ) : (
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {(user.full_name ?? user.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="hidden sm:block text-xs text-muted-foreground">
                    Joined {formatDate(user.created_at)}
                  </p>
                  <UserRoleSelector
                    userId={user.id}
                    currentRole={(user.role ?? "writer") as "writer" | "editor" | "admin"}
                    updateRole={updateRole}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}