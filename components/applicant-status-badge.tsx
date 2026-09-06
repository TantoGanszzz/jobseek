import { cn } from "@/lib/utils";
import type { ApplicantStatus } from "@/lib/hrd/types";
import { APPLICANT_STATUS_LABELS, APPLICANT_STATUS_STYLES } from "@/lib/hrd/applicant-status";

export function ApplicantStatusBadge({
  status,
  className,
}: {
  status: ApplicantStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        APPLICANT_STATUS_STYLES[status],
        className,
      )}
    >
      {APPLICANT_STATUS_LABELS[status]}
    </span>
  );
}