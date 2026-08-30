"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/DataDisplay";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Form";
import { createJobAction, updateJobAction } from "@/app/hrd/actions";
import type { EmploymentType, Job, JobStatus } from "@/types/database";

const EMPLOYMENT_OPTIONS: Array<{ value: EmploymentType; label: string }> = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

const STATUS_OPTIONS: Array<{ value: JobStatus; label: string }> = [
  { value: "draft", label: "Draft — hidden from public" },
  { value: "pending", label: "Pending review (admin approval)" },
  { value: "published", label: "Published — open for applications" },
  { value: "closed", label: "Closed — no new applications" },
];

export function JobForm({ job }: { job?: Job }) {
  const isEdit = !!job;
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (prev: { ok: boolean; error?: string; message?: string }, formData: FormData) => {
      const result = isEdit
        ? await updateJobAction(job.id, prev, formData)
        : await createJobAction(prev, formData);
      if (result.ok && !isEdit && result.message) {
        router.push(`/hrd/jobs/${result.message}`);
      }
      return result;
    },
    { ok: false }
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.ok && !isEdit ? null : state.ok && state.message && isEdit ? (
        <Alert kind="success">{state.message}</Alert>
      ) : null}
      {!state.ok && state.error && <Alert kind="error">{state.error}</Alert>}

      <Input
        label="Job title"
        name="title"
        defaultValue={job?.title}
        placeholder="e.g. Senior Frontend Developer"
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Location"
          name="location"
          defaultValue={job?.location ?? ""}
          placeholder="e.g. Jakarta / Remote"
        />
        <Select
          label="Employment type"
          name="employment_type"
          defaultValue={job?.employment_type ?? "full_time"}
          required
        >
          {EMPLOYMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Salary range (USD)"
          name="salary_min"
          defaultValue={job?.salary_min?.toString() ?? ""}
          inputMode="numeric"
          placeholder="4000"
          hint="Leave empty to hide."
        />
        <Input
          label="Maximum salary"
          name="salary_max"
          defaultValue={job?.salary_max?.toString() ?? ""}
          inputMode="numeric"
          placeholder="8000"
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        rows={6}
        defaultValue={job?.description}
        placeholder="Describe the role, responsibilities, and what makes this position great..."
        required
      />

      <Textarea
        label="Requirements"
        name="requirements"
        rows={4}
        defaultValue={job?.requirements ?? ""}
        placeholder={"- 3+ years of experience\n- Strong communication skills"}
      />

      <Select
        label="Status"
        name="status"
        defaultValue={job?.status ?? "draft"}
        hint="Jobs set to Pending require admin approval before going live."
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <ButtonLink href="/hrd/jobs" variant="ghost">Cancel</ButtonLink>
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : isEdit ? "Save changes" : "Create job"}
        </Button>
      </div>
    </form>
  );
}
