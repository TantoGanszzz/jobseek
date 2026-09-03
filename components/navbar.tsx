"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import NavbarProfileMenu from "./navbar-profile-menu";
import { signOut } from "@/app/actions/auth";

interface NavbarProps {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const navLinks = [
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "#resources", label: "Career" },
  { href: "#about", label: "Resources" },
];

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-brand-border">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold text-navy tracking-tight">
            Jobseek
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={user && link.href === "/find-jobs" ? "/dashboard/find-jobs" : link.href}
              className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <NavbarProfileMenu user={user} />
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-navy font-medium hover:bg-navy/5 cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-navy text-white hover:bg-navy-light font-medium cursor-pointer">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="lg:hidden p-2 text-navy rounded-lg hover:bg-navy/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={user && link.href === "/find-jobs" ? "/dashboard/find-jobs" : link.href}
                className="block px-4 py-3 text-sm font-medium text-navy/70 hover:text-navy hover:bg-light-bg rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-brand-border pt-4 mt-4">
              {user ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 text-sm font-medium text-navy">
                    {user.full_name || user.email}
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-3 text-sm text-navy/70 hover:text-navy hover:bg-light-bg rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-sm text-navy/70 hover:text-navy hover:bg-light-bg rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-3 text-sm text-navy/70 hover:text-navy hover:bg-light-bg rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    disabled={signingOut}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    onClick={async () => {
                      setSigningOut(true);
                      await signOut();
                    }}
                  >
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-navy text-navy hover:bg-navy/5 font-medium cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-navy text-white hover:bg-navy-light font-medium cursor-pointer">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
