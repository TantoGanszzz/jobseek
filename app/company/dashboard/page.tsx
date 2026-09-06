import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getHrdDashboard } from "@/lib/hrd/services";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  FilePlus2,
  MessageSquare,
  Users,
  Users2,
} from "lucide-react";

export default async function CompanyDashboardPage() {
  const dashUser = await getDashboardUser();
  const data = getHrdDashboard(dashUser.id);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={`Good day, ${dashUser.name}`} subtitle="Here's your company workspace overview." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Jobs" value={data.activeJobs} icon={BriefcaseBusiness} detail="Live openings" />
        <StatCard label="Applicants" value={data.totalApplicants} icon={Users} detail={`${data.screeningApplicants} in screening`} />
        <StatCard label="Employees" value={data.employees} icon={Users2} detail="Hired team members" />
        <StatCard label="Pending Tasks" value={data.pendingTasks} icon={ClipboardList} detail={`${data.hiringInProgress} hires in progress`} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/company/jobs/create">
          <Button className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
            <FilePlus2 className="mr-2 h-4 w-4" /> Post Job
          </Button>
        </Link>
        <Link href="/company/applicants">
          <Button className="w-full cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <Users className="mr-2 h-4 w-4" /> Applicants
          </Button>
        </Link>
        <Link href="/company/tasks/create">
          <Button className="w-full cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ClipboardList className="mr-2 h-4 w-4" /> New Task
          </Button>
        </Link>
        <Link href="/company/messages">
          <Button className="w-full cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <MessageSquare className="mr-2 h-4 w-4" /> Messages
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
            <Link href="/company/applicants" className="text-sm font-medium text-blue-700 hover:text-blue-800">View all</Link>
          </div>

          {data.recentApplicants.length === 0 ? (
            <EmptyState
              className="border-0 bg-transparent py-8"
              title="No applications yet"
              description="Candidates you accept will appear here. Post a job to start receiving applications."
              action={
                <Link href="/company/jobs/create" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Post a Job
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.recentApplicants.map((app) => (
                <Link
                  key={app.id}
                  href={`/company/applicants/${app.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium text-slate-900">{app.candidateName}</div>
                    <div className="text-xs text-slate-500">
                      {app.candidateHeadline ?? "Candidate"} · {app.matchScore != null ? `${app.matchScore}% match` : "Match pending"}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
          {data.recentActivity.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No activity yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                  {item.text}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
            <Link href="/company/calendar" className="text-sm font-medium text-blue-700 hover:text-blue-800">Calendar</Link>
          </div>
          {data.upcomingDeadlines.length === 0 ? (
            <EmptyState
              className="border-0 bg-transparent py-8"
              title="No deadlines"
              description="Nothing is due soon. Your plate is clear."
              icon={CalendarClock}
            />
          ) : (
            <div className="space-y-2">
              {data.upcomingDeadlines.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.deadline}</div>
                  </div>
                  <span className="ml-2 flex items-center gap-1 text-xs font-medium text-blue-700">
                    Due <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active Jobs</h2>
            <Link href="/company/jobs" className="text-sm font-medium text-blue-700 hover:text-blue-800">Manage jobs</Link>
          </div>
          {data.activeJobs === 0 ? (
            <EmptyState
              className="border-0 bg-transparent py-8"
              title="No active jobs"
              description="Create a job posting to start the hiring process."
              action={
                <Link href="/company/jobs/create" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Create Job
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {data.activeJobs > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                  <span className="font-medium text-slate-900">{data.activeJobs} active job{data.activeJobs > 1 ? "s" : ""}</span>
                  <Link href="/company/jobs" className="text-sm font-medium text-blue-700 hover:underline">View jobs</Link>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}