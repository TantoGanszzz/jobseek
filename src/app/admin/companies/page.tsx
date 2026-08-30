import { Avatar, Card, CardBody, EmptyState } from "@/components/ui/DataDisplay";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Companies" };

export default async function AdminCompaniesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data } = await supabase
    .from("companies")
    .select("id, company_name, logo_url, industry, location, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    company_name: string | null;
    logo_url: string | null;
    industry: string | null;
    location: string | null;
    created_at: string;
  }>;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Companies</h1>
        <p className="mt-1 text-sm text-slate-500">Registered employers ({rows.length}).</p>
      </section>

      {rows.length === 0 ? (
        <EmptyState title="No companies yet" description="Companies appear here when HRDs register." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {rows.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Avatar name={c.company_name ?? "C"} url={c.logo_url} size={44} className="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{c.company_name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {[c.industry, c.location].filter(Boolean).join(" · ") || "No details"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    Joined{" "}
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
