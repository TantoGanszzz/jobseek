import { Card } from "@/components/ui/DataDisplay";
import { Icon } from "@/components/ui/Icon";

export function StatCard({
  label,
  value,
  icon,
  accent = "cyan",
  hint,
}: {
  label: string;
  value: number | string;
  icon?: string;
  accent?: "cyan" | "emerald" | "amber" | "red" | "violet";
  hint?: string;
}) {
  const accents: Record<string, string> = {
    cyan: "bg-cyan-50 text-cyan-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-500",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accents[accent]}`}
          >
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
      </div>
    </Card>
  );
}
