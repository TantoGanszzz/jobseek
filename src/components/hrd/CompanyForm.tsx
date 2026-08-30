"use client";

import { useActionState, useState } from "react";
import { Alert, Avatar } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Form";
import { saveCompanyAction } from "@/app/hrd/actions";
import type { Company } from "@/types/database";

export function CompanyForm({ company }: { company: Company | null }) {
  const [state, formAction, pending] = useActionState(saveCompanyAction, {
    ok: false,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(
    company?.logo_url ?? null
  );

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      {state.ok && state.message && <Alert kind="success">{state.message}</Alert>}
      {!state.ok && state.error && <Alert kind="error">{state.error}</Alert>}

      <div className="flex items-center gap-5">
        <Avatar
          name={company?.company_name ?? "?"}
          url={logoPreview}
          size={72}
          className="rounded-xl"
        />
        <div className="space-y-1.5">
          <label
            htmlFor="logo"
            className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700"
          >
            Upload logo
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setLogoPreview(URL.createObjectURL(file));
            }}
          />
          <p className="text-xs text-slate-400">Square image recommended, max 2MB.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Company name"
          name="company_name"
          defaultValue={company?.company_name ?? ""}
          required
        />
        <Input
          label="Website"
          name="website"
          type="url"
          defaultValue={company?.website ?? ""}
          placeholder="https://..."
        />
        <Input
          label="Location"
          name="location"
          defaultValue={company?.location ?? ""}
          placeholder="e.g. Jakarta, Indonesia"
        />
        <Input
          label="Industry"
          name="industry"
          defaultValue={company?.industry ?? ""}
          placeholder="e.g. Fintech"
        />
      </div>

      <Textarea
        label="About the company"
        name="description"
        rows={4}
        defaultValue={company?.description ?? ""}
        placeholder="Tell candidates what your company does and its culture..."
      />

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : "Save company profile"}
        </Button>
      </div>
    </form>
  );
}
