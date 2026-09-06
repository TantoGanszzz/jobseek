import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminJobsPage() {
  const supabase = await createClient();

  let jobs: any[] = [];
  try {
    const { data } = await supabase
      .from("jobs")
      .select("id, title, status, created_at, company:companies(name)")
      .order("created_at", { ascending: false });
    jobs = data || [];
  } catch {}

  const jobIds = jobs.map((j) => j.id);
  let appCounts: Record<string, number> = {};
  if (jobIds.length > 0) {
    try {
      const { data } = await supabase.from("applications").select("job_id");
      (data || []).forEach((a: any) => {
        appCounts[a.job_id] = (appCounts[a.job_id] || 0) + 1;
      });
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor and moderate all job postings.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-medium">Job</th>
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Applicants</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No jobs found.</td></tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{j.title}</td>
                    <td className="py-4 pr-4 text-slate-700">{j.company?.name}</td>
                    <td className="py-4 pr-4"><StatusBadge status={j.status || "draft"} /></td>
                    <td className="py-4 pr-4 text-slate-700">{appCounts[j.id] || 0}</td>
                    <td className="py-4">
                      <div className="flex gap-3">
                        <button type="button" className="text-blue-700 hover:underline cursor-pointer">Review</button>
                        <button type="button" className="text-slate-600 hover:underline cursor-pointer">Approve</button>
                        <button type="button" className="text-red-600 hover:underline cursor-pointer">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}