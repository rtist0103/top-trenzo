"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const roleVariant = {
  admin:  "default",
  editor: "secondary",
  writer: "outline",
} as const;

type Role = "writer" | "editor" | "admin";

type Props = {
  userId: string;
  currentRole: Role;
  updateRole: (formData: FormData) => Promise<void>;
};

export function UserRoleSelector({ userId, currentRole, updateRole }: Props) {
  const [role, setRole] = useState<Role>(currentRole);
  const [pending, setPending] = useState(false);

  async function handleChange(newRole: Role) {
    if (newRole === role) return;
    setPending(true);
    const fd = new FormData();
    fd.set("id", userId);
    fd.set("role", newRole);
    try {
      await updateRole(fd);
      setRole(newRole);
      toast.success("Role updated.");
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        title="Change user role"
        value={role}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as Role)}
        className="text-xs rounded-md border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      >
        <option value="writer">Writer</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>
      <Badge variant={roleVariant[role]} className="hidden sm:inline-flex capitalize">
        {role}
      </Badge>
    </div>
  );
}