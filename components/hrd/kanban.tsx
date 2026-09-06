"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/hrd/priority-badge";
import { updateTaskStatusAction } from "@/app/actions/hrd";
import type { Task, TaskStatus } from "@/lib/hrd/types";

const COLUMNS: Array<{ status: TaskStatus; label: string; dot: string }> = [
  { status: "todo", label: "To Do", dot: "bg-slate-400" },
  { status: "in_progress", label: "In Progress", dot: "bg-blue-500" },
  { status: "in_review", label: "In Review", dot: "bg-amber-400" },
  { status: "completed", label: "Completed", dot: "bg-green-500" },
];

export default function KanbanBoard({
  tasks,
  isHrd,
}: {
  tasks: Task[];
  isHrd: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function move(taskId: string, status: TaskStatus) {
    setBusyId(taskId);
    await updateTaskStatusAction(taskId, status);
    router.refresh();
    setBusyId(null);
  }

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => (
        <section key={col.status} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <header className="mb-3 flex items-center gap-2 px-1">
            <span className={`h-2 w-2 rounded-full ${col.dot}`} />
            <h3 className="text-sm font-semibold text-slate-900">{col.label}</h3>
            <span className="ml-auto rounded bg-white px-1.5 py-0.5 text-xs font-medium text-slate-500 border border-slate-200">
              {byStatus(col.status).length}
            </span>
          </header>

          <div className="space-y-2.5">
            {byStatus(col.status).length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-6 text-center text-xs text-slate-400">
                No tasks here
              </div>
            )}
            {byStatus(col.status).map((task) => (
              <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium leading-snug text-slate-900">{task.title}</h4>
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.projectName && (
                  <div className="mb-1 text-xs text-slate-500">Project: {task.projectName}</div>
                )}
                {task.description && (
                  <p className="mb-2 line-clamp-2 text-xs text-slate-500">{task.description}</p>
                )}
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{task.assigneeId ? task.assigneeName : "Unassigned"}</span>
                  {task.deadline && <span>Due {task.deadline}</span>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {col.status === "todo" && (
                    <Button size="xs" className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700" disabled={busyId === task.id} onClick={() => move(task.id, "in_progress")}>
                      Start
                    </Button>
                  )}
                  {col.status === "in_progress" && (
                    <>
                      <Button size="xs" className="cursor-pointer bg-amber-500 text-white hover:bg-amber-600" disabled={busyId === task.id} onClick={() => move(task.id, "in_review")}>
                        Submit for Review
                      </Button>
                      {isHrd && (
                        <Button size="xs" variant="outline" className="cursor-pointer border-slate-200 text-slate-600" disabled={busyId === task.id} onClick={() => move(task.id, "todo")}>
                          Back
                        </Button>
                      )}
                    </>
                  )}
                  {col.status === "in_review" && (
                    <>
                      <Button size="xs" className="cursor-pointer bg-green-600 text-white hover:bg-green-700" disabled={busyId === task.id} onClick={() => move(task.id, "completed")}>
                        Approve
                      </Button>
                      <Button size="xs" variant="outline" className="cursor-pointer border-amber-200 text-amber-700" disabled={busyId === task.id} onClick={() => move(task.id, "in_progress")}>
                        Request Revision
                      </Button>
                    </>
                  )}
                  {col.status === "completed" && (
                    <Button size="xs" variant="outline" className="cursor-pointer border-slate-200 text-slate-600" disabled={busyId === task.id} onClick={() => move(task.id, "todo")}>
                      Reopen
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}