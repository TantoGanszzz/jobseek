import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getTasks } from "@/lib/hrd/services";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import KanbanBoard from "@/components/hrd/kanban";
import { Button } from "@/components/ui/button";
import { ListTodo, Plus } from "lucide-react";

export default async function CompanyTasksPage() {
  const dashUser = await getDashboardUser();
  const tasks = getTasks(dashUser.id);

  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    in_review: tasks.filter((t) => t.status === "in_review").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Tasks" subtitle="Plan, assign, and review team tasks.">
        <Link href="/company/tasks/create">
          <Button className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "To Do", value: counts.todo, color: "text-slate-700" },
          { label: "In Progress", value: counts.in_progress, color: "text-blue-700" },
          { label: "In Review", value: counts.in_review, color: "text-amber-700" },
          { label: "Completed", value: counts.completed, color: "text-green-700" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Create your first task and assign it to a team member. Tasks flow through To Do → In Progress → In Review → Completed."
          action={
            <Link href="/company/tasks/create" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Create Task
            </Link>
          }
        />
      ) : (
        <KanbanBoard tasks={tasks} isHrd />
      )}
    </div>
  );
}