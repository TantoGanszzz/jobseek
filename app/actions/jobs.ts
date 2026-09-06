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

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    console.error("Unable to load job before applying", jobError);
    return { error: "This job is no longer available." };
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
    console.error("Unable to submit application", error);
    return { error: "Unable to submit your application right now. Please try again." };
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
