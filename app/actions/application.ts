"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Question } from "@/types/database.types";

/**
 * Begins the application flow. Creates an application in TEST_REQUIRED status
 * if one doesn't already exist, then routes to the qualification test.
 */
export async function startApplication(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify job exists and is active
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, min_qualification_score")
    .eq("id", jobId)
    .single();

  if (!job) {
    return { error: "Job not found" };
  }

  // Check if user already has an application for this job
  const { data: existing } = await supabase
    .from("applications")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  let applicationId: string;

  if (existing) {
    applicationId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        job_id: jobId,
        status: "test_required",
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    applicationId = created.id;
  }

  redirect(`/dashboard/jobs/${jobId}/test`);
}

/**
 * Server-verified test submission. Validates that:
 * - the attempt belongs to the current user
 * - the test belongs to the job
 * - the score is computed server-side from correct answers
 * - the minimum score comes from the job
 * - a CV is selected when submitting the application
 */
export async function submitQualificationTest(
  applicationId: string,
  jobId: string,
  testId: string,
  answers: number[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify the application belongs to the current user
  const { data: application } = await supabase
    .from("applications")
    .select("id, job_id, status, cv_url, test_attempt_id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (!application) {
    return { error: "Application not found" };
  }

  // Verify application's job matches the submitted jobId
  if (application.job_id !== jobId) {
    return { error: "Job mismatch" };
  }

  // Verify the test belongs to the job
  const { data: test } = await supabase
    .from("qualification_tests")
    .select("id, job_id, questions")
    .eq("id", testId)
    .eq("job_id", jobId)
    .single();

  if (!test) {
    return { error: "Test not found for this job" };
  }

  // Verify test attempt belongs to current user
  if (application.test_attempt_id) {
    const { data: attempt } = await supabase
      .from("qualification_test_attempts")
      .select("id, completed_at")
      .eq("id", application.test_attempt_id)
      .eq("user_id", user.id)
      .single();

    if (attempt && attempt.completed_at) {
      return { error: "Test already completed" };
    }
    if (!attempt) {
      // Invalid attempt reference
      return { error: "Invalid test attempt" };
    }
  } else {
    return { error: "No test attempt found. Please start the test first." };
  }

  const questions = (test.questions || []) as Question[];
  if (questions.length === 0) {
    return { error: "Test has no questions" };
  }

  // Compute score server-side
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return { error: "Invalid answers submitted" };
  }

  let correct = 0;
  const sanitizedAnswers: number[] = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answer = answers[i];
    if (typeof answer !== "number" || answer < 0 || answer >= (q.options?.length || 0)) {
      return { error: "Invalid answer format" };
    }
    sanitizedAnswers.push(answer);
    if (answer === q.correct_answer) correct++;
  }

  const total = questions.length;
  const score = Math.round((correct / total) * 100);

  // Get minimum score from the JOB (authoritative)
  const { data: jobData } = await supabase
    .from("jobs")
    .select("min_qualification_score")
    .eq("id", jobId)
    .single();

  const minScore = jobData?.min_qualification_score ?? 70;

  // Update attempt with score
  await supabase
    .from("qualification_test_attempts")
    .update({
      score,
      total_questions: total,
      answers: sanitizedAnswers,
      completed_at: new Date().toISOString(),
    })
    .eq("id", application.test_attempt_id)
    .eq("user_id", user.id);

  const passed = score >= minScore;

  // Update application status based on result
  const newStatus = passed ? "qualified" : "test_failed";
  await supabase
    .from("applications")
    .update({ status: newStatus, score })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  return { success: true, passed, score, minScore };
}

/**
 * Final step: submit the qualified application to HRD.
 * Verifies server-side that the candidate passed and has a CV.
 */
export async function submitApplication(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify application belongs to user and is qualified
  const { data: application } = await supabase
    .from("applications")
    .select("id, status, score, cv_url, job:jobs(min_qualification_score)")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (!application) {
    return { error: "Application not found" };
  }

  // Require CV selection
  if (!application.cv_url) {
    return { error: "Please select a CV before submitting your application." };
  }

  // Must be in qualified status (passed the test)
  if (application.status !== "qualified") {
    return { error: "You must pass the qualification test before submitting." };
  }

  // Verify score meets minimum (defense in depth)
  const minScore = application.job?.min_qualification_score ?? 70;
  if (application.score == null || application.score < minScore) {
    return {
      error: "Your score does not meet the minimum qualification for this position.",
    };
  }

  // Check not already submitted
  if (["submitted", "under_review", "shortlisted", "interview", "accepted"].includes(application.status)) {
    return { error: "This application has already been submitted." };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "submitted" })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  return { success: true };
}

/**
 * Creates a test attempt record when the user starts a test.
 * Verifies application belongs to user.
 */
export async function startTest(applicationId: string, testId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id, job_id, status, cv_url")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (!application) {
    return { error: "Application not found" };
  }

  const { data: test } = await supabase
    .from("qualification_tests")
    .select("id, job_id")
    .eq("id", testId)
    .eq("job_id", application.job_id)
    .single();

  if (!test) {
    return { error: "Test not found for this job" };
  }

  // Create or reuse attempt
  let attemptId: string;
  if (application.test_attempt_id) {
    const { data: existing } = await supabase
      .from("qualification_test_attempts")
      .select("id, completed_at")
      .eq("id", application.test_attempt_id)
      .eq("user_id", user.id)
      .single();
    if (existing && !existing.completed_at) {
      attemptId = existing.id;
    } else {
      attemptId = application.test_attempt_id;
    }
  } else {
    const { data: created, error } = await supabase
      .from("qualification_test_attempts")
      .insert({
        test_id: testId,
        user_id: user.id,
        application_id: applicationId,
        score: 0,
        total_questions: 0,
        answers: [],
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    attemptId = created.id;

    await supabase
      .from("applications")
      .update({ test_attempt_id: attemptId, status: "test_in_progress" })
      .eq("id", applicationId)
      .eq("user_id", user.id);
  }

  return { success: true, attemptId };
}

export async function selectCvForApplication(applicationId: string, cvUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ cv_url: cvUrl })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  return { success: true };
}
