"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProjectAction } from "@/app/actions/hrd";
import { Save } from "lucide-react";

const STATUSES = ["planning", "active", "on_hold", "completed"] as const;

export default function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("planning");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createProjectAction({ name, description, status, startDate, deadline });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Project created!" });
      router.push("/company/projects");
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
        <h2 className="text-base font-semibold text-slate-900">Project Details</h2>

        <div className="space-y-1.5">
          <label htmlFor="project-name" className="text-sm font-medium text-slate-700">Project Name *</label>
          <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Website Revamp 2026" className="h-11 border-slate-200" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-description" className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What is this project about?"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  status === s
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="project-start" className="text-sm font-medium text-slate-700">Start Date</label>
            <Input id="project-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="project-deadline" className="text-sm font-medium text-slate-700">Deadline</label>
            <Input id="project-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 border-slate-200" />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="h-11 cursor-pointer bg-blue-600 px-6 text-white hover:bg-blue-700">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}