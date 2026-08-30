import { Card, CardBody, CardHeader, EmptyState, Badge } from "@/components/ui/DataDisplay";
import { ButtonLink } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { APPLICATION_STATUS_STYLES, formatDate } from "@/lib/utils/format";
import type { ApplicationStatus } from "@/types/database";

export const metadata = { title: "My Applications" };

interface Row {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  cv_url: string | null;
  jobs: {
    id: string;
    title: string;
    location: string | null;
    status: string | null;
    companies: { company_name: string | null } | null;
  } | null;
}

export default async function ApplicationsPage() {
  const user = await requireRole("job_seeker");
  const supabase = await createClient();

  const { data } = await supabase
    .from("applications")
    .select(
      `id, status, applied_at, cv_url,
       jobs ( id, title, location, status, companies ( company_name ) )`
    )
    .eq("applicant_id", user.userId)
    .order("applied_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track the status of every job you&apos;ve applied to.
        </p>
      </section>

      <Card>
        <CardHeader title={`All applications (${rows.length})`} />
        {rows.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            }
            title="You haven't applied to any jobs yet"
            description="When you apply for a job, it will show up here with live status updates."
            action={<ButtonLink href="/jobseeker/jobs" size="sm">Find your first job</ButtonLink>}
          />
        ) : (
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                    <th className="px-5 py-3 font-semibold">Job</th>
                    <th className="px-5 py-3 font-semibold">Company</th>
                    <th className="px-5 py-3 font-semibold">Applied</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">CV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <a
                          href={row.jobs ? `/jobs/${row.jobs.id}` : "#"}
                          className="font-medium text-slate-900 hover:text-cyan-700"
                        >
                          {row.jobs?.title ?? "Job removed"}
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {row.jobs?.companies?.company_name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                        {formatDate(row.applied_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge color={APPLICATION_STATUS_STYLES[row.status]?.className}>
                          {APPLICATION_STATUS_STYLES[row.status]?.label ?? row.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {row.cv_url ? (
                          <span className="text-xs font-medium text-emerald-600">Attached</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        )}
      </Card>
    </div>
  );
}
