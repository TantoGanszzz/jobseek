import Link from "next/link";
import { Badge, Card } from "@/components/ui/DataDisplay";
import { Icon } from "@/components/ui/Icon";
import { employmentTypeLabel, type JobWithCompany } from "@/types/database";
import { formatSalary, timeAgo } from "@/lib/utils/format";

export function CompanyAvatar({
  name,
  url,
  size = 48,
}: {
  name: string;
  url?: string | null;
  size?: number;
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
        className="shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-sm font-bold text-cyan-700"
      aria-hidden="true"
    >
      {initials || "C"}
    </div>
  );
}

export function JobCard({ job }: { job: JobWithCompany }) {
  return (
    <Link href={`/jobs/${job.id}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <CompanyAvatar name={job.company_name ?? "Company"} url={job.company_logo_url} />
          <Badge>{employmentTypeLabel(job.employment_type)}</Badge>
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-cyan-700">
            {job.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {job.company_name ?? "Company"}
          </p>
        </div>
        <div className="mt-auto space-y-2 text-sm text-slate-500">
          {job.location && (
            <p className="flex items-center gap-1.5">
              <Icon name="mapPin" className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{job.location}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5 font-medium text-slate-700">
            <Icon name="currency" className="h-4 w-4 shrink-0 text-cyan-600" />
            {formatSalary(job.salary_min, job.salary_max)}
          </p>
        </div>
        <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
          {timeAgo(job.created_at)}
        </p>
      </Card>
    </Link>
  );
}

export function JobCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-auto space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
      </div>
    </Card>
  );
}
