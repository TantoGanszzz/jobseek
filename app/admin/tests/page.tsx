import { createClient } from "@/lib/supabase/server";

export default async function AdminTestsPage() {
  const supabase = await createClient();

  let tests: any[] = [];
  try {
    const { data } = await supabase
      .from("applications")
      .select("id, status, score, job:jobs(title, min_qualification_score), user_profile:profiles!applications_user_id_fkey(full_name)")
      .order("applied_at", { ascending: false })
      .limit(100);
    tests = (data || []).filter((t: any) => t.score != null);
  } catch {
    try {
      const { data } = await supabase
        .from("applications")
        .select("id, status, score, job:jobs(title, min_qualification_score)")
        .order("applied_at", { ascending: false })
        .limit(100);
      tests = (data || []).filter((t: any) => t.score != null);
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Qualification Tests</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of completed qualification tests.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-medium">Candidate</th>
                <th className="pb-3 pr-4 font-medium">Job</th>
                <th className="pb-3 pr-4 font-medium">Minimum</th>
                <th className="pb-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500">No completed tests found.</td></tr>
              ) : (
                tests.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{t.user_profile?.full_name || "Candidate"}</td>
                    <td className="py-4 pr-4 text-slate-700">{t.job?.title || "Position"}</td>
                    <td className="py-4 pr-4 text-slate-700">{t.job?.min_qualification_score ?? 70} / 100</td>
                    <td className="py-4">
                      <span className={t.score >= (t.job?.min_qualification_score ?? 70) ? "font-medium text-green-700" : "font-medium text-red-600"}>
                        {t.score} / 100
                      </span>
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