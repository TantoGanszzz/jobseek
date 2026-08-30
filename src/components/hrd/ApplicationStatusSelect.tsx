"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Form";
import { setApplicationStatusAction } from "@/app/hrd/actions";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/types/database";

export function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<ApplicationStatus>(status);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    setValue(next as ApplicationStatus);
    startTransition(async () => {
      const res = await setApplicationStatusAction(applicationId, next as ApplicationStatus);
      if (!res.ok) {
        setValue(status);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Select
      name={`status-${applicationId}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-40"
      disabled={pending}
    >
      {APPLICATION_STATUSES.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
