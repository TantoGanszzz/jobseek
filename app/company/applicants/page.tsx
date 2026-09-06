import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getApplicants, getJobs } from "@/lib/hrd/services";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Users } from "lucide-react";

const STATUS_FILTERS = ["all", "new", "screening", "interview", "test", "hired", "rejected"] as const;

export default async function CompanyApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const dashUser = await getDashboardUser();
  const jobs = getJobs(dashUser.id);
  const jobFilter = params.job ?? "";
  const statusFilter = params.status ?? "";
  const applicants = getApplicants(dashUser.id, {
    jobId: jobFilter || undefined,
    status: statusFilter,
    search: params.search ?? "",
  });

  // Signed-in candidates apply from the candidate site. Until the database is
  // connected there is nothing to review yet — the (honest) empty state below
  // communicates that.
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Applicants" subtitle="Review candidates who applied to your jobs." />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={`/company/applicants?status=${s === "all" ? "" : s}${jobFilter ? `&job=${jobFilter}` : ""}`}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s || (s === "all" && statusFilter === "")
                  ? "cursor-default border-blue-600 bg-blue-600 text-white"
                  : "cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>

        {jobs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/company/applicants${statusFilter ? `?status=${statusFilter}` : ""}`}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${!jobFilter ? "border-blue-600 bg-blue-600 text-white" : "cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
            >
              All Jobs
            </Link>
            {jobs.map((j) => (
              <Link
                key={j.id}
                href={`/company/applicants?job=${j.id}${statusFilter ? `&status=${statusFilter}` : ""}`}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${jobFilter === j.id ? "border-blue-600 bg-blue-600 text-white" : "cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
              >
                {j.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        {applicants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants found"
            description="Once candidates start applying to your jobs, their applications land here for screening, testing, and hiring."
            action={
              <Link href="/company/jobs/create" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Post a Job
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Candidate</th>
                  <th className="pb-3 pr-4 font-medium">Headline</th>
                  <th className="pb-3 pr-4 font-medium">Match</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Applied</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => (
                  <tr key={app.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{app.candidateName}</td>
                    <td className="py-4 pr-4 text-slate-500">{app.candidateHeadline ?? "-"}</td>
                    <td className="py-4 pr-4 text-slate-700">{app.matchScore != null ? `${app.matchScore}%` : "-"}</td>
                    <td className="py-4 pr-4"><StatusBadge status={app.status} /></td>
                    <td className="py-4 pr-4 text-slate-500">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                    </td>
                    <td className="py-4">
                      <Link href={`/company/applicants/${app.id}`} className="text-blue-700 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}