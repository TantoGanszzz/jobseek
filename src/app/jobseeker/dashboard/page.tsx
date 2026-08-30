import Link from "next/link";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/DataDisplay";
import { ButtonLink } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { JobCard } from "@/components/jobs/JobCard";
import { Badge } from "@/components/ui/DataDisplay";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { queryPublishedJobs } from "@/lib/jobs/queries";
import { APPLICATION_STATUS_STYLES, formatDate } from "@/lib/utils/format";

export const metadata = { title: "Dashboard" };

const IN_PROGRESS = ["applied", "reviewing", "shortlisted", "interview"];

export default async function JobseekerDashboardPage() {
  const user = await requireRole("job_seeker");
  const supabase = await createClient();

  const [{ data: apps }, recommended] = await Promise.all([
    supabase
      .from("applications")
      .select("id, status, applied_at, jobs ( title )")
      .eq("applicant_id", user.userId)
      .order("applied_at", { ascending: false })
      .limit(6),
    queryPublishedJobs(supabase, { perPage: 3 }),
  ]);

  const applications = apps ?? [];
  const total = applications.length;
  const inProgress = applications.filter((a) => IN_PROGRESS.includes(a.status)).length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const accepted = applications.filter((a) => a.status === "accepted").length;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back, {user.profile.full_name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s an overview of your job search activity.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Applications" value={total} icon="document" />
        <StatCard label="In Progress" value={inProgress} icon="clock" accent="amber" />
        <StatCard label="Interviews" value={interviews} icon="users" accent="violet" />
        <StatCard label="Accepted" value={accepted} icon="checkCircle" accent="emerald" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Recent applications */}
        <Card>
          <CardHeader
            title="Recent Applications"
            description="Your latest submissions and their current stage."
            action={
              <Link
                href="/jobseeker/applications"
                className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
              >
                View all →
              </Link>
            }
          />
          {applications.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-1.414-1.414a1 1 0 00-.707-.293H4" />
                </svg>
              }
              title="No applications yet"
              description="Start exploring open roles and submit your first application."
              action={<ButtonLink href="/jobseeker/jobs" size="sm">Find jobs</ButtonLink>}
            />
          ) : (
            <CardBody className="divide-y divide-slate-100 p-0">
              {(applications as unknown as Array<{ id: string; status: string; applied_at: string; jobs: { title: string } | null }>).map((app) => {
                const style =
                  APPLICATION_STATUS_STYLES[app.status as keyof typeof APPLICATION_STATUS_STYLES];
                return (
                  <div key={app.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {app.jobs?.title ?? "Job"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Applied {formatDate(app.applied_at)}
                      </p>
                    </div>
                    <Badge color={style?.className}>{style?.label ?? app.status}</Badge>
                  </div>
                );
              })}
            </CardBody>
          )}
        </Card>

        {/* Recommended */}
        <Card>
          <CardHeader
            title="Recommended Jobs"
            description="Latest openings you might like."
            action={
              <Link href="/jobseeker/jobs" className="text-sm font-medium text-cyan-600 hover:text-cyan-700">
                Find more →
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {recommended.jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-cyan-300 hover:bg-cyan-50/40"
              >
                <p className="truncate text-sm font-semibold text-slate-900">{job.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{job.company_name}</p>
                <p className="mt-1.5 text-xs font-medium text-cyan-700">{job.location ?? "Remote"}</p>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Fresh for you</h2>
          <ButtonLink href="/jobseeker/jobs" variant="subtle" size="sm">
            Browse all jobs →
          </ButtonLink>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recommended.jobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
