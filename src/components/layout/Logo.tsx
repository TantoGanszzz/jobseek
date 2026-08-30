import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold text-slate-900", className)}
      aria-label="JobSeek home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-sm">
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ width: 18, height: 18 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v1m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </span>
      <span className="text-lg tracking-tight">
        Job<span className="text-cyan-600">Seek</span>
      </span>
    </Link>
  );
}
