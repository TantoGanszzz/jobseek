import Link from "next/link";
import { Badge, Card, CardBody, CardHeader, EmptyState } from "@/components/ui/DataDisplay";
import { ButtonLink } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { APPLICATION_STATUS_STYLES, formatDate } from "@/lib/utils/format";

export const metadata = { title: "Dashboard" };

export default async function HrdDashboardPage() {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  // Jobs owned by this HRD.
  const { data: myJobs } = await supabase
    .from("jobs")
    .select("id, title, status")
    .eq("created_by", user.userId);

  const jobs = myJobs ?? [];
  const activeJobs = jobs.filter((j) => j.status === "published").length;
  const jobIds = jobs.map((j) => j.id);

  // Applications across those jobs.
  let applicants: Array<{
    id: string;
    status: string;
    applied_at: string;
    applicant: { full_name: string | null } | null;
    jobs: { title: string } | null;
  }> = [];

  if (jobIds.length > 0) {
    const { data } = await supabase
      .from("applications")
      .select(
        "id, status, applied_at, profiles!applications_applicant_id_fkey(full_name), jobs(title)"
      )
      .in("job_id", jobIds)
      .order("applied_at", { ascending: false })
      .limit(8);
    if (data) {
      applicants = data as unknown as typeof applicants;
    }
  }

  const totalApplicants = applicants.length;
  const interviews = applicants.filter((a) => a.status === "interview").length;
  const hired = applicants.filter((a) => a.status === "accepted").length;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back, {user.profile.full_name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your recruitment pipeline.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Active Jobs" value={activeJobs} icon="briefcase" />
        <StatCard label="Total Applicants" value={totalApplicants} icon="users" accent="violet" />
        <StatCard label="Interviews" value={interviews} icon="clipboard" accent="amber" />
        <StatCard label="Hired" value={hired} icon="checkCircle" accent="emerald" />
      </section>

      <Card>
        <CardHeader
          title="Recent Applications"
          description="Latest candidates across all of your jobs."
          action={
            <Link href="/hrd/applicants" className="text-sm font-medium text-cyan-600 hover:text-cyan-700">
              View all →
            </Link>
          }
        />
        {applicants.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
            title="No applications yet"
            description="Publish a job to start receiving applications."
            action={<ButtonLink href="/hrd/jobs/new" size="sm">Create a job</ButtonLink>}
          />
        ) : (
          <CardBody className="divide-y divide-slate-100 p-0">
            {applicants.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {a.applicant?.full_name ?? "Candidate"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    Applied for{" "}
                    <span className="font-medium text-slate-600">{a.jobs?.title}</span> ·{" "}
                    {formatDate(a.applied_at)}
                  </p>
                </div>
                <Badge color={APPLICATION_STATUS_STYLES[a.status as keyof typeof APPLICATION_STATUS_STYLES]?.className}>
                  {APPLICATION_STATUS_STYLES[a.status as keyof typeof APPLICATION_STATUS_STYLES]?.label ?? a.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        )}
      </Card>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Your job posts</h2>
          <ButtonLink href="/hrd/jobs/new" variant="subtle" size="sm">+ New job</ButtonLink>
        </div>
        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs yet"
            description="Create your first job posting to reach thousands of candidates."
            action={<ButtonLink href="/hrd/jobs/new" size="sm">Create job</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.slice(0, 6).map((j) => (
              <Link
                key={j.id}
                href={`/hrd/jobs/${j.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
              >
                <p className="truncate text-sm font-semibold text-slate-900">{j.title}</p>
                <Badge
                  color={
                    j.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : j.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }
                  className="mt-2"
                >
                  {j.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
