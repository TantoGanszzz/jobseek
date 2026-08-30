"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";

/** Uploads a CV to private storage and saves its URL on the profile. */
export async function uploadCvAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("job_seeker");
  if (!user) return { ok: false, error: "You must be logged in." };

  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a PDF file to upload." };
  }
  if (!/\.pdf$/i.test(file.name)) {
    return { ok: false, error: "CV must be a PDF file." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "CV must be smaller than 5MB." };
  }

  const supabase = await createClient();
  const path = `${user.userId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;

  const { error } = await supabase.storage.from("cvs").upload(path, file, {
    contentType: "application/pdf",
  });
  if (error) return { ok: false, error: `Upload failed: ${error.message}` };

  // Store the bare object path; signed URLs are minted on demand when viewing.
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ cv_url: path })
    .eq("user_id", user.userId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/jobseeker/cv");
  revalidatePath("/jobseeker/profile");
  return { ok: true, message: "CV uploaded successfully." };
}

/** Removes the stored CV reference and deletes the object. */
export async function deleteCvAction(): Promise<ActionState> {
  const user = await requireRole("job_seeker");
  const supabase = await createClient();

  const current = user.profile.cv_url;
  if (current) {
    await supabase.storage.from("cvs").remove([current]);
  }
  const { error } = await supabase
    .from("profiles")
    .update({ cv_url: null })
    .eq("user_id", user.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobseeker/cv");
  revalidatePath("/jobseeker/profile");
  return { ok: true, message: "CV removed." };
}

/** Adds a skill by name (creates it in `skills` when new) for the caller. */
export async function addSkillAction(name: string): Promise<ActionState> {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return { ok: false, error: "Skill name is required." };
  if (trimmed.length > 50) return { ok: false, error: "Skill name is too long." };

  const user = await requireRole("job_seeker");
  const supabase = await createClient();

  let skillId: number;
  const { data: existing } = await supabase
    .from("skills")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  if (existing) {
    skillId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("skills")
      .insert({ name: trimmed })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    skillId = created.id;
  }

  const { error: linkError } = await supabase
    .from("user_skills")
    .upsert(
      { user_id: user.userId, skill_id: skillId },
      { onConflict: "user_id,skill_id" }
    );
  if (linkError) return { ok: false, error: linkError.message };

  revalidatePath("/jobseeker/profile");
  return { ok: true };
}

export async function removeSkillAction(skillId: number): Promise<ActionState> {
  const user = await requireRole("job_seeker");
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_skills")
    .delete()
    .eq("user_id", user.userId)
    .eq("skill_id", skillId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobseeker/profile");
  return { ok: true };
}
