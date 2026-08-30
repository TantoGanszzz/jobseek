import Link from "next/link";
import { Badge, Card, CardBody, EmptyState } from "@/components/ui/DataDisplay";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Jobs" };

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  pending: { label: "Pending review", className: "bg-amber-100 text-amber-700" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", className: "bg-red-100 text-red-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

const FILTERS = ["all", "pending", "published", "draft", "closed", "rejected"] as const;

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status } = await searchParams;
  const active = FILTERS.includes((status ?? "all") as (typeof FILTERS)[number])
    ? (status ?? "all")
    : "all";

  const supabase = await createClient();
  let query = supabase
    .from("jobs")
    .select(
      `id, title, status, created_at,
       companies ( company_name )`
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (active !== "all") query = query.eq("status", active);

  const { data: jobs } = await query;
  const rows = (jobs ?? []) as unknown as Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    companies: { company_name: string | null } | null;
  }>;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review submissions and moderate all job postings.
        </p>
      </section>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/jobs?status=${f}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              active === f
                ? "bg-cyan-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All" : STATUS_BADGE[f]?.label ?? f}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title="No jobs found" description="No job posts match this filter." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3.5 font-semibold">Job</th>
                    <th className="px-5 py-3.5 font-semibold">Company</th>
                    <th className="px-5 py-3.5 font-semibold">Created</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((j) => (
                    <tr key={j.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="max-w-[280px] px-5 py-4">
                        <Link href={`/jobs/${j.id}`} className="font-semibold text-slate-900 hover:text-cyan-600">
                          <span className="line-clamp-1">{j.title}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{j.companies?.company_name}</td>
                      <td className="px-5 py-4 text-xs text-slate-500">{formatDate(j.created_at)}</td>
                      <td className="px-5 py-4">
                        <Badge color={STATUS_BADGE[j.status]?.className}>{STATUS_BADGE[j.status]?.label ?? j.status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          {j.status === "pending" ? (
                            <ModerationActions jobId={j.id} />
                          ) : j.status === "published" ? (
                            <ModerationActions jobId={j.id} />
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
