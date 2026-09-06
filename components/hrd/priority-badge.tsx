import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/lib/hrd/types";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium
      )}
    >
      {priority}
    </span>
  );
}