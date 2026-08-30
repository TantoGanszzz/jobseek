"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { moderateJobAction } from "@/app/admin/actions";

export function ModerationActions({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(status: "published" | "rejected" | "closed") {
    setError(null);
    startTransition(async () => {
      const res = await moderateJobAction(jobId, status);
      if (!res.ok) setError(res.error ?? "Failed");
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" loading={pending} onClick={() => act("published")}>
        Approve
      </Button>
      <Button size="sm" variant="danger" loading={pending} onClick={() => act("rejected")}>
        Reject
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
