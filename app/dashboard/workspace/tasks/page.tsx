import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getEmployeeTasks } from "@/lib/hrd/services";
import TaskWorkflowActions from "@/components/hrd/task-workflow";
import EmptyState from "@/components/hrd/empty-state";
import PageHeader from "@/components/hrd/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/hrd/priority-badge";
import { ListTodo } from "lucide-react";

export default async function EmployeeTasksPage() {
  const dashUser = await getDashboardUser();
  const { tasks } = getEmployeeTasks(dashUser.id);

  const pending = tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="My Tasks"
        subtitle={pending > 0 ? `${pending} task${pending > 1 ? "s" : ""} need${pending > 1 ? "" : "s"} your attention.` : "You're all caught up."}
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks assigned to you"
          description="When your HRD assigns you a task it shows up here with a workflow: start it, submit for review, and get it approved."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{task.title}</h3>
                  {task.projectName && (
                    <p className="mt-0.5 text-sm text-slate-500">Project: {task.projectName}</p>
                  )}
                  {task.description && (
                    <p className="mt-2 text-sm text-slate-600">{task.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  {task.startDate && <span>Starts {task.startDate}</span>}
                  {task.deadline && <span>Due {task.deadline}</span>}
                </div>
                <TaskWorkflowActions task={task} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <p className="mt-6 text-sm text-slate-500">
          Need something? Hired team members can also chat with HRD in{" "}
          <Link href="/dashboard/workspace/messages" className="text-blue-700 hover:underline">Messages</Link>.
        </p>
      )}
    </div>
  );
}