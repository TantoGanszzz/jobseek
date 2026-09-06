import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminApplicationsPage() {
  const supabase = await createClient();

  let applications: any[] = [];
  try {
    const { data } = await supabase
      .from("applications")
      .select("id, status, score, applied_at, job:jobs(id, title), user_profile:profiles!applications_user_id_fkey(full_name)")
      .order("applied_at", { ascending: false })
      .limit(100);
    applications = data || [];
  } catch {
    try {
      const { data } = await supabase
        .from("applications")
        .select("id, status, score, applied_at, job:jobs(title)")
        .order("applied_at", { ascending: false })
        .limit(100);
      applications = data || [];
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Applications</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor all applications across the platform.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-medium">Candidate</th>
                <th className="pb-3 pr-4 font-medium">Job</th>
                <th className="pb-3 pr-4 font-medium">Qualification Score</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No applications found.</td></tr>
              ) : (
                applications.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{a.user_profile?.full_name || "Candidate"}</td>
                    <td className="py-4 pr-4 text-slate-700">{a.job?.title || "Position"}</td>
                    <td className="py-4 pr-4 text-slate-700">{a.score != null ? `${a.score} / 100` : "Pending"}</td>
                    <td className="py-4 pr-4"><StatusBadge status={a.status || "submitted"} /></td>
                    <td className="py-4 text-slate-500">
                      {a.applied_at ? new Date(a.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
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