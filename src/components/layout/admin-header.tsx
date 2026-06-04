"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { signOut } from "@/features/admin/actions/sign-out";

const pageTitles: Record<string, string> = {
  "/admin":            "Dashboard",
  "/admin/articles":   "Articles",
  "/admin/categories": "Categories",
  "/admin/tags":       "Tags",
  "/admin/users":      "Users",
  "/admin/settings":   "Settings",
};

function getPageTitle(pathname: string): string {
  if (pathname in pageTitles) return pageTitles[pathname]!;
  if (pathname.includes("/articles/new"))   return "New Article";
  if (pathname.includes("/articles/") && pathname.includes("/edit")) return "Edit Article";
  return "Admin";
}

type Props = { user: { email: string; name: string } };

export function AdminHeader({ user }: Props) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between shrink-0">
      <h1 className="font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="flex items-center gap-2 pl-1 border-l">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {(user.name ?? "A").charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium max-w-36 truncate">
            {user.name ?? "Admin"}
          </span>
        </div>

        <form action={signOut}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}