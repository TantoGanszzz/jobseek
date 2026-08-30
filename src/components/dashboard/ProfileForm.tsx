"use client";

import { useActionState, useState } from "react";
import { Alert, Avatar } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Form";
import { updateProfileAction } from "@/lib/actions/account";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {
    ok: false,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url
  );

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      {state.ok && state.message && (
        <Alert kind="success">{state.message}</Alert>
      )}
      {!state.ok && state.error && <Alert kind="error">{state.error}</Alert>}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <Avatar name={profile.full_name} url={avatarPreview} size={72} />
        <div className="space-y-1.5">
          <label
            htmlFor="avatar"
            className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700"
          >
            Change photo
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAvatarPreview(URL.createObjectURL(file));
            }}
          />
          <p className="text-xs text-slate-400">PNG or JPG, max 2MB.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Full name"
          name="full_name"
          defaultValue={profile.full_name}
          required
        />
        <Input label="Email" defaultValue={profile.email} disabled hint="Email is managed in Settings." />
        <Input label="Phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} placeholder="+62 ..." />
        <Input label="Location" name="location" defaultValue={profile.location ?? ""} placeholder="City, Country" />
      </div>

      <Textarea
        label="Bio"
        name="bio"
        rows={3}
        defaultValue={profile.bio ?? ""}
        placeholder="A short introduction about yourself..."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Position / Headline"
          name="position"
          defaultValue={profile.position ?? ""}
          placeholder="e.g. Frontend Developer"
        />
        <Input
          label="Education"
          name="education"
          defaultValue={profile.education ?? ""}
          placeholder="Degree, University"
        />
      </div>

      <Textarea
        label="Experience"
        name="experience"
        rows={4}
        defaultValue={profile.experience ?? ""}
        placeholder="Summarize your work experience..."
      />

      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
