import { Badge, Card, CardBody, EmptyState } from "@/components/ui/DataDisplay";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { APPLICATION_STATUS_STYLES, formatDate } from "@/lib/utils/format";

export const metadata = { title: "Applications" };

interface Row {
  id: string;
  status: string;
  applied_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
  jobs: { id: string; title: string } | null;
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole("admin");
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const pageSize = 30;

  const supabase = await createClient();

  const [{ count }, { data }] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select(
        `id, status, applied_at,
         profiles (full_name, email),
         jobs (id, title)`
      )
      .order("applied_at", { ascending: false })
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1),
  ]);

  const rows = (data ?? []) as unknown as Row[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          All job applications across the platform ({count ?? 0}).
        </p>
      </section>

      {rows.length === 0 ? (
        <EmptyState title="No applications yet" />
      ) : (
        <>
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3.5 font-semibold">Candidate</th>
                      <th className="px-5 py-3.5 font-semibold">Job</th>
                      <th className="px-5 py-3.5 font-semibold">Applied</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{a.profiles?.full_name ?? "Candidate"}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{a.profiles?.email}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{a.jobs?.title}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">{formatDate(a.applied_at)}</td>
                        <td className="px-5 py-4">
                          <Badge color={APPLICATION_STATUS_STYLES[a.status as keyof typeof APPLICATION_STATUS_STYLES]?.className}>
                            {APPLICATION_STATUS_STYLES[a.status as keyof typeof APPLICATION_STATUS_STYLES]?.label ?? a.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between" aria-label="Pagination">
              {currentPage > 1 ? (
                <a
                  href={`/admin/applications?page=${currentPage - 1}`}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  ← Previous
                </a>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <a
                  href={`/admin/applications?page=${currentPage + 1}`}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Next →
                </a>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
