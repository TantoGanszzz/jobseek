import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminHrdPage() {
  const supabase = await createClient();

  let hrd: any[] = [];
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .eq("role", "hrd")
      .order("created_at", { ascending: false });
    hrd = data || [];
  } catch {}

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">HRD</h1>
        <p className="mt-1 text-sm text-slate-500">Manage HRD / recruitment accounts.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-medium">HRD</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Joined</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {hrd.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500">No HRD accounts found.</td></tr>
              ) : (
                hrd.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{h.full_name || "HRD"}</td>
                    <td className="py-4 pr-4"><StatusBadge status="active" /></td>
                    <td className="py-4 pr-4 text-slate-500">
                      {h.created_at ? new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
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