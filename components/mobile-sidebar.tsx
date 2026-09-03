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
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getDisplayName } from "@/components/navbar-profile-menu";
import { signOut } from "@/app/actions/auth";

interface SidebarUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MobileSidebarProps {
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

export default function MobileSidebar({ user }: MobileSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            className="md:hidden p-2 text-navy rounded-lg hover:bg-navy/5 transition-colors cursor-pointer"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-white">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-14 border-b border-brand-border px-5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-xl font-bold text-navy tracking-tight"
            >
              Jobseek
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-navy/40 uppercase">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                          active
                            ? "bg-navy text-white shadow-sm"
                            : "text-navy/60 hover:text-navy hover:bg-light-bg"
                        }`}
                      >
                        <item.icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            active ? "text-white" : ""
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-brand-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9 border border-brand-border">
                <AvatarImage
                  src={user.avatar_url || undefined}
                  alt={user.full_name || user.email}
                />
                <AvatarFallback className="bg-navy text-white text-xs font-medium">
                  {getInitials(user.full_name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">
                  {getDisplayName(user.full_name, user.email)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
