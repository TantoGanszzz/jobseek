"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  BookOpen,
  FolderKanban,
  User,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavbarProfileMenu, {
  getInitials,
  getDisplayName,
} from "@/components/navbar-profile-menu";

interface SidebarUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface DashboardSidebarProps {
  user: SidebarUser;
}

const navGroups = [
  {
    label: "MAIN",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/find-jobs", icon: Search, label: "Find Jobs" },
    ],
  },
  {
    label: "CAREER",
    items: [
      { href: "/dashboard/learning", icon: BookOpen, label: "Learning" },
      { href: "/dashboard/portfolio", icon: FolderKanban, label: "Portfolio" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/dashboard/profile", icon: User, label: "Profile" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-brand-border h-full sidebar-transition ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
    >
      {/* Collapse Toggle */}
      <div
        className={`flex items-center h-14 border-b border-brand-border px-3 ${
          collapsed ? "justify-center" : "justify-end"
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-navy/50 hover:text-navy hover:bg-light-bg rounded-lg transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-navy/40 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg transition-all duration-150 ${
                      collapsed
                        ? "justify-center px-0 py-2.5"
                        : "px-3 py-2.5"
                    } ${
                      active
                        ? "bg-navy text-white shadow-sm"
                        : "text-navy/60 hover:text-navy hover:bg-light-bg"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={`h-[18px] w-[18px] shrink-0 ${
                        active ? "text-white" : ""
                      }`}
                    />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-brand-border p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <NavbarProfileMenu user={user} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <NavbarProfileMenu user={user} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy truncate">
                {getDisplayName(user.full_name, user.email)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
