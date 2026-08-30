import { Card, CardBody, EmptyState } from "@/components/ui/DataDisplay";
import { ApplicationStatusSelect } from "@/components/hrd/ApplicationStatusSelect";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Applicants" };

interface Row {
  id: string;
  status: string;
  applied_at: string;
  cv_url: string | null;
  profiles: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    position: string | null;
    avatar_url: string | null;
    cv_url: string | null;
  } | null;
  jobs: { id: string; title: string } | null;
}

export default async function ApplicantsPage() {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const { data } = await supabase
    .from("applications")
    .select(
      `id, status, applied_at, cv_url,
       jobs!inner (id, title, created_by),
       profiles (user_id, full_name, email, position, avatar_url, cv_url)`
    )
    .eq("jobs.created_by", user.userId)
    .order("applied_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Applicants</h1>
        <EmptyState
          title="No applicants yet"
          description="Once candidates apply to your published jobs, they'll show up here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Applicants</h1>
        <p className="mt-1 text-sm text-slate-500">
          All candidates across your job posts ({rows.length}).
        </p>
      </section>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3.5 font-semibold">Candidate</th>
                  <th className="px-5 py-3.5 font-semibold">Job</th>
                  <th className="px-5 py-3.5 font-semibold">Applied</th>
                  <th className="px-5 py-3.5 font-semibold">CV</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {a.profiles?.full_name ?? "Candidate"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{a.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{a.jobs?.title}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(a.applied_at)}
                    </td>
                    <td className="px-5 py-4">
                      {a.cv_url || a.profiles?.cv_url ? (
                        <a
                          href={`/hrd/applicants/cv?app=${a.id}`}
                          target="_blank"
                          rel="noopener"
                          className="text-xs font-medium text-cyan-600 hover:text-cyan-700 hover:underline"
                        >
                          View CV ↗
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <ApplicationStatusSelect applicationId={a.id} status={a.status as never} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
