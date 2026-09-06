import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getProjects, getTasks } from "@/lib/hrd/services";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus } from "lucide-react";

export default async function CompanyProjectsPage() {
  const dashUser = await getDashboardUser();
  const projects = getProjects(dashUser.id);
  const tasks = getTasks(dashUser.id);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Projects" subtitle="Track work across your team.">
        <Link href="/company/projects/create">
          <Button className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project, then break it down into tasks for your team."
          action={
            <Link href="/company/projects/create" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Create Project
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const done = projectTasks.filter((t) => t.status === "completed").length;
            const progress = projectTasks.length === 0 ? 0 : Math.round((done / projectTasks.length) * 100);
            return (
              <Link
                key={project.id}
                href={`/company/projects/${project.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                {project.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description}</p>
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

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{project.memberNames.length > 0 ? `${project.memberNames.length} members` : "No members yet"}</span>
                  {project.deadline && <span>Due {project.deadline}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}