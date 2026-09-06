import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/stat-card";
import { Activity, BriefcaseBusiness, Building2, ShieldCheck, Users } from "lucide-react";
import { getDashboardUser } from "@/lib/dashboard-helpers";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const dashUser = await getDashboardUser();

  let totalUsers = 0;
  let totalHrd = 0;
  let totalCompanies = 0;
  let activeJobs = 0;
  let applications = 0;
  let pendingJobs = 0;

  try {
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user");
    totalUsers = count ?? 0;
  } catch {}
  try {
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "hrd");
    totalHrd = count ?? 0;
  } catch {}
  try {
    const { count } = await supabase.from("companies").select("id", { count: "exact", head: true });
    totalCompanies = count ?? 0;
  } catch {}
  try {
    const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "active");
    activeJobs = count ?? 0;
  } catch {}
  try {
    const { count } = await supabase.from("applications").select("id", { count: "exact", head: true });
    applications = count ?? 0;
  } catch {}
  try {
    const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending");
    pendingJobs = count ?? 0;
  } catch {}

  // Recent users
  let recentUsers: any[] = [];
  try {
    const { data } = await supabase.from("profiles").select("full_name, role, created_at").order("created_at", { ascending: false }).limit(5);
    recentUsers = data || [];
  } catch {}

  // Recent companies
  let recentCompanies: any[] = [];
  try {
    const { data } = await supabase.from("companies").select("name, status, created_at").order("created_at", { ascending: false }).limit(5);
    recentCompanies = data || [];
  } catch {}

  // Recent jobs
  let recentJobs: any[] = [];
  try {
    const { data } = await supabase.from("jobs").select("title, status, created_at, company:companies(name)").order("created_at", { ascending: false }).limit(5);
    recentJobs = data || [];
  } catch {}

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Good morning, {dashUser.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Monitor and manage the Jobseek platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon={Users} detail="Registered users" />
        <StatCard label="Total Companies" value={totalCompanies.toLocaleString()} icon={Building2} detail="Companies" />
        <StatCard label="Total HRD" value={totalHrd.toLocaleString()} icon={ShieldCheck} detail="Recruitment teams" />
        <StatCard label="Active Jobs" value={activeJobs.toLocaleString()} icon={BriefcaseBusiness} detail="Open roles" />
        <StatCard label="Applications" value={applications.toLocaleString()} icon={Activity} detail="Across all jobs" />
        <StatCard label="Pending Moderation" value={pendingJobs.toLocaleString()} icon={Activity} detail="Needs review" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-500">No users yet.</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="text-sm font-medium text-slate-900">{u.full_name || "User"}</span>
                  <span className="text-xs text-slate-500 uppercase">{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Companies</h2>
          {recentCompanies.length === 0 ? (
            <p className="text-sm text-slate-500">No companies yet.</p>
          ) : (
            <div className="space-y-2">
              {recentCompanies.map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  <span className="text-xs text-slate-500 uppercase">{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Jobs</h2>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-slate-500">No jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((j, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-slate-900">{j.title}</span>
                    <span className="ml-2 text-xs text-slate-500">{j.company?.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 uppercase">{j.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Pending Actions</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <span className="text-sm text-slate-600">Jobs pending moderation</span>
              <span className="font-medium text-blue-700">{pendingJobs}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <span className="text-sm text-slate-600">Total applications</span>
              <span className="font-medium text-blue-700">{applications}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}