import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "outline" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700 shadow-sm",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:border-cyan-400 hover:text-cyan-700",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  subtle: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: CommonProps & ComponentProps<typeof Link> & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
