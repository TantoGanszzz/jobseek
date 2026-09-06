"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: boolean; error?: string; applicationId?: string };

async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function error(message: string) {
  return { success: false, error: message };
}

// ---------------------------------------------------------------
// Apply
// ---------------------------------------------------------------

export async function applyToJob(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");

  const supabase = await createClient();

  // Check if job exists
  const { data: job } = await supabase.from("jobs").select("id, status").eq("id", jobId).single();
  if (!job || job.status !== "active") return error("This job is not open for applications.");

  // Check if already applied
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { success: true, applicationId: existing.id };
  }

  // Insert application
  const { data: applicant, error: insertError } = await supabase
    .from("applications")
    .insert({
      job_id: job.id,
      user_id: user.id,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError) {
    return error("Gagal mengirim lamaran: " + insertError.message);
  }

  // Also insert initial history
  await supabase.from("application_history").insert({
    application_id: applicant.id,
    status: "new",
    note: "Application submitted",
  });

  revalidatePath("/dashboard/jobs/[id]");
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/applications/[id]");
  revalidatePath("/dashboard");
  revalidatePath("/company/applicants");
  revalidatePath("/company/applicants/[id]");
  revalidatePath("/company/dashboard");
  revalidatePath("/company/messages");
  return { success: true, applicationId: applicant.id };
}

// ---------------------------------------------------------------
// Saved jobs
// ---------------------------------------------------------------

export async function saveJobForCandidate(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  const supabase = await createClient();
  const { error: err } = await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
  if (err && err.code !== '23505') return error("Could not save job.");
  revalidatePath("/dashboard/find-jobs");
  revalidatePath("/dashboard/jobs/[id]");
  revalidatePath("/dashboard/saved-jobs");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function unsaveJobForCandidate(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  const supabase = await createClient();
  await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
  revalidatePath("/dashboard/find-jobs");
  revalidatePath("/dashboard/jobs/[id]");
  revalidatePath("/dashboard/saved-jobs");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getSavedJobState(jobId: string): Promise<{ saved: boolean }> {
  const user = await getSessionUser();
  if (!user) return { saved: false };
  const supabase = await createClient();
  const { data } = await supabase.from("saved_jobs").select("job_id").eq("user_id", user.id).eq("job_id", jobId).maybeSingle();
  return { saved: !!data };
}

// Resolve the 1:1 conversation id between the candidate and the job's HRD.
export async function getCandidateConversationForJob(
  jobId: string
): Promise<{ conversationId: string | null }> {
  // Not implemented in DB integration yet
  return { conversationId: null };
}

// ---------------------------------------------------------------
// Qualification tests
// ---------------------------------------------------------------

export async function submitTestResult(
  assignmentId: string,
  answers: number[]
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");

  const supabase = await createClient();
  const { data: assignment } = await supabase.from("test_assignments").select("*").eq("id", assignmentId).eq("candidate_id", user.id).single();
  if (!assignment) return error("Test not found.");

  // Dummy score calculation for now
  const score = Math.floor(Math.random() * 40) + 60; 

  await supabase.from("test_assignments").update({
    status: "completed",
    score,
    passed: score >= (assignment.min_score || 0),
    answers,
    completed_at: new Date().toISOString()
  }).eq("id", assignmentId);

  revalidatePath("/dashboard/tests");
  revalidatePath("/dashboard/tests/[assignmentId]");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/applications/[id]");
  revalidatePath("/dashboard");
  revalidatePath("/company/tests");
  revalidatePath("/company/applicants");
  revalidatePath("/company/applicants/[id]");
  revalidatePath("/company/dashboard");
  return { success: true };
}

export async function submitChallenge(
  assignmentId: string,
  input: {
    gitHubUrl: string;
    liveDemoUrl: string;
    textAnswer: string;
    notes: string;
  }
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");

  const supabase = await createClient();
  const { data: assignment } = await supabase.from("test_assignments").select("*").eq("id", assignmentId).eq("candidate_id", user.id).single();
  if (!assignment) return error("Challenge not found.");

  await supabase.from("test_assignments").update({
    status: "submitted",
    github_url: input.gitHubUrl,
    live_url: input.liveDemoUrl,
    text_answer: input.textAnswer,
    notes: input.notes,
    completed_at: new Date().toISOString()
  }).eq("id", assignmentId);

  revalidatePath("/dashboard/tests");
  revalidatePath("/dashboard/tests/[assignmentId]");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/applications/[id]");
  revalidatePath("/dashboard");
  revalidatePath("/company/tests");
  revalidatePath("/company/applicants");
  revalidatePath("/company/applicants/[id]");
  revalidatePath("/company/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------

export async function markNotificationsReadAction(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  
  const supabase = await createClient();
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);

  revalidatePath("/dashboard");
  revalidatePath("/company/dashboard");
  revalidatePath("/admin");
  return { success: true };
}
