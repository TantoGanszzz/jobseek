"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  assignTest,
  companyProfileFromMeta,
  createAnnouncement,
  createEvent,
  createJob,
  createProject,
  createTask,
  getConversationById,
  getEmployeeForUser,
  getOrCreateGeneralConversation,
  getProjectById,
  getTaskById,
  notify,
  reviewTest,
  scheduleInterview,
  sendMessage,
  updateApplicantStatus as storeUpdateApplicantStatus,
  updateJobStatus as storeUpdateJobStatus,
  updateTaskStatus as storeUpdateTaskStatus,
} from "@/lib/hrd/store";
import type { JobPosting, Project, Task } from "@/lib/hrd/types";

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
    logDevelopmentSupabase("Create Job authentication", { userPresent: false, table: "auth.users", operation: "getUser", success: false });
    return error("You must be signed in.");
  }

  const supabase = await createClient();
  const role = user.user_metadata?.role;
  if (role !== "hrd" && role !== "admin") return error("You do not have permission to create jobs.");

  const title = values.title.trim();
  if (!title) return error("Job title is required.");
  if (!values.location.trim()) return error("Location is required.");

  // The configured Supabase project does not expose the local project's
  // assumed `public.jobs` / `public.companies` schema. Do not guess at an
  // HRD table or create a disconnected record.
  return error("Struktur data HRD/perusahaan belum tersedia di Supabase yang terhubung. Hubungi pengelola sistem.");
}

export async function updateJobStatusAction(jobId: string, status: JobPosting["status"]): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("You do not have permission to change jobs.");
  if (!["draft", "active", "paused", "closed"].includes(status)) return error("Invalid job status.");
  return error("Struktur data HRD/perusahaan belum tersedia di Supabase yang terhubung. Hubungi pengelola sistem.");
}

// ---------------------------------------------------------------
// Applicants
// ---------------------------------------------------------------

export async function updateApplicantStatusAction(applicantId: string, status: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can update applicant status.");

  const result = await storeUpdateApplicantStatus(applicantId, status);
  if (!result) return error("Applicant not found.");
  if ("error" in result) return error(result.error);

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

  const result = await scheduleInterview(applicantId, {
    title: input.title,
    date: input.date,
    time: input.time || null,
    location: input.location || null,
    durationMinutes: input.durationMinutes ? Number(input.durationMinutes) || null : null,
    notes: input.notes || null,
  });
  if (!result) return error("Applicant not found.");
  if ("error" in result) return error(result.error);

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

  const kind = input.kind === "challenge" ? "challenge" : "quiz";
  const result = await assignTest(applicantId, {
    kind,
    title: input.title || undefined,
    description: kind === "challenge" ? input.description || undefined : undefined,
    instructions: kind === "challenge" ? input.instructions || undefined : undefined,
    deadline: kind === "challenge" ? input.deadline || undefined : undefined,
    minScore: input.minScore ? Number(input.minScore) || undefined : undefined,
    timeLimitMinutes: input.timeLimitMinutes ? Number(input.timeLimitMinutes) || undefined : undefined,
  });
  if (!result) return error("Applicant not found.");
  if ("error" in result) return error(result.error);

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

  const result = await reviewTest(assignmentId, {
    score: Number(input.score) || 0,
    feedback: input.feedback || undefined,
    decision: input.decision,
  });
  if (!result) return error("Assessment not found.");
  if ("error" in result) return error(result.error);

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
  priority: Task["priority"];
  startDate: string;
  deadline: string;
}

