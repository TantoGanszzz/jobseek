"use server";

import { createClient } from "@/lib/supabase/server";

export async function applyToJob(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    job_id: jobId,
    status: "submitted",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Anda sudah melamar pekerjaan ini." };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function saveJob(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("saved_jobs").insert({
    user_id: user.id,
    job_id: jobId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Job sudah disimpan." };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function unsaveJob(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
