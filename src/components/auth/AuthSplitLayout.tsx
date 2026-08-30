import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-700 to-slate-900 p-10 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl"
        />
        <Logo className="text-white [&_span:last-child]:text-white" href="/" />
        <div>
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Find your next job.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cyan-100">
            JobSeek connects job seekers with companies and HR teams — browse
            curated openings, apply with one profile, and track every step of
            your application.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-cyan-50">
            {[
              "Thousands of verified job listings",
              "Track application status in real time",
              "One profile, unlimited applications",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <svg className="h-5 w-5 shrink-0 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-cyan-200/70">© {new Date().getFullYear()} JobSeek</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </div>
        <p className="text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-cyan-600 hover:text-cyan-700">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
