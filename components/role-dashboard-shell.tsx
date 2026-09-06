"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Search,
  Settings,
  ShieldCheck,
  Shield,
  User,
  Users,
  Bookmark,
  X,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import NotificationBell from "@/components/notification-bell";
import type { AppNotification } from "@/lib/hrd/types";

const NAV_ICONS: Record<string, LucideIcon> = {
  briefcase: BriefcaseBusiness,
  search: Search,
  applications: ClipboardCheck,
  portfolio: FolderKanban,
  profile: User,
  tests: CheckCircle2,
  cv: FileText,
  company: Building2,
  users: Users,
  shield: ShieldCheck,
  settings: Settings,
  dashboard: LayoutDashboard,
  bookmark: Bookmark,
  learning: GraduationCap,
  admin_shield: Shield,
  career: Compass,
  tasks: ListTodo,
  messages: MessageSquare,
  calendar: Calendar,
  announcements: Megaphone,
};

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface DashboardUserInfo {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

function SidebarNav({
  groups,
  collapsed,
}: {
  groups: NavGroup[];
  collapsed: boolean;
}) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard" || href === "/company/dashboard" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = NAV_ICONS[item.icon] ?? LayoutDashboard;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-lg transition-all duration-150 ${
                    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                  } ${
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-blue-600" />
                  )}
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue-600" : ""}`} />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function RoleDashboardShell({
  navGroups,
  user,
  brandLabel,
  brandIcon,
  notifications,
  children,
}: {
  navGroups: NavGroup[];
  user: DashboardUserInfo;
  brandLabel?: string;
  brandIcon?: string;
  notifications?: AppNotification[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-slate-200 shrink-0 ${collapsed ? "justify-center px-2" : "px-5"}`}>
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <BriefcaseBusiness className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">{brandLabel || "Jobseek"}</span>
            </Link>
          ) : (
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BriefcaseBusiness className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Collapse toggle */}
        {!collapsed && (
          <div className="flex items-center justify-end px-3 pt-3">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <SidebarNav groups={navGroups} collapsed={collapsed} />

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="border-t border-slate-200 p-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* User section */}
        <div className="border-t border-slate-200 p-3 shrink-0">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {initials}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                type="button"
                disabled={signingOut}
                onClick={async () => {
                  setSigningOut(true);
                  await signOut();
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-slate-200 flex flex-col z-50">
            <div className="flex items-center justify-between h-16 border-b border-slate-200 px-5">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-slate-900">{brandLabel || "Jobseek"}</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav groups={navGroups} collapsed={false} />
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={signingOut}
                onClick={async () => {
                  setSigningOut(true);
                  await signOut();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center h-full gap-4 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="flex w-full max-w-xl items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  aria-label="Search"
                  placeholder="Search jobs, companies..."
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {notifications ? (
                <NotificationBell notifications={notifications} />
              ) : (
                <button
                  type="button"
                  className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
                </button>
              )}

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                    {initials}
                  </div>
                  <span className="hidden text-sm font-medium text-slate-900 md:block max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 md:block" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href={user.role === "admin" ? "/admin" : user.role === "hrd" ? "/company/profile" : "/dashboard/profile"}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href={user.role === "admin" ? "/admin" : user.role === "hrd" ? "/company/settings" : "/dashboard/settings"}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        type="button"
                        disabled={signingOut}
                        onClick={async () => {
                          setSigningOut(true);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {signingOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
