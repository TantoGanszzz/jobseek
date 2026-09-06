import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import AdminCompanyActions from "@/components/admin-company-actions";

export default async function AdminCompaniesPage() {
  const supabase = await createClient();

  let companies: any[] = [];
  try {
    const { data } = await supabase
      .from("companies")
      .select("id, name, status, industry, company_size, created_at, created_by, owner:profiles!companies_created_by_fkey(full_name)")
      .order("created_at", { ascending: false });
    companies = data || [];
  } catch {
    try {
      const { data } = await supabase
        .from("companies")
        .select("id, name, status, industry, company_size, created_at, created_by")
        .order("created_at", { ascending: false });
      companies = (data || []).map((c: any) => ({ ...c, owner: null }));
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Companies</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review company verification status and manage moderation.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium">HRD</th>
                <th className="pb-3 pr-4 font-medium">Industry</th>
                <th className="pb-3 pr-4 font-medium">Size</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Created</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-500">No companies found.</td></tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-medium text-slate-900">{c.name}</td>
                    <td className="py-4 pr-4 text-slate-700">{c.owner?.full_name || "-"}</td>
                    <td className="py-4 pr-4 text-slate-700">{c.industry || "-"}</td>
                    <td className="py-4 pr-4 text-slate-700">{c.company_size || "-"}</td>
                    <td className="py-4 pr-4"><StatusBadge status={c.status || "pending"} /></td>
                    <td className="py-4 pr-4 text-slate-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                    </td>
                    <td className="py-4"><AdminCompanyActions companyId={c.id} /></td>
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