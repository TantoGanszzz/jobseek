"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { deleteJobAction, setJobStatusAction } from "@/app/hrd/actions";
import type { JobStatus } from "@/types/database";

export function JobRowActions({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(next: JobStatus) {
    setError(null);
    startTransition(async () => {
      const res = await setJobStatusAction(jobId, next);
      if (!res.ok) setError(res.error ?? "Failed");
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      {(status === "draft" || status === "closed") && (
        <Button
          size="sm"
          variant="subtle"
          loading={pending}
          onClick={() => update("published")}
        >
          Publish
        </Button>
      )}
      {status === "published" && (
        <Button
          size="sm"
          variant="outline"
          loading={pending}
          onClick={() => update("closed")}
        >
          Close
        </Button>
      )}
      <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
        Delete
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete job"
        message="This permanently deletes the job and all of its applications."
        confirmLabel="Delete"
        destructive
        loading={pending}
        onConfirm={() =>
          startTransition(async () => {
            const res = await deleteJobAction(jobId);
            if (!res.ok) {
              setError(res.error ?? "Failed");
              setConfirmDelete(false);
            } else {
              setConfirmDelete(false);
              router.refresh();
            }
          })
        }
      />
    </div>
  );
}
