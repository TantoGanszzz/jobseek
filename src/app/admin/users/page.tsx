import { Avatar, Badge, Card, CardBody, EmptyState } from "@/components/ui/DataDisplay";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Users" };

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-cyan-100 text-cyan-700",
  hrd: "bg-violet-100 text-violet-700",
  job_seeker: "bg-emerald-100 text-emerald-700",
};

interface Row {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requireRole("admin");
  const { q, role } = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("user_id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (role === "hrd" || role === "job_seeker" || role === "admin") {
    query = query.eq("role", role);
  }
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data } = await query;
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-500">All registered accounts ({rows.length}).</p>
      </section>

      <form className="flex flex-wrap gap-3" action="/admin/users">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name..."
          className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-2 focus:outline-cyan-500"
        />
        <select
          name="role"
          defaultValue={role ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm"
        >
          <option value="">All roles</option>
          <option value="job_seeker">Job Seekers</option>
          <option value="hrd">HRD</option>
          <option value="admin">Admins</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your filters." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3.5 font-semibold">User</th>
                    <th className="px-5 py-3.5 font-semibold">Role</th>
                    <th className="px-5 py-3.5 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((u) => (
                    <tr key={u.user_id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name ?? "U"} size={36} />
                          <div>
                            <p className="font-semibold text-slate-900">{u.full_name}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge color={ROLE_BADGE[u.role]}>
                          {u.role === "job_seeker" ? "Job Seeker" : u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">{formatDate(u.created_at)}</td>
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