export async function createTaskAction(values: TaskFormValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can create tasks.");

  const title = values.title.trim();
  if (!title) return error("Task title is required.");

  const projectId = values.projectId || null;
  const project = projectId ? getProjectById(projectId) : null;
  const assigneeId = values.assigneeId || null;
  const assigneeName = assigneeId || "";

  await createTask(user.id, {
    title,
    description: values.description.trim() || null,
    projectId,
    projectName: project?.name ?? null,
    assigneeId,
    assigneeName,
    priority: values.priority || "medium",
    startDate: values.startDate ? new Date(values.startDate).toISOString().slice(0, 10) : null,
    deadline: values.deadline ? new Date(values.deadline).toISOString().slice(0, 10) : null,
    status: "todo",
  });

  revalidatePath("/company/tasks");
  revalidatePath("/company/projects");
  revalidatePath("/company/dashboard");
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: Task["status"]): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  const task = getTaskById(taskId);
  if (!task) return error("Task not found.");

  const isOwner = task.createdBy === user.id && isHrdOrAdmin(user);
  const isAssignee = task.assigneeId && task.assigneeId === user.id && !isHrdOrAdmin(user);

  if (!isOwner && !isAssignee) return error("You do not have permission to update this task.");

  // Employees may only start or submit their own tasks.
  if (!isOwner && status !== "in_progress" && status !== "in_review") {
    return error("You can only start a task or submit it for review.");
  }

  const result = await storeUpdateTaskStatus(taskId, status);
  if (!result) return error("Task not found.");
  if ("error" in result) return error(result.error);

  if (task.assigneeId) {
    const recipient = isOwner ? task.assigneeId : task.createdBy;
    notify(
      recipient,
      "task",
      `Task "${task.title}" was moved to ${status}.`
    );
  }

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
  status: Project["status"];
  startDate: string;
  deadline: string;
}

export async function createProjectAction(values: ProjectFormValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can create projects.");

  const name = values.name.trim();
  if (!name) return error("Project name is required.");

  await createProject(user.id, {
    name,
    description: values.description.trim() || null,
    status: values.status || "planning",
    startDate: values.startDate ? new Date(values.startDate).toISOString().slice(0, 10) : null,
    deadline: values.deadline ? new Date(values.deadline).toISOString().slice(0, 10) : null,
    memberIds: [],
    memberNames: [],
  });

  revalidatePath("/company/projects");
  revalidatePath("/company/dashboard");
  return { success: true };
}

export async function updateProjectStatusAction(projectId: string, status: Project["status"]): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return error("You must be signed in.");
  if (!isHrdOrAdmin(user)) return error("Only HRD can update projects.");

  const project = getProjectById(projectId);
  if (!project) return error("Project not found.");
  project.status = status;

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

  const name =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user.email?.split("@")[0] ||
    "User";

  let conversation = getConversationById(conversationId);
  if (!conversation && isHrdOrAdmin(user)) {
    conversation = getOrCreateGeneralConversation(user.id);
  }
  if (!conversation) return error("Conversation not found.");

  const isHrd = isHrdOrAdmin(user);

  // Employees (non-HRD) may only post in their own 1:1 thread or a channel
  // they can see as a hired team member.
  if (!isHrd) {
    const isMember = conversation.memberId === user.id;
    const isChannelMember = conversation.channel && !!getEmployeeForUser(user.id);
    if (!isMember && !isChannelMember) {
      return error("You do not have access to this conversation.");
    }
  }

  sendMessage(conversation.id, user.id, name, clean);
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

  createEvent(user.id, {
    title,
    date: new Date(values.date).toISOString().slice(0, 10),
    time: values.time.trim() || null,
    participants: values.participants.map((p) => p.trim()).filter(Boolean),
    type: values.type || "event",
  });

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

  createAnnouncement(user.id, {
    title: title.trim(),
    message: message.trim(),
    audience: audience.trim() || "All Employees",
    publishDate: publishDate ? new Date(publishDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  });

  revalidatePath("/company/announcements");
  revalidatePath("/company/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------
// Company profile (persisted to HRD's own auth metadata)
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
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      company_profile: {
        name: values.name.trim(),
        industry: values.industry.trim(),
        companySize: values.companySize.trim(),
        location: values.location.trim(),
        website: values.website.trim(),
        description: values.description.trim(),
        updatedAt: new Date().toISOString(),
      },
    },
  });

  if (updateError) return error("Could not save company profile. Please try again.");

  revalidatePath("/company/profile");
  revalidatePath("/company/dashboard");
  return { success: true };
}
