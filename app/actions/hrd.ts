"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------
// Auth guard helpers
// ---------------------------------------------------------------

async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function isHrdOrAdmin(user: { user_metadata?: Record<string, unknown> } | null) {
  const role = user?.user_metadata?.role;
  return role === "hrd" || role === "admin";
}

function error(message: string) {
  return { success: false, error: message };
}

type ActionResult = { success: boolean; error?: string; jobId?: string };

export interface JobFormValues {
  title: string;
  description: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryRange: string;
  experienceLevel: string;
  education: string;
  skills: string[];
  preferredSkills: string[];
  requirements: string;
  responsibilities: string;
  stages: string[];
  minQualificationScore: number;
  deadline: string;
}

export async function createJobAction(values: JobFormValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) {
    return error("You must be signed in.");
  }

  const supabase = await createClient();
  const role = user.user_metadata?.role;
  if (role !== "hrd" && role !== "admin") return error("You do not have permission to create jobs.");

  const title = values.title.trim();
  if (!title) return error("Job title is required.");
  if (!values.location.trim()) return error("Location is required.");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) {
    return error("Struktur data HRD/perusahaan belum tersedia. Silakan lengkapi profil perusahaan terlebih dahulu.");
  }

  const { data: job, error: insertError } = await supabase
    .from("jobs")
    .insert({
      company_id: company.id,
      title: title,
      description: values.description.trim() || null,
      department: values.department.trim() || null,
      location: values.location.trim(),
      job_type: values.jobType.trim() || null,
      work_mode: values.workMode.trim() || null,
      salary_range: values.salaryRange.trim() || null,
      experience_level: values.experienceLevel.trim() || null,
      education: values.education.trim() || null,
      skills: values.skills || [],
      preferred_skills: values.preferredSkills || [],
      requirements: values.requirements.trim() || null,
      responsibilities: values.responsibilities.trim() || null,
      stages: values.stages || [],
      min_qualification_score: values.minQualificationScore || 0,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      status: "active",
    })
    .select("id")
    .single();

  if (insertError) {
    return error("Gagal membuat lowongan: " + insertError.message);
  }

  revalidatePath("/company/jobs");
  revalidatePath("/company/dashboard");
  return { success: true, jobId: job.id };
}

export async function updateJobStatusAction(jobId: string, status: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("You do not have permission to change jobs.");
  if (!["draft", "active", "paused", "closed"].includes(status)) return error("Invalid job status.");

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId);

  if (updateError) return error("Failed to update job status.");

  revalidatePath("/company/jobs");
  revalidatePath("/company/jobs/[id]");
  revalidatePath("/company/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------
// Applicants
// ---------------------------------------------------------------

export async function updateApplicantStatusAction(applicantId: string, status: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can update applicant status.");

  const supabase = await createClient();
  
  const { error: updateError } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicantId);

  if (updateError) return error("Failed to update applicant status.");

  // Insert history
  await supabase.from("application_history").insert({
    application_id: applicantId,
    status,
    note: `Status changed to ${status}`,
  });

  revalidatePath("/company/applicants");
  revalidatePath("/company/applicants/[id]");
  revalidatePath("/company/dashboard");
  revalidatePath("/company/employees");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/applications/[id]");
  return { success: true };
}

