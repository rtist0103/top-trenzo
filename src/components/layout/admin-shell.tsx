import type { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { SessionTimeout } from "@/features/admin/components/session-timeout";

type Props = {
  children: ReactNode;
  user: { email: string; name: string };
};

export function AdminShell({ children, user }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <SessionTimeout />
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}