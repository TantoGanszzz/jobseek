import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getEmployeeProjects, getEmployeeTasks } from "@/lib/hrd/services";
import EmptyState from "@/components/hrd/empty-state";
import PageHeader from "@/components/hrd/page-header";
import { StatusBadge } from "@/components/status-badge";
import { FolderKanban } from "lucide-react";

export default async function EmployeeProjectsPage() {
  const dashUser = await getDashboardUser();
  const projects = getEmployeeProjects(dashUser.id);
  const tasks = getEmployeeTasks(dashUser.id).tasks;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My Projects" subtitle="Projects where you're a team member." />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="You're not on any project yet"
          description="When HRD adds you to a project its progress and tasks appear here, alongside your assigned tasks."
        />
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const done = projectTasks.filter((t) => t.status === "completed").length;
            const progress = projectTasks.length === 0 ? 0 : Math.round((done / projectTasks.length) * 100);
            return (
              <div key={project.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                {project.description && (
                  <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                )}

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{done} of {projectTasks.length} tasks done</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {projectTasks.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-medium text-slate-500">Your tasks in this project</p>
                    {projectTasks.map((t) => (
                      <div key={t.id} className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{t.title}</span>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                )}

                {project.deadline && (
                  <p className="mt-3 text-xs text-slate-400">
                    Deadline: {project.deadline} · keep in sync via{" "}
                    <Link href="/dashboard/workspace/calendar" className="text-blue-700 hover:underline">Calendar</Link>.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}