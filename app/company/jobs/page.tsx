import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, Plus } from "lucide-react";

export default async function CompanyJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: "all" | "draft" | "active" | "closed" }>;
}) {
  const params = await searchParams;
  const dashUser = await getDashboardUser();
  const supabase = await createClient();

  const { data: company } = await supabase.from("companies").select("id").eq("created_by", dashUser.id).maybeSingle();
  
  let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
  if (company) query = query.eq("company_id", company.id);
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  if (params.search) query = query.ilike("title", `%${params.search}%`);
  
  const { data: jobsData } = await query;
  const jobs = (jobsData || []).map((j: any) => ({
    ...j,
    jobType: j.job_type,
    workMode: j.work_mode,
    deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : null,
  }));

  const statusFilter = params.status ?? "all";

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Jobs" subtitle="Manage job posts, applicants, and qualification standards.">
        <Link href="/company/jobs/create">
          <Button className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Create Job
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "draft", "closed"] as const).map((s) => (
            <Link
              key={s}
              href={s === "all" ? "/company/jobs" : `/company/jobs?status=${s}`}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "cursor-default border-blue-600 bg-blue-600 text-white"
                  : "cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>

        <form method="GET" action="/company/jobs" className="flex items-center gap-2">
          <input
            type="hidden"
            name="status"
            value={statusFilter === "all" ? "" : statusFilter}
          />
          <input
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Search jobs..."
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-64"
          />
          <Button type="submit" size="sm" className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
            Search
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        {jobs.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title="No jobs found"
            description="Create your first job posting, or adjust your search and filters."
            action={
              <Link href="/company/jobs/create" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Create Job
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Job Title</th>
                  <th className="pb-3 pr-4 font-medium">Location</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Deadline</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job: any) => (
                  <tr key={job.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{job.title}</td>
                    <td className="py-4 pr-4 text-slate-600">{job.location || "-"}</td>
                    <td className="py-4 pr-4 text-slate-600">{job.jobType} · {job.workMode}</td>
                    <td className="py-4 pr-4"><StatusBadge status={job.status} /></td>
                    <td className="py-4 pr-4 text-slate-500">{job.deadline ?? "-"}</td>
                    <td className="py-4">
                      <div className="flex gap-3">
                        <Link href={`/company/jobs/${job.id}`} className="text-blue-700 hover:underline">View</Link>
                        <Link href={`/company/applicants?job=${job.id}`} className="text-slate-600 hover:underline">Applicants</Link>
                      </div>
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