export async function scheduleInterviewAction(
  applicantId: string,
  input: {
    title: string;
    date: string;
    time: string;
    location: string;
    durationMinutes: string;
    notes: string;
  }
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can schedule interviews.");

  const supabase = await createClient();
  
  const { error: insertError } = await supabase
    .from("interviews")
    .insert({
      application_id: applicantId,
      title: input.title.trim(),
      scheduled_date: input.date,
      scheduled_time: input.time || null,
      location: input.location || null,
      duration_minutes: input.durationMinutes ? Number(input.durationMinutes) || null : null,
      notes: input.notes || null,
    });

  if (insertError) return error("Failed to schedule interview: " + insertError.message);

  revalidatePath("/company/applicants");
  revalidatePath("/company/applicants/[id]");
  revalidatePath("/company/calendar");
  revalidatePath("/company/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/applications/[id]");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignTestAction(
  applicantId: string,
  input: {
    kind?: string;
    title: string;
    description?: string;
    instructions?: string;
    deadline?: string;
    minScore: string;
    timeLimitMinutes: string;
  }
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can send qualification tests.");

  const supabase = await createClient();
  
  // Get the application to find the job_id and candidate_id
  const { data: application } = await supabase
    .from("applications")
    .select("job_id, user_id")
    .eq("id", applicantId)
    .single();

  if (!application) return error("Application not found.");

  const kind = input.kind === "challenge" ? "challenge" : "quiz";
  const { error: insertError } = await supabase
    .from("test_assignments")
    .insert({
      job_id: application.job_id,
      candidate_id: application.user_id,
      application_id: applicantId,
      kind,
      title: input.title || "Qualification Test",
      description: kind === "challenge" ? input.description || null : null,
      instructions: kind === "challenge" ? input.instructions || null : null,
      deadline: input.deadline ? new Date(input.deadline).toISOString() : null,
      min_score: input.minScore ? Number(input.minScore) || 0 : 0,
      time_limit_minutes: input.timeLimitMinutes ? Number(input.timeLimitMinutes) || null : null,
      status: "pending",
    });

  if (insertError) return error("Failed to assign test: " + insertError.message);

  revalidatePath("/company/applicants");
  revalidatePath("/company/applicants/[id]");
  revalidatePath("/company/tests");
  revalidatePath("/company/dashboard");
  revalidatePath("/dashboard/tests");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/applications/[id]");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function reviewTestAction(
  assignmentId: string,
  input: { score: string; feedback?: string; decision: "pass" | "fail" }
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can review technical challenges.");

  const supabase = await createClient();
  
  const { error: updateError } = await supabase
    .from("test_assignments")
    .update({
      score: Number(input.score) || 0,
      feedback: input.feedback || null,
      passed: input.decision === "pass",
      status: "reviewed",
    })
    .eq("id", assignmentId);

  if (updateError) return error("Failed to review test: " + updateError.message);

  revalidatePath("/company/applicants");
  revalidatePath("/company/applicants/[id]");
  revalidatePath("/company/tests");
  revalidatePath("/company/dashboard");
  revalidatePath("/dashboard/tests");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/applications/[id]");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------

export interface TaskFormValues {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: string;
  startDate: string;
  deadline: string;
}

export async function createTaskAction(values: TaskFormValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can create tasks.");

  const title = values.title.trim();
  if (!title) return error("Task title is required.");

  const supabase = await createClient();

  // Get company
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) return error("Company not found.");

  const { error: insertError } = await supabase
    .from("tasks")
    .insert({
      company_id: company.id,
      created_by: user.id,
      title,
      description: values.description.trim() || null,
      project_id: values.projectId || null,
      assignee_id: values.assigneeId || null,
      priority: values.priority || "medium",
      start_date: values.startDate ? new Date(values.startDate).toISOString().slice(0, 10) : null,
      deadline: values.deadline ? new Date(values.deadline).toISOString().slice(0, 10) : null,
      status: "todo",
    });

  if (insertError) return error("Failed to create task: " + insertError.message);

  revalidatePath("/company/tasks");
  revalidatePath("/company/projects");
  revalidatePath("/company/dashboard");
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");

  const supabase = await createClient();
  
  const { error: updateError } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (updateError) return error("Failed to update task status.");

  revalidatePath("/company/tasks");
  revalidatePath("/company/projects");
  revalidatePath("/dashboard/workspace/tasks");
  return { success: true };
}

// ---------------------------------------------------------------
// Projects
// ---------------------------------------------------------------

export interface ProjectFormValues {
  name: string;
  description: string;
  status: string;
  startDate: string;
  deadline: string;
}

export async function createProjectAction(values: ProjectFormValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can create projects.");

  const name = values.name.trim();
  if (!name) return error("Project name is required.");

  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) return error("Company not found.");

  const { error: insertError } = await supabase
    .from("projects")
    .insert({
      company_id: company.id,
      created_by: user.id,
      name,
      description: values.description.trim() || null,
      status: values.status || "planning",
      start_date: values.startDate ? new Date(values.startDate).toISOString().slice(0, 10) : null,
      deadline: values.deadline ? new Date(values.deadline).toISOString().slice(0, 10) : null,
    });

  if (insertError) return error("Failed to create project: " + insertError.message);

  revalidatePath("/company/projects");
  revalidatePath("/company/dashboard");
  return { success: true };
}

