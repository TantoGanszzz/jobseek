import Link from "next/link";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui/DataDisplay";
import { StatCard } from "@/components/dashboard/StatCard";
import { AreaChart, BarChart, ChartCard, DonutChart } from "@/components/dashboard/Charts";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { APPLICATION_STATUS_STYLES, formatDate } from "@/lib/utils/format";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = await createClient();

  // All counts in parallel.
  const [profilesRes, companiesRes, jobsRes, appsRes] = await Promise.all([
    supabase.from("profiles").select("role"),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("status, created_at"),
    supabase.from("applications").select("id, status, applied_at").order("applied_at", { ascending: false }).limit(500),
  ]);

  const profiles = (profilesRes.data ?? []) as Array<{ role: string }>;
  const jobs = (jobsRes.data ?? []) as Array<{ status: string; created_at: string }>;
  const apps = (appsRes.data ?? []) as Array<{ id: string; status: string; applied_at: string }>;

  const totalUsers = profiles.length;
  const hrdCount = profiles.filter((p) => p.role === "hrd").length;
  const seekerCount = profiles.filter((p) => p.role === "job_seeker").length;
  const activeJobs = jobs.filter((j) => j.status === "published").length;
  const pendingJobs = jobs.filter((j) => j.status === "pending").length;

  // Applications per day for the last 14 days.
  const days: string[] = [];
  const counts: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(key.slice(5));
    counts.push(
      apps.filter((a) => a.applied_at.slice(0, 10) === key).length
    );
  }

  // Jobs created per month for the last 6 months.
  const months: string[] = [];
  const jobCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    months.push(d.toLocaleString("en-US", { month: "short" }));
    jobCounts.push(jobs.filter((j) => j.created_at.slice(0, 7) === key).length);
  }

  // Role distribution donut + application status donut.
  const roleDonut = [
    { label: "Job Seekers", value: seekerCount, color: "#06b6d4" },
    { label: "HRD", value: hrdCount, color: "#8b5cf6" },
    { label: "Admins", value: totalUsers - seekerCount - hrdCount, color: "#f59e0b" },
  ];
  const appStatuses = ["applied", "reviewing", "shortlisted", "interview", "accepted", "rejected"] as const;
  const statusDonut = appStatuses.map((s, i) => ({
    label: APPLICATION_STATUS_STYLES[s].label,
    value: apps.filter((a) => a.status === s).length,
    color: ["#06b6d4", "#8b5cf6", "#f59e0b", "#3b82f6", "#10b981", "#ef4444"][i],
  }));

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide overview.</p>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} icon="users" />
        <StatCard label="Companies" value={companiesRes.count ?? 0} icon="building" accent="violet" />
        <StatCard label="Active Jobs" value={activeJobs} icon="briefcase" accent="emerald" />
        <StatCard
          label="Pending Approvals"
          value={pendingJobs}
          icon="clipboard"
          accent="amber"
          hint={pendingJobs > 0 ? "Needs review" : undefined}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Applications — last 14 days">
          <AreaChart data={days.map((d, i) => ({ label: d, value: counts[i] }))} />
        </ChartCard>
        <ChartCard title="Jobs posted — last 6 months">
          <BarChart data={months.map((m, i) => ({ label: m, value: jobCounts[i] }))} />
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="User roles">
          <DonutChart data={roleDonut} />
        </ChartCard>
        <ChartCard title="Application statuses (latest 500)">
          <DonutChart data={statusDonut} />
        </ChartCard>
      </section>

      <Card>
        <CardHeader
          title="Latest applications"
          description="Most recent activity across the platform."
          action={
            <Link href="/admin/applications" className="text-sm font-medium text-cyan-600 hover:text-cyan-700">
              View all →
            </Link>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Candidate</th>
                  <th className="px-5 py-3 font-semibold">Applied at</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.slice(0, 6).map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">Application #{a.id.slice(0, 8)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(a.applied_at)}</td>
                    <td className="px-5 py-3.5">
                      <Badge color={APPLICATION_STATUS_STYLES[a.status as keyof typeof APPLICATION_STATUS_STYLES]?.className}>
                        {APPLICATION_STATUS_STYLES[a.status as keyof typeof APPLICATION_STATUS_STYLES]?.label ?? a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {apps.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400">
                      No applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
