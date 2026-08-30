import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4",
        className
      )}
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}

interface BadgeProps extends ComponentProps<"span"> {
  color?: string;
}

export function Badge({ color = "bg-cyan-50 text-cyan-700", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        color,
        className
      )}
      {...props}
    />
  );
}

export function Alert({
  kind = "info",
  children,
  className,
}: {
  kind?: "info" | "success" | "error" | "warning";
  children: ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-cyan-200 bg-cyan-50 text-cyan-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  } as const;

  const icons = {
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    error: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  } as const;

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm", styles[kind], className)}
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={icons[kind]} />
      </svg>
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-slate-200/70", className)}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Avatar({
  name,
  url,
  size = 40,
  className,
}: {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full border border-slate-200 object-cover", className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-700 select-none",
        className
      )}
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}
