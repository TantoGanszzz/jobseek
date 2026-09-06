import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  let users: any[] = [];
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, onboarding_completed, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    users = data || [];
  } catch {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      users = (data || []).map((u: any) => ({ ...u, onboarding_completed: null }));
    } catch {}
  }

  // We don't have access to email in profiles table reliably, so show name/role
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Manage all platform users.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Onboarding</th>
                <th className="pb-3 pr-4 font-medium">Joined</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{u.full_name || "User"}</td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-sm ${u.onboarding_completed === false ? "font-medium text-amber-600" : "text-emerald-700"}`}>
                        {u.onboarding_completed === false ? "Incomplete" : u.onboarding_completed === true ? "Complete" : "-"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-3">
                        <button type="button" className="text-blue-700 hover:underline cursor-pointer">View</button>
                        <button type="button" className="text-red-600 hover:underline cursor-pointer">Suspend</button>
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