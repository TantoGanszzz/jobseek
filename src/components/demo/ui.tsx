import Link from "next/link";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold tracking-tight text-slate-900">{title}</h2>
      {action}
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-bright transition-all duration-500",
          barClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function RingProgress({
  value,
  size = 148,
  stroke = 12,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  sublabel?: string;
}) {
  const id = useId();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
        {sublabel && (
          <span className="mt-0.5 text-[11px] font-medium text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function MatchBadge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary-dark",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
        <path d="M12 2l2.4 4.9 5.6.8-4 3.9.9 5.5L12 14.9 7.1 17.1 8 11.6 4 7.7l5.6-.8L12 2z" />
      </svg>
      {value}% Match
    </span>
  );
}

type BadgeTone = "cyan" | "success" | "warning" | "danger" | "slate" | "violet";

const badgeTones: Record<BadgeTone, string> = {
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  success: "bg-green-50 text-green-700 ring-green-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function Badge({
  tone = "slate",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SkillTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

export function Avatar({
  initials,
  color = "bg-cyan-500",
  size = "md",
  className,
}: {
  initials: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-bold text-white",
        s,
        color,
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function IconButton({
  label,
  children,
  href,
  unread = false,
  onClick,
}: {
  label: string;
  children: ReactNode;
  href?: string;
  unread?: boolean;
  onClick?: () => void;
}) {
  const cls =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-slate-500 transition-colors hover:border-cyan-300 hover:text-cyan-600 focus-visible:outline-2 focus-visible:outline-cyan-600";
  const inner = (
    <>
      {children}
      {unread && (
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-white" />
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-cyan-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        <p className="truncate text-sm font-semibold text-slate-700">{label}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
  const cls =
    "group rounded-card border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-card-hover";
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18m-6-6l6 6-6 6" />
        </svg>
      </span>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}