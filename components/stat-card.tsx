import { ArrowUpRight, type LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {detail ? (
        <div className="mt-4 flex items-center gap-1 text-xs text-blue-700">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>{detail}</span>
        </div>
      ) : null}
    </div>
  );
}