export async function updateProjectStatusAction(projectId: string, status: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can update projects.");

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (updateError) return error("Failed to update project status.");

  revalidatePath("/company/projects");
  revalidatePath("/company/projects/[id]");
  return { success: true };
}

// ---------------------------------------------------------------
// Messages
// ---------------------------------------------------------------

export async function sendMessageAction(conversationId: string, text: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  const clean = text.trim();
  if (!clean) return error("Message cannot be empty.");

  const supabase = await createClient();
  
  const { error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      text: clean,
    });

  if (insertError) return error("Failed to send message: " + insertError.message);

  revalidatePath("/company/messages");
  revalidatePath("/dashboard/workspace/messages");
  return { success: true };
}

// ---------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------

export interface EventFormValues {
  title: string;
  date: string;
  time: string;
  participants: string[];
  type: "interview" | "meeting" | "deadline" | "event";
}

export async function createEventAction(values: EventFormValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can schedule events.");

  const title = values.title.trim();
  if (!title) return error("Event title is required.");
  if (!values.date) return error("Event date is required.");

  const supabase = await createClient();
  
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) return error("Company not found.");

  const { data: event, error: insertError } = await supabase
    .from("calendar_events")
    .insert({
      company_id: company.id,
      created_by: user.id,
      title,
      event_date: new Date(values.date).toISOString().slice(0, 10),
      event_time: values.time.trim() || null,
      type: values.type || "event",
    })
    .select("id")
    .single();

  if (insertError) return error("Failed to create event: " + insertError.message);

  // Add participants
  const participants = values.participants.map((p) => p.trim()).filter(Boolean);
  if (participants.length > 0 && event) {
    for (const pid of participants) {
      await supabase.from("calendar_event_participants").insert({
        event_id: event.id,
        user_id: pid,
      });
    }
  }

  revalidatePath("/company/calendar");
  revalidatePath("/company/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------

export async function createAnnouncementAction({
  title,
  message,
  audience,
  publishDate,
}: {
  title: string;
  message: string;
  audience: string;
  publishDate: string;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can publish announcements.");

  if (!title.trim()) return error("Announcement title is required.");
  if (!message.trim()) return error("Announcement message is required.");

  const supabase = await createClient();
  
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) return error("Company not found.");

  const { error: insertError } = await supabase
    .from("announcements")
    .insert({
      company_id: company.id,
      created_by: user.id,
      title: title.trim(),
      message: message.trim(),
      audience: audience.trim() || "All Employees",
      publish_date: publishDate ? new Date(publishDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    });

  if (insertError) return error("Failed to create announcement: " + insertError.message);

  revalidatePath("/company/announcements");
  revalidatePath("/company/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------
// Company profile (persisted to public.companies)
// ---------------------------------------------------------------

export interface CompanyProfileValues {
  name: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  description: string;
}

export async function saveCompanyProfileAction(values: CompanyProfileValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can update the company profile.");

  if (!values.name.trim()) return error("Company name is required.");

  const supabase = await createClient();
  
  // See if company exists for this user
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from("companies")
      .update({
        name: values.name.trim(),
        industry: values.industry.trim() || null,
        company_size: values.companySize.trim() || null,
        location: values.location.trim() || null,
        website: values.website.trim() || null,
        description: values.description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (updateError) return error("Could not save company profile. Please try again.");
  } else {
    const { error: insertError } = await supabase
      .from("companies")
      .insert({
        created_by: user.id,
        name: values.name.trim(),
        industry: values.industry.trim() || null,
        company_size: values.companySize.trim() || null,
        location: values.location.trim() || null,
        website: values.website.trim() || null,
        description: values.description.trim() || null,
      });
    if (insertError) return error("Could not create company profile. Please try again.");
  }

  // Set onboarding_completed if not already
  await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);

  revalidatePath("/company/profile");
  revalidatePath("/company/dashboard");
  revalidatePath("/onboarding/hrd");
  return { success: true };
}
