"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, LayoutDashboard, FolderTree, Tag, Users, Settings, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",  href: "/admin",            icon: LayoutDashboard, exact: true },
  { label: "Articles",   href: "/admin/articles",   icon: Newspaper },
  { label: "Homepage",   href: "/admin/homepage",   icon: Star },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Tags",       href: "/admin/tags",       icon: Tag },
  { label: "Users",      href: "/admin/users",      icon: Users },
  { label: "Settings",   href: "/admin/settings",   icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col shrink-0 border-r bg-zinc-950 dark:bg-zinc-950 text-zinc-100">
      {/* Logo */}
      <div className="h-16 border-b border-zinc-800 flex items-center gap-2.5 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Newspaper className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-white">TopTrenzo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Menu
        </p>
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} TopTrenzo. All rights reserved.</p>
      </div>
    </aside>
  );
}