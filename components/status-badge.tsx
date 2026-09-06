import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  qualified: "bg-blue-50 text-blue-700 ring-blue-200",
  review: "bg-sky-50 text-sky-700 ring-sky-200",
  shortlisted: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  interview: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  required: "bg-violet-50 text-violet-700 ring-violet-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  submitted: "bg-blue-50 text-blue-700 ring-blue-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
  inprogress: "bg-amber-50 text-amber-700 ring-amber-200",
  underreview: "bg-sky-50 text-sky-700 ring-sky-200",
  qualifiedandpending: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const normalized = status.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const key =
    normalized.includes("inprogress") ? "inprogress" :
    normalized.includes("underreview") ? "underreview" :
    normalized.includes("review") ? "review" :
    normalized.includes("shortlist") ? "shortlisted" :
    normalized.includes("interview") ? "interview" :
    normalized.includes("accept") ? "accepted" :
    normalized.includes("reject") ? "rejected" :
    normalized.includes("qualified") ? "qualified" :
    normalized.includes("required") ? "required" :
    normalized.includes("failed") ? "failed" :
    normalized.includes("submitted") ? "submitted" :
    normalized.includes("pending") ? "pending" :
    normalized.includes("closed") ? "closed" :
    normalized.includes("active") ? "active" :
    normalized.includes("draft") ? "draft" :
    "review";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[key] ?? "bg-sky-50 text-sky-700 ring-sky-200",
        className,
      )}
    >
      {status}
    </span>
  );
}
