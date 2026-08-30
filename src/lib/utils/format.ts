import type { ApplicationStatus, JobStatus } from "@/types/database";

export function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Salary not disclosed";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
  return fmt((min ?? max)!);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export const JOB_STATUS_STYLES: Record<JobStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  pending: { label: "Pending review", className: "bg-amber-100 text-amber-700" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", className: "bg-slate-200 text-slate-500" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-cyan-50 text-cyan-700" },
  reviewing: { label: "Reviewing", className: "bg-blue-100 text-blue-700" },
  shortlisted: { label: "Shortlisted", className: "bg-violet-100 text-violet-700" },
  interview: { label: "Interview", className: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};
