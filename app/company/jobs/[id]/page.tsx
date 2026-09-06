import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import UpdateJobStatusButton from "@/components/hrd/update-job-status-button";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { createClient } from "@/lib/supabase/server";

export default async function CompanyJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashUser = await getDashboardUser();
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, companies!inner(id, created_by)")
    .eq("id", id)
    .single();

  if (!job || (job as any).companies?.created_by !== dashUser.id) notFound();

  const { count: applicantCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("job_id", job.id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <Link href="/company/jobs" className="text-sm text-blue-700 hover:text-blue-800">← Back to jobs</Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {job.location || "Remote-friendly"} · {job.job_type} · {job.work_mode} · {job.experience_level}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-500">Minimum qualification score:</span>
          <span className="font-semibold text-slate-900">{job.min_qualification_score} / 100</span>
          {job.deadline && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Deadline:</span>
              <span className="font-semibold text-slate-900">{new Date(job.deadline).toLocaleDateString()}</span>
            </>
          )}
        </div>

        <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Applicants</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{applicantCount || 0}</p>
          </div>
          {job.salary_range && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Salary Range</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{job.salary_range}</p>
            </div>
          )}
        </div>

        {job.description && (
          <div className="mt-5">
            <h2 className="text-base font-semibold text-slate-900">About the role</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{job.description}</p>
          </div>
        )}

        {job.responsibilities && (
          <div className="mt-5">
            <h2 className="text-base font-semibold text-slate-900">Responsibilities</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{job.responsibilities}</p>
          </div>
        )}

        {job.requirements && (
          <div className="mt-5">
            <h2 className="text-base font-semibold text-slate-900">Requirements</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{job.requirements}</p>
          </div>
        )}

        {(job.skills || []).length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-slate-900">Required Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {(job.skills || []).map((s: string) => (
                <span key={s} className="rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        {(job.preferred_skills || []).length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-slate-900">Preferred Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {(job.preferred_skills || []).map((s: string) => (
                <span key={s} className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/company/applicants?job=${job.id}`} className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            View Applicants
          </Link>
          <UpdateJobStatusButton job={job as any} />
        </div>
      </div>
    </div>
  );
}