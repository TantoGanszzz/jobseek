import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById } from "@/lib/hrd/store";
import { StatusBadge } from "@/components/status-badge";
import { getApplicantsByOwner } from "@/lib/hrd/store";
import UpdateJobStatusButton from "@/components/hrd/update-job-status-button";
import { getDashboardUser } from "@/lib/dashboard-helpers";

export default async function CompanyJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashUser = await getDashboardUser();
  const job = getJobById(id);

  if (!job || job.createdBy !== dashUser.id) notFound();

  const applicantCount = getApplicantsByOwner(dashUser.id).filter((a) => a.jobId === job.id).length;

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
              {job.location || "Remote-friendly"} · {job.jobType} · {job.workMode} · {job.experienceLevel}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-500">Minimum qualification score:</span>
          <span className="font-semibold text-slate-900">{job.minQualificationScore} / 100</span>
          {job.deadline && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Deadline:</span>
              <span className="font-semibold text-slate-900">{job.deadline}</span>
            </>
          )}
        </div>

        <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Applicants</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{applicantCount}</p>
          </div>
          {job.salaryRange && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Salary Range</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{job.salaryRange}</p>
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

        {job.skills.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-slate-900">Required Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        {job.preferredSkills.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-slate-900">Preferred Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.preferredSkills.map((s) => (
                <span key={s} className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/company/applicants?job=${job.id}`} className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            View Applicants
          </Link>
          <UpdateJobStatusButton job={job} />
        </div>
      </div>
    </div>
  );
}