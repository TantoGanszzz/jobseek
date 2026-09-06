"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateTaskStatusAction } from "@/app/actions/hrd";
import type { Task } from "@/lib/hrd/types";

// Used in the employee (hired candidate) workspace: the employee can start
// their task or submit it for review. HRD approval happens in the Kanban.
export default function TaskWorkflowActions({ task }: { task: Task }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(status: "in_progress" | "in_review") {
    setBusy(true);
    await updateTaskStatusAction(task.id, status);
    router.refresh();
    setBusy(false);
  }

  if (task.status === "completed") {
    return (
      <span className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
        Completed
      </span>
    );
  }

  if (task.status === "in_review") {
    return (
      <span className="rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
        Awaiting approval
      </span>
    );
  }

  if (task.status === "in_progress") {
    return (
      <Button
        size="xs"
        disabled={busy}
        onClick={() => run("in_review")}
        className="cursor-pointer bg-amber-500 text-white hover:bg-amber-600"
      >
        Submit for Review
      </Button>
    );
  }

  return (
    <Button
      size="xs"
      disabled={busy}
      onClick={() => run("in_progress")}
      className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
    >
      Start Task
    </Button>
  );
}