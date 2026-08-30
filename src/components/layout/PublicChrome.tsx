import Link from "next/link";
import { Logo } from "./Logo";
import { ButtonLink } from "@/components/ui/Button";

const navLinks = [
  { href: "/jobs", label: "Find Jobs" },
];

export function PublicHeader({ userName }: { userName?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-cyan-50 hover:text-cyan-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          {userName ? (
            <ButtonLink href="/jobseeker/dashboard" size="sm" variant="subtle">
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" size="sm" variant="ghost">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo />
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} JobSeek. Find your next job.
        </p>
      </div>
    </footer>
  );
}
