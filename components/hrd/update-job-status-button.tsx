"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateJobStatusAction } from "@/app/actions/hrd";
import type { JobPosting } from "@/lib/hrd/types";

export default function UpdateJobStatusButton({ job }: { job: JobPosting }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = job.status === "closed" ? "active" : "closed";
    await updateJobStatusAction(job.id, next);
    router.refresh();
    setBusy(false);
  }

  const isClosed = job.status === "closed";

  return (
    <Button
      onClick={toggle}
      disabled={busy}
      variant={isClosed ? "outline" : "secondary"}
      className={`cursor-pointer ${isClosed ? "border-slate-200 text-blue-700" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
    >
      {busy ? "Updating..." : isClosed ? "Reopen Job" : "Close Job"}
    </Button>
  );
}