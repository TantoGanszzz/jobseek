import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader, PublicFooter } from "@/components/layout/PublicChrome";
import { CompanyAvatar } from "@/components/jobs/JobCard";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { Alert, Badge, Card } from "@/components/ui/DataDisplay";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/server";
import { getPublishedJob } from "@/lib/jobs/queries";
import { getCurrentUser } from "@/lib/auth/session";
import {
  employmentTypeLabel,
  type Application,
} from "@/types/database";
import { formatDate, formatSalary } from "@/lib/utils/format";

interface JobDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const job = await getPublishedJob(supabase, id);
  return {
    title: job ? `${job.title} — ${job.company_name ?? "JobSeek"}` : "Job not found",
  };
}

export default async function JobDetailPage({ params }: JobDetailProps) {
  const { id } = await params;

  const [supabase, viewer] = await Promise.all([createClient(), getCurrentUser()]);
  const job = await getPublishedJob(supabase, id);

  if (!job) notFound();

  // Application state for the signed-in job seeker.
  let myApplication: Application | null = null;
  const profileCvUrl: string | null = viewer?.profile.cv_url ?? null;
  const isOwner = viewer && viewer.profile.role === "hrd" && job.created_by === viewer.userId;
  const isAdmin = viewer?.profile.role === "admin";

  if (viewer && !isOwner) {
    const { data: app } = await supabase
      .from("applications")
      .select("*")
      .eq("job_id", job.id)
      .eq("applicant_id", viewer.userId)
      .maybeSingle();
    myApplication = app;
  }

  const closed = job.status !== "published";
  const alreadyApplied = !!myApplication;
  const canApply =
    !!viewer &&
    viewer.profile.role === "job_seeker" &&
    !alreadyApplied &&
    !closed;

  return (
    <>
      <PublicHeader userName={viewer?.profile.full_name} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/jobs" className="hover:text-cyan-700">
            Jobs
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-700">{job.title}</span>
        </nav>

        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-5">
            <CompanyAvatar name={job.company_name ?? "Company"} url={job.company_logo_url} size={64} />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {job.title}
              </h1>
              <p className="mt-1 text-slate-500">{job.company_name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="mapPin" className="h-4 w-4 text-cyan-600" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" className="h-4 w-4 text-cyan-600" />
                  {employmentTypeLabel(job.employment_type)}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Icon name="currency" className="h-4 w-4 text-cyan-600" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge color="bg-emerald-100 text-emerald-700">
                Posted {formatDate(job.created_at)}
              </Badge>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-8">
            {/* Apply states per spec §11 */}
            {!viewer && (
              <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-cyan-50 p-5 sm:flex-row">
                <p className="text-sm font-medium text-cyan-900">
                  Log in to apply for this position.
                </p>
                <ButtonLink href={`/login?next=/jobs/${job.id}`} size="md">
                  Login to apply
                </ButtonLink>
              </div>
            )}

            {viewer && alreadyApplied && (
              <Alert kind="success">
                You already applied to this job on{" "}
                <strong>{formatDate(myApplication!.applied_at)}</strong>. Track
                its status in{" "}
                <a href="/jobseeker/applications" className="font-semibold underline">
                  My Applications
                </a>
                .
              </Alert>
            )}

            {viewer && !alreadyApplied && closed && (
              <Alert kind="warning">
                This job is no longer accepting applications.
              </Alert>
            )}

            {canApply && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Submit your application with one click.
                </p>
                <ApplyButton jobId={job.id} hasProfileCv={!!profileCvUrl} profileCvUrl={profileCvUrl} />
              </div>
            )}

            {(isOwner || isAdmin) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">This is your job posting.</p>
                <ButtonLink href={`/hrd/jobs/${job.id}`} variant="outline">
                  Manage in dashboard
                </ButtonLink>
              </div>
            )}
          </div>

          <div className="mt-10 space-y-8 border-t border-slate-100 pt-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">About this role</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-600">
                {job.description}
              </p>
            </section>

            {job.requirements && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">Requirements</h2>
                <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-600">
                  {job.requirements}
                </p>
              </section>
            )}

            <section className="rounded-xl bg-slate-50 p-5">
              <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
              <dl className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-400">Employment</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {employmentTypeLabel(job.employment_type)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Salary range</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Location</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{job.location ?? "—"}</dd>
                </div>
              </dl>
            </section>
          </div>
        </Card>
      </main>
      <PublicFooter />
    </>
  );
}
