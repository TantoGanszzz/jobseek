"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateApplicantStatusAction } from "@/app/actions/hrd";
import type { Applicant, ApplicantStatus } from "@/lib/hrd/types";
import { APPLICANT_STATUS_LABELS } from "@/lib/hrd/applicant-status";

const STATUS_OPTIONS: ApplicantStatus[] = ["screening", "test", "interview", "final_review", "hired", "rejected"];

export default function ApplicantActions({ applicant }: { applicant: Applicant }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: ApplicantStatus) {
    setBusy(status);
    setError(null);
    const result = await updateApplicantStatusAction(applicant.id, status);
    if (result?.error) setError(result.error);
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => {
          const active = applicant.status === s;
          const style =
            s === "hired"
              ? active
                ? "bg-green-600 text-white"
                : "border border-slate-200 text-green-700 hover:bg-green-50"
              : s === "rejected"
                ? active
                  ? "bg-red-600 text-white"
                  : "border border-slate-200 text-red-600 hover:bg-red-50"
                : active
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-blue-700 hover:bg-blue-50";
          return (
            <Button
              key={s}
              size="sm"
              disabled={busy === s}
              onClick={() => setStatus(s)}
              className={`cursor-pointer capitalize ${style}`}
            >
              {busy === s ? "Updating..." : APPLICANT_STATUS_LABELS[s] ?? s}
            </Button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}