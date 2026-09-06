"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createApplicant,
  getApplicantByJobAndUser,
  getApplicantThread,
  getJobById,
  isJobSaved,
  markNotificationsRead,
  recordTestResult,
  saveJob,
  submitChallenge as storeSubmitChallenge,
  unsaveJob,
} from "@/lib/hrd/store";
import { computeMatchScore, getPublicJobById } from "@/lib/hrd/services";
import { getProfileFromAuthUser } from "@/lib/dashboard-helpers";

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

  const job = getPublicJobById(jobId);
  if (!job) return error("This job is not open for applications.");

  const existing = getApplicantByJobAndUser(jobId, user.id);
  if (existing) {
    return { success: true, applicationId: existing.id };
  }

  const profile = getProfileFromAuthUser(user);
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const name =
    (typeof profile.full_name === "string" ? profile.full_name : "") ||
    user.email?.split("@")[0] ||
    "Candidate";

  const applicant = createApplicant(job.createdBy, {
    jobId: job.id,
    userId: user.id,
    candidateName: name,
    candidateHeadline: typeof profile.headline === "string" ? profile.headline : null,
    candidateEmail: user.email || null,
    candidatePhone: typeof profile.phone === "string" ? profile.phone : null,
    candidateLocation: typeof profile.location === "string" ? profile.location : null,
    candidateEducation: typeof profile.education === "string" ? profile.education : null,
    candidateSchool: typeof profile.university === "string" ? profile.university : null,
    candidateMajor: typeof profile.major === "string" ? profile.major : null,
    candidateSkills: skills,
    candidateBio: typeof profile.bio === "string" ? profile.bio : null,
    candidatePortfolioUrl:
      typeof profile.portfolio_url === "string" ? profile.portfolio_url : null,
    candidateGithubUrl: typeof profile.github_url === "string" ? profile.github_url : null,
    candidateLinkedinUrl:
      typeof profile.linkedin_url === "string" ? profile.linkedin_url : null,
    candidateResumeUrl: typeof profile.resume_url === "string" ? profile.resume_url : null,
    matchScore: computeMatchScore(job, skills),
    qualScore: null,
    qualMinScore: null,
    appliedAt: new Date().toISOString(),
    status: "new",
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
  const job = getJobById(jobId);
  if (!job) return error("Job not found.");
  saveJob(user.id, jobId);
  revalidatePath("/dashboard/find-jobs");
  revalidatePath("/dashboard/jobs/[id]");
  revalidatePath("/dashboard/saved-jobs");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function unsaveJobForCandidate(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  unsaveJob(user.id, jobId);
  revalidatePath("/dashboard/find-jobs");
  revalidatePath("/dashboard/jobs/[id]");
  revalidatePath("/dashboard/saved-jobs");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getSavedJobState(jobId: string): Promise<{ saved: boolean }> {
  const user = await getSessionUser();
  if (!user) return { saved: false };
  return { saved: isJobSaved(user.id, jobId) };
}

// Resolve the 1:1 conversation id between the candidate and the job's HRD.
export async function getCandidateConversationForJob(
  jobId: string
): Promise<{ conversationId: string | null }> {
  const user = await getSessionUser();
  if (!user) return { conversationId: null };
  const applicant = getApplicantByJobAndUser(jobId, user.id);
  if (!applicant) return { conversationId: null };
  const job = getJobById(jobId);
  if (!job) return { conversationId: null };
  const thread = getApplicantThread(job.createdBy, user.id);
  return { conversationId: thread?.id ?? null };
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

  const result = recordTestResult(assignmentId, user.id, answers);
  if (!result) return error("Test not found.");
  if ("error" in result) return error(result.error);

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

  const result = await storeSubmitChallenge(assignmentId, user.id, {
    gitHubUrl: input.gitHubUrl,
    liveDemoUrl: input.liveDemoUrl,
    textAnswer: input.textAnswer,
    notes: input.notes,
  });
  if (!result) return error("Challenge not found.");
  if ("error" in result) return error(result.error);

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
  markNotificationsRead(user.id);
  revalidatePath("/dashboard");
  revalidatePath("/company/dashboard");
  revalidatePath("/admin");
  return { success: true };
}
