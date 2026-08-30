"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui/DataDisplay";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

function SidebarContent({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-cyan-600",
              active
                ? "bg-cyan-50 text-cyan-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <span className={cn("shrink-0 [&>svg]:h-5 [&>svg]:w-5", active ? "text-cyan-600" : "text-slate-400")}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  items,
  user,
  title,
  children,
}: {
  items: NavItem[];
  user: { name: string; email: string; role: string; avatarUrl?: string | null };
  title: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const roleLabel =
    user.role === "hrd" ? "HRD" : user.role === "admin" ? "Admin" : "Job Seeker";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-cyan-600"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <LogoutButton onClick={handleLogout} loading={loggingOut} />
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-16 items-center border-b border-slate-100 px-5">
            <Logo />
          </div>
          <SidebarContent items={items} pathname={pathname} />
          <LogoutButton onClick={handleLogout} loading={loggingOut} />
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            <div className="flex items-center gap-3">
              <Avatar name={user.name} url={user.avatarUrl} size={36} />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function LogoutButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="border-t border-slate-100 p-3">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-cyan-600"
      >
        <span className="[&>svg]:h-5 [&>svg]:w-5 text-slate-400 group-hover:text-red-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </span>
        {loading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
