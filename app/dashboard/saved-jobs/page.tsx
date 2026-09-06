import type { Metadata } from "next";
import Link from "next/link";
import { getCandidateSavedJobs } from "@/lib/hrd/services";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import RemoveSavedJobButton from "@/components/remove-saved-job-button";
import { Bookmark, Building2, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Saved Jobs — Jobseek",
  description: "Jobs you have bookmarked.",
};

export default async function SavedJobsPage() {
  const dashUser = await getDashboardUser();
  const saved = getCandidateSavedJobs(dashUser.id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Saved Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">Jobs you&apos;ve bookmarked for later.</p>
      </div>

      {saved.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">You haven&apos;t saved any jobs yet.</p>
          <Link href="/dashboard/find-jobs" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-800">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map(({ job, savedAt }) => (
            <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/jobs/${job.id}`} className="font-semibold text-slate-900 hover:text-blue-700">
                    {job.title}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> {job.companyName}
                  </p>
                </div>
                <RemoveSavedJobButton jobId={job.id} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {job.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                )}
                {job.jobType && (
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.jobType}</span>
                )}
                {job.workMode && <span>{job.workMode}</span>}
                {job.salaryRange && <span className="font-medium text-slate-700">{job.salaryRange}</span>}
                <span className="ml-auto text-slate-400">
                  Saved {new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}