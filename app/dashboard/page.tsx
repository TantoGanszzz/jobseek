import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Star,
  CalendarCheck,
  ListTodo,
  FolderKanban,
  MessageSquare,
} from "lucide-react";
import { getDashboardUser, calculateProfileStrength, getProfileFromAuthUser } from "@/lib/dashboard-helpers";
import { generateCareerRecommendationsFromProfile } from "@/lib/recommendations";
import { ApplicantStatusBadge } from "@/components/applicant-status-badge";
import { APPLICANT_STATUS_LABELS } from "@/lib/hrd/applicant-status";

export const metadata: Metadata = {
  title: "Dashboard — Jobseek",
  description: "Career dashboard overview for Jobseek candidates.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const dashUser = await getDashboardUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = getProfileFromAuthUser(user);
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const location = typeof profile.location === "string" ? profile.location : null;
  const preferredWorkType = Array.isArray(profile.preferred_work_type)
    ? profile.preferred_work_type
    : undefined;
  const preferredRoles = Array.isArray(profile.preferred_roles)
    ? profile.preferred_roles
    : undefined;
  const education = typeof profile.education === "string" ? profile.education : typeof profile.education_level === "string" ? profile.education_level : null;

  const profileStrength = calculateProfileStrength(profile);

  // Fetch applications
  const { data: applicationsData } = await supabase
    .from("applications")
    .select("id, status, applied_at, jobs(id, title, min_qualification_score, location, job_type, work_mode, companies(name))")
    .eq("user_id", dashUser.id)
    .order("applied_at", { ascending: false });
  const applications = applicationsData || [];

  // Fetch saved jobs
  const { count: savedCount } = await supabase
    .from("saved_jobs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", dashUser.id);

  // Fetch tests
  const { data: testsData } = await supabase
    .from("test_assignments")
    .select("status, passed")
    .eq("candidate_id", dashUser.id);
  const tests = testsData || [];

  // Fetch recommended jobs (basic fetch for now)
  const { data: recommendedJobsData } = await supabase
    .from("jobs")
    .select("id, title, location, job_type, work_mode, min_qualification_score, companies(name)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch unread notifications
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", dashUser.id)
    .eq("read", false);

  // Check if employee
  const { data: employeeData } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", dashUser.id)
    .maybeSingle();
  const employee = employeeData || null;

  const completedTests = tests.filter((t: any) => t.status === "completed" || t.status === "reviewed");
  const testsPassed = completedTests.filter((t: any) => t.passed).length;
  
  // Calculate active statuses
  const activeStatuses = applications.filter(
    (a: any) => a.status !== "hired" && a.status !== "rejected"
  ).length;

  const stats = [
    {
      label: "Applications",
      value: applications.length,
      href: "/dashboard/applications",
      icon: BriefcaseBusiness,
      helper: "View all",
    },
    {
      label: "Saved Jobs",
      value: savedCount || 0,
      href: "/dashboard/saved-jobs",
      icon: Bookmark,
      helper: "View saved",
    },
    {
      label: "Interviews",
      value: 0, // Simplified for now
      href: "/dashboard/applications",
      icon: CalendarCheck,
      helper: "Upcoming",
    },
    {
      label: "Tests Completed",
      value: completedTests.length,
      href: "/dashboard/tests",
      icon: CheckCircle2,
      helper: "Results",
    },
  ];

  const recentApplications = applications.slice(0, 4);
  const recommendedJobs = recommendedJobsData || [];

  // Career recommendations (stored in metadata or generated from profile).
  const metadata = (user?.user_metadata || {}) as Record<string, unknown>;
  let recommendedCareers: { career_name: string; match_score: number; reason: string }[] = [];
  const storedRecs = metadata.career_recommendations;
  if (Array.isArray(storedRecs) && storedRecs.length > 0) {
    recommendedCareers = (storedRecs as Record<string, unknown>[])
      .map((r) => ({
        career_name: (r.careerName ?? r.career_name) as string,
        match_score: Number(r.matchScore ?? r.match_score ?? 0),
        reason: String(r.reason ?? ""),
      }))
      .slice(0, 3);
  } else {
    recommendedCareers = generateCareerRecommendationsFromProfile(profile)
      .slice(0, 3)
      .map((r) => ({
        career_name: r.careerName,
        match_score: r.matchScore,
        reason: r.reason,
      }));
  }

  const openTasks = 0;
  const employeeProjectsCount = 0;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Good morning, {dashUser.name}
          {(unreadNotifications || 0) > 0 && (
            <span className="ml-3 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {unreadNotifications} new notification{unreadNotifications !== 1 ? "s" : ""}
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s your recruitment and work activity overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <Link href={stat.href} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-700">
              {stat.helper}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
        <div className="space-y-6 min-w-0">
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
              <Link href="/dashboard/applications" className="text-sm font-medium text-blue-700 hover:text-blue-800">View all</Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                You haven&apos;t applied to any jobs yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app: any) => {
                  const job = app.jobs;
                  return (
                  <Link
                    key={app.id}
                    href={`/dashboard/applications/${app.id}`}
                    className="flex flex-col rounded-lg border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-blue-200 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{job?.title ?? "Position"}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{job?.companies?.name ?? "Company"}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 md:mt-0 md:justify-end">
                      {app.status !== "hired" && app.status !== "rejected" ? (
                        <div className="text-xs font-medium text-slate-500">
                          {APPLICANT_STATUS_LABELS[app.status as keyof typeof APPLICANT_STATUS_LABELS] || app.status}
                        </div>
                      ) : null}
                      <ApplicantStatusBadge status={app.status} />
                      <div className="text-xs text-slate-400">
                        {new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </Link>
                )})}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Recommended Jobs</h2>
              <Link href="/dashboard/find-jobs" className="text-sm font-medium text-blue-700 hover:text-blue-800">Find jobs</Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No jobs available right now.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedJobs.map((job: any, idx: number) => {
                  const companyName = job.companies?.name || "Company";
                  return (
                  <Link key={idx} href={`/dashboard/jobs/${job.id}`} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-slate-900">{job.title}</div>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">{companyName}</div>
                    <div className="mt-2 text-xs text-slate-500">{job.location} · {job.job_type} · {job.work_mode}</div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Minimum score: {job.min_qualification_score} / 100</span>
                      <span className="font-medium text-blue-700">View Job</span>
                    </div>
                  </Link>
                )})}
              </div>
            )}
          </section>

          {employee && (
            <section className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Work Overview</h2>
                <Link href="/dashboard/workspace/tasks" className="text-sm font-medium text-blue-700 hover:text-blue-800">Open workspace</Link>
              </div>
              <p className="text-sm text-slate-500">
                You are an active team member. Here&apos;s your workload at a glance.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Link href="/dashboard/workspace/tasks" className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <ListTodo className="h-5 w-5 text-blue-600" />
                  <p className="mt-2 text-2xl font-bold text-slate-900">{openTasks}</p>
                  <p className="text-xs text-slate-500">Open tasks</p>
                </Link>
                <Link href="/dashboard/workspace/projects" className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <FolderKanban className="h-5 w-5 text-blue-600" />
                  <p className="mt-2 text-2xl font-bold text-slate-900">{employeeProjectsCount}</p>
                  <p className="text-xs text-slate-500">Projects</p>
                </Link>
                <Link href="/dashboard/workspace/messages" className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <p className="mt-2 text-2xl font-bold text-slate-900">Chat</p>
                  <p className="text-xs text-slate-500">Messages</p>
                </Link>
              </div>
            </section>
          )}

          {recommendedCareers.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Recommended Careers</h2>
                <Link href="/dashboard/career" className="text-sm font-medium text-blue-700 hover:text-blue-800">View all</Link>
              </div>
              <div className="space-y-3">
                {recommendedCareers.map((career, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900">{career.career_name}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {String(career.reason || "").split("\n")[0]}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {career.match_score}% Match
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">Profile Strength</h3>
              <span className="text-lg font-bold text-blue-700">{profileStrength}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${profileStrength}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-500">Complete your profile to improve your chances.</p>
            <Link href="/dashboard/profile">
              <Button className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700">Complete Profile</Button>
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-900">Career Activity</h3>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-slate-600">Applications</span>
                <span className="font-medium text-blue-700">{applications.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-slate-600">Saved roles</span>
                <span className="font-medium text-blue-700">{savedCount || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-slate-600">Active statuses</span>
                <span className="font-medium text-blue-700">{activeStatuses}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-slate-600">Tests passed</span>
                <span className="font-medium text-blue-700">{testsPassed}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="flex items-center gap-1 text-slate-600">
                  <Star className="h-3.5 w-3.5 text-slate-400" /> Profile strength
                </span>
                <span className="font-medium text-blue-700">{profileStrength}%</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}