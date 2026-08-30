"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Route,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { profileCompletion } from "@/lib/demo/data";
import { Avatar, ProgressBar } from "./ui";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "MAIN",
    items: [
      { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/jobs", label: "Jobs", icon: Briefcase },
      { href: "/app/latihan", label: "Latihan", icon: BookOpen },
      { href: "/app/assessment", label: "Assessment", icon: ClipboardCheck },
    ],
  },
  {
    title: "CAREER",
    items: [
      { href: "/app/karier", label: "Karier", icon: Route },
      { href: "/app/skill-profile", label: "Skill Profile", icon: UserRound },
      { href: "/app/portfolio", label: "Portfolio", icon: FolderKanban },
      { href: "/app/resume", label: "CV & Resume", icon: FileText },
      { href: "/app/certificates", label: "Sertifikat", icon: Award },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { href: "/app/messages", label: "Pesan", icon: MessageSquare },
      { href: "/app/notifications", label: "Notifikasi", icon: Bell },
    ],
  },
  {
    title: "ACCOUNT",
    items: [{ href: "/app/settings", label: "Pengaturan", icon: Settings }],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/app/dashboard" || item.href === "/app/jobs") {
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }
  return pathname === item.href;
}

function JobSeekMark({ className }: { className?: string }) {
  return (
    <Link href="/app/dashboard" className={cn("flex items-center gap-2.5", className)}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-sm shadow-cyan-500/30">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v1m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </span>
      <span className="text-lg font-extrabold lowercase tracking-tight text-slate-900">
        job<span className="text-cyan-600">seek</span>
      </span>
    </Link>
  );
}

function SidebarLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-150",
                      active
                        ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/25"
                        : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        active ? "text-white" : "text-slate-400 group-hover:text-cyan-600"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ProfileCard() {
  return (
    <div className="border-t border-line p-3">
      <div className="rounded-card border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Lengkapi Profil</p>
          <span className="text-sm font-extrabold text-cyan-600">{profileCompletion.percent}%</span>
        </div>
        <div className="mt-2.5">
          <ProgressBar value={profileCompletion.percent} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {profileCompletion.description}
        </p>
        <Link
          href="/app/settings"
          className="mt-3.5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-600"
        >
          Lengkapi Sekarang
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    router.push(`/app/jobs?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
          <JobSeekMark />
        </div>
        <SidebarLinks pathname={pathname} />
        <ProfileCard />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-surface shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <JobSeekMark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <ProfileCard />
          </aside>
        </div>
      )}

      <div className="lg:pl-[260px]">
        {/* Top header */}
        <header className="sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <form onSubmit={submitSearch} className="min-w-0 flex-1 sm:max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari pekerjaan, skill, atau perusahaan..."
                  className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <Link
                href={`/app/jobs?q=${encodeURIComponent(q)}`}
                aria-label="Cari"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-600 lg:hidden"
              >
                <Search className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/app/notifications"
                aria-label="Notifikasi"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-600"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-white" />
              </Link>
              <Link
                href="/app/messages"
                aria-label="Pesan"
                className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-600 sm:inline-flex"
              >
                <MessageSquare className="h-[18px] w-[18px]" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-white" />
              </Link>

              <button
                type="button"
                className="group ml-1 flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-colors hover:border-line hover:bg-white"
              >
                <Avatar initials="AP" color="bg-cyan-500" size="md" />
                <span className="hidden text-left leading-tight md:block">
                  <span className="block text-sm font-bold text-slate-900">Andi Pratama</span>
                  <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                    Job Seeker <ChevronDown className="h-3 w-3" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>

        <footer className="border-t border-line px-6 py-5 text-center text-xs text-slate-400">
          jobseek — Prove Your Skills. Find Your Career.
        </footer>
      </div>
    </div>
  );
}