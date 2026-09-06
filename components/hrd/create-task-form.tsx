"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTaskAction } from "@/app/actions/hrd";
import { Save } from "lucide-react";
import type { Employee, Project } from "@/lib/hrd/types";

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export default function CreateTaskForm({
  projects,
  employees,
  defaultProjectId,
}: {
  projects: Project[];
  employees: Employee[];
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("medium");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createTaskAction({
      title,
      description,
      projectId,
      assigneeId,
      priority,
      startDate,
      deadline,
    });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Task created!" });
      router.push("/company/tasks");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`rounded-lg border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Task Details</h2>

        <div className="space-y-1.5">
          <label htmlFor="task-title" className="text-sm font-medium text-slate-700">Task Title *</label>
          <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Design the onboarding flow" className="h-11 border-slate-200" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="task-description" className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What needs to be done?"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="task-project" className="text-sm font-medium text-slate-700">Project</label>
            <select
              id="task-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="task-assignee" className="text-sm font-medium text-slate-700">Assignee</label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Unassigned (team task)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Priority</span>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  priority === p
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="task-start" className="text-sm font-medium text-slate-700">Start Date</label>
            <Input id="task-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="task-deadline" className="text-sm font-medium text-slate-700">Deadline</label>
            <Input id="task-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 border-slate-200" />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="h-11 cursor-pointer bg-blue-600 px-6 text-white hover:bg-blue-700">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}