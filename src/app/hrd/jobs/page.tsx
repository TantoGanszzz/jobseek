import Link from "next/link";
import { Badge, Card, CardBody, EmptyState } from "@/components/ui/DataDisplay";
import { ButtonLink } from "@/components/ui/Button";
import { JobRowActions } from "@/components/hrd/JobRowActions";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { JOB_STATUS_STYLES, formatSalary } from "@/lib/utils/format";
import { employmentTypeLabel } from "@/types/database";
import type { EmploymentType, JobStatus } from "@/types/database";

export const metadata = { title: "Manage Jobs" };

export default async function HrdJobsPage() {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const [{ data: jobs }, { data: counts }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("created_by", user.userId)
      .order("created_at", { ascending: false }),
    // Applicant counts per job.
    supabase.from("applications").select("job_id"),
  ]);

  const countMap = new Map<string, number>();
  for (const c of counts ?? []) {
    const row = c as unknown as { job_id: string };
    countMap.set(row.job_id, (countMap.get(row.job_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, publish, and monitor your job postings.
          </p>
        </div>
        <ButtonLink href="/hrd/jobs/new">+ New job</ButtonLink>
      </section>

      {!jobs || jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Create your first job posting to start hiring."
          action={<ButtonLink href="/hrd/jobs/new" size="sm">Create job</ButtonLink>}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {(jobs as Array<{
                id: string;
                title: string;
                status: JobStatus;
                location: string | null;
                salary_min: number | null;
                salary_max: number | null;
                employment_type: EmploymentType;
              }>).map((job) => (
                <div key={job.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/hrd/jobs/${job.id}`}
                        className="truncate text-sm font-semibold text-slate-900 hover:text-cyan-600"
                      >
                        {job.title}
                      </Link>
                      <Badge color={JOB_STATUS_STYLES[job.status].className}>
                        {JOB_STATUS_STYLES[job.status].label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {[job.location, employmentTypeLabel(job.employment_type), formatSalary(job.salary_min, job.salary_max)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-500">
                      👥 {countMap.get(job.id) ?? 0} applicants
                    </span>
                    <JobRowActions jobId={job.id} status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
