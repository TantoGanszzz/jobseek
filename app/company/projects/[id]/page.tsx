import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectDetail } from "@/lib/hrd/services";
import PageHeader from "@/components/hrd/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/hrd/priority-badge";
import EmptyState from "@/components/hrd/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarRange, ListTodo, Plus } from "lucide-react";

export default async function CompanyProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, tasks } = getProjectDetail(id);

  if (!project) notFound();

  const done = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const total = tasks?.length ?? 0;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5">
        <Link href="/company/projects" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>

      <PageHeader title={project.name} subtitle={project.description ?? undefined}>
        <StatusBadge status={project.status} />
      </PageHeader>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Progress</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{progress}%</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Tasks</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{done} / {total} done</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Members</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {project.memberNames.length > 0 ? project.memberNames.length : "0"}
            </p>
          </div>
        </div>

        {(project.startDate || project.deadline) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <CalendarRange className="h-4 w-4 text-blue-600" />
            {project.startDate ? `From ${project.startDate}` : "Start date not set"}
            {project.deadline ? ` to ${project.deadline}` : ""}
          </div>
        )}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ListTodo className="h-4 w-4 text-blue-600" /> Tasks
          </h2>
          <Link href={`/company/tasks/create?project=${project.id}`}>
            <Button size="sm" className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-1 h-4 w-4" /> Add Task
            </Button>
          </Link>
        </div>
        {total === 0 ? (
          <EmptyState
            className="mt-4"
            title="No tasks yet"
            description="Break this project into tasks so your team knows what to work on."
          />
        ) : (
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900">{task.title}</div>
                  <div className="text-xs text-slate-500">{task.assigneeId ? task.assigneeName : "Unassigned"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}