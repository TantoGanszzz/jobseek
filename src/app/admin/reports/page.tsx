import { Card, CardBody, CardHeader } from "@/components/ui/DataDisplay";
import { AreaChart, BarChart, ChartCard } from "@/components/dashboard/Charts";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { formatSalary } from "@/lib/utils/format";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [appsRes, jobsRes] = await Promise.all([
    supabase
      .from("applications")
      .select("applied_at, status")
      .order("applied_at", { ascending: false })
      .limit(1000),
    supabase.from("jobs").select("title, salary_min, salary_max, employment_type").eq("status", "published"),
  ]);

  const apps = appsRes.data ?? [];
  const jobs = jobsRes.data ?? [];

  // Applications per week for the last 8 weeks.
  const weeks: string[] = [];
  const weekCounts: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i * 7 - 6);
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    weeks.push(`W-${i}`);
    weekCounts.push(
      apps.filter((a) => {
        const t = new Date(a.applied_at).getTime();
        return t >= start.getTime() && t <= end.getTime();
      }).length
    );
  }

  // Top hiring statuses funnel.
  const funnel = [
    "applied",
    "reviewing",
    "shortlisted",
    "interview",
    "accepted",
  ] as const;
  const funnelData = funnel.map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: apps.filter((a) => a.status === s).length,
  }));

  // Average advertised salary by employment type.
  const types = ["full_time", "part_time", "internship", "contract", "freelance"] as const;
  const salaryData = types
    .map((t) => {
      const subset = jobs.filter((j) => j.employment_type === t && j.salary_min);
      const avg =
        subset.length > 0
          ? Math.round(
              subset.reduce((sum, j) => sum + ((j.salary_min ?? 0) + (j.salary_max ?? j.salary_min ?? 0)) / 2, 0) /
                subset.length
            )
          : 0;
      return { label: t.replace("_", "-"), value: avg };
    })
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hiring trends across the platform.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Applications per week — last 8 weeks">
          <AreaChart data={weeks.map((w, i) => ({ label: w, value: weekCounts[i] }))} />
        </ChartCard>
        <ChartCard title="Application funnel">
          <BarChart data={funnelData} />
        </ChartCard>
      </div>

      <Card className="max-w-3xl">
        <CardHeader
          title="Average advertised salary by type"
          description="Midpoint of published salary ranges."
        />
        <CardBody className="space-y-3">
          {salaryData.length === 0 ? (
            <p className="text-sm text-slate-400">No published salary data yet.</p>
          ) : (
            salaryData.map((d) => (
              <div key={d.label} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium capitalize text-slate-700">{d.label.replace("-", "-")}</span>
                <span className="text-sm font-semibold text-cyan-700">
                  {formatSalary(null, d.value)}
                  <span className="font-normal text-slate-400"> / mo avg.</span>
                </span>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
