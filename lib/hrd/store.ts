// In-memory HRD workspace store.
//
// IMPORTANT: This is a DEV-ONLY state model. Nothing here is persisted to
// Supabase. Data resets when the Next.js server restarts.
//
// TODO: Connect to Supabase tables when the database schema is available:
//   - JobPosting      -> public.jobs
//   - Applicant       -> public.applications (+ join public.profiles)
//   - Employee        -> public.employees
//   - Task            -> public.tasks
//   - Project         -> public.projects
//   - Conversation    -> public.conversations
//   - ChatMessage     -> public.messages
//   - CalendarEvent   -> public.calendar_events
//   - Announcement    -> public.announcements
//   - ActivityItem    -> public.company_activity
//   - SavedJob        -> public.saved_jobs
//   - TestAssignment  -> public.qualification_test_attempts
//   - AppNotification -> public.notifications
//
// Every write helper keeps the same signature so callers do not change when
// the real database lands — only this file's internals need replacing.

import { DEFAULT_JOB_STAGES } from "./types";
import type {
  ActivityItem,
  Announcement,
  Applicant,
  ApplicantStatus,
  AppNotification,
  CalendarEvent,
  ChatMessage,
  CompanyProfile,
  Conversation,
  Employee,
  Interview,
  JobPosting,
  Project,
  SavedJob,
  Task,
  TestAssignment,
  TestKind,
  TestQuestion,
  TestSubmission,
} from "./types";

interface HrdData {
  jobs: JobPosting[];
  applicants: Applicant[];
  employees: Employee[];
  tasks: Task[];
  projects: Project[];
  conversations: Conversation[];
  messages: ChatMessage[];
  events: CalendarEvent[];
  announcements: Announcement[];
  activity: ActivityItem[];
  savedJobs: SavedJob[];
  testAssignments: TestAssignment[];
  notifications: AppNotification[];
}

export const COMPANY_PROFILE_KEY = "company_profile";

const data: HrdData = {
  jobs: [],
  applicants: [],
  employees: [],
  tasks: [],
  projects: [],
  conversations: [],
  messages: [],
  events: [],
  announcements: [],
  activity: [],
  savedJobs: [],
  testAssignments: [],
  notifications: [],
};

function uid(): string {
  return crypto.randomUUID();
}

export function pushActivity(createdBy: string, type: string, text: string) {
  data.activity.unshift({
    id: uid(),
    createdBy,
    type,
    text,
    createdAt: new Date().toISOString(),
  });
  data.activity = data.activity.slice(0, 50);
}

// ---------------------------------------------------------------
// Notifications (reader + writer, table-shaped storage)
// ---------------------------------------------------------------

export function notify(userId: string, type: AppNotification["type"], text: string) {
  data.notifications.push({
    id: uid(),
    userId,
    type,
    text,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

export function getNotificationsByUser(userId: string): AppNotification[] {
  return data.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadNotificationCount(userId: string): number {
  return data.notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function markNotificationsRead(userId: string) {
  for (const n of data.notifications) {
    if (n.userId === userId) n.read = true;
  }
}

// ---------------------------------------------------------------
// Saved jobs
// ---------------------------------------------------------------

export function saveJob(userId: string, jobId: string) {
  if (data.savedJobs.some((s) => s.userId === userId && s.jobId === jobId)) return;
  data.savedJobs.push({ id: uid(), userId, jobId, savedAt: new Date().toISOString() });
}

export function unsaveJob(userId: string, jobId: string) {
  data.savedJobs = data.savedJobs.filter((s) => !(s.userId === userId && s.jobId === jobId));
}

export function isJobSaved(userId: string, jobId: string): boolean {
  return data.savedJobs.some((s) => s.userId === userId && s.jobId === jobId);
}

export function getSavedJobsByUser(userId: string): SavedJob[] {
  return data.savedJobs
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

// ---------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------

export function getJobsByOwner(createdBy: string): JobPosting[] {
  return data.jobs
    .filter((j) => j.createdBy === createdBy)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getJobById(id: string): JobPosting | null {
  return data.jobs.find((j) => j.id === id) ?? null;
}

export function getAllJobs(): JobPosting[] {
  return data.jobs;
}

export function createJob(
  createdBy: string,
  values: Omit<JobPosting, "id" | "createdBy" | "createdAt">
): JobPosting {
  const job: JobPosting = {
    ...values,
    stages: values.stages?.length ? values.stages : DEFAULT_JOB_STAGES,
    id: uid(),
    createdBy,
    createdAt: new Date().toISOString(),
  };
  data.jobs.push(job);
  pushActivity(createdBy, "job", `Job "${job.title}" was published.`);
  return job;
}

export function updateJobStatus(id: string, status: JobPosting["status"]): JobPosting | null {
  const job = getJobById(id);
  if (!job) return null;
  job.status = status;
  pushActivity(job.createdBy, "job", `Job "${job.title}" was ${status}.`);
  return job;
}

// ---------------------------------------------------------------
// Applicants
// ---------------------------------------------------------------

export function getApplicantsByOwner(createdBy: string): Applicant[] {
  return data.applicants
    .filter((a) => a.createdBy === createdBy)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
}

export function getApplicantById(id: string): Applicant | null {
  return data.applicants.find((a) => a.id === id) ?? null;
}

// Called when a signed-in candidate applies to one of your jobs. The X-HRD
// owner is resolved server-side before this is invoked.
// TODO: Move to a dedicated applications service endpoint when public.applications
// exists — candidates should not write directly into the HRD workspace store.
export function createApplicant(
  createdBy: string,
  values: Omit<
    Applicant,
    "id" | "createdBy" | "statusHistory" | "interview" | "testAssignmentId"
  >
): Applicant {
  const applicant: Applicant = {
    ...values,
    createdBy,
    statusHistory: [{ status: "new", at: new Date().toISOString(), note: "Application received." }],
    interview: null,
    testAssignmentId: null,
    qualScore: null,
    qualMinScore: null,
    id: uid(),
  };
  data.applicants.push(applicant);
  getOrCreateApplicantThread(createdBy, applicant.userId, applicant.candidateName);
  const job = getJobById(applicant.jobId);
  notify(createdBy, "applicant", `New applicant: ${applicant.candidateName} applied for "${job?.title ?? "your job"}".`);
  pushActivity(createdBy, "applicant", `${applicant.candidateName} applied.`);
  return applicant;
}

export function getApplicantsByCandidate(userId: string): Applicant[] {
  return data.applicants
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
}

export function getApplicantByJobAndUser(jobId: string, userId: string): Applicant | null {
  return data.applicants.find((a) => a.jobId === jobId && a.userId === userId) ?? null;
}

export function getApplicantForUser(appId: string, userId: string): Applicant | null {
  return data.applicants.find((a) => a.id === appId && a.userId === userId) ?? null;
}

const VALID_APPLICANT_STATUSES = ["new", "screening", "test", "interview", "final_review", "hired", "rejected"];

// Appends a status transition and notifies the candidate (and the HRD).
function moveApplicantStatus(
  applicant: Applicant,
  status: ApplicantStatus,
  note: string | null
) {
  applicant.status = status;
  applicant.statusHistory.push({
    status,
    at: new Date().toISOString(),
    note: note ?? `HRD moved the application to ${status}.`,
  });
  const job = getJobById(applicant.jobId);
  notify(
    applicant.userId,
    "status",
    `Your application for "${job?.title ?? "the position"}" is now ${status}.`
  );
  pushActivity(
    applicant.createdBy,
    "applicant",
    `${applicant.candidateName} was moved to ${status}.`
  );
}

export function updateApplicantStatus(
  id: string,
  status: string
): Applicant | { error: string } | null {
  if (!VALID_APPLICANT_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }
  const applicant = getApplicantById(id);
  if (!applicant) return null;
  moveApplicantStatus(
    applicant,
    status as ApplicantStatus,
    `HRD moved the application to ${status}.`
  );
  const job = getJobById(applicant.jobId);
  if (status === "hired") {
    hireApplicant(applicant);
    notify(
      applicant.userId,
      "status",
      `Congratulations! You were hired for "${job?.title ?? "the position"}". Your workspace is now active.`
    );
  }
  if (status === "rejected") {
    notify(
      applicant.userId,
      "status",
      `Your application for "${job?.title ?? "the position"}" was not selected.`
    );
  }
  return applicant;
}

function hireApplicant(applicant: Applicant) {
  const existing = data.employees.find(
    (e) => e.id === applicant.userId && e.createdBy === applicant.createdBy
  );
  const employee: Employee = {
    id: applicant.userId,
    createdBy: applicant.createdBy,
    name: applicant.candidateName,
    position: applicant.candidateHeadline ?? "Member",
    department: "General",
    email: applicant.candidateEmail,
    phone: applicant.candidatePhone,
    location: applicant.candidateLocation,
    skills: applicant.candidateSkills,
    joinedDate: new Date().toISOString().slice(0, 10),
    status: "active",
  };
  if (existing) {
    Object.assign(existing, employee);
  } else {
    data.employees.push(employee);
  }
  getOrCreateGeneralConversation(applicant.createdBy);
  pushActivity(
    applicant.createdBy,
    "hire",
    `${applicant.candidateName} was hired and added to your team.`
  );
}

// ---------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------

export function scheduleInterview(
  applicantId: string,
  input: {
    title: string;
    date: string;
    time: string | null;
    location: string | null;
    durationMinutes: number | null;
    notes: string | null;
  }
): Applicant | { error: string } | null {
  const applicant = getApplicantById(applicantId);
  if (!applicant) return null;
  if (!input.title.trim()) return { error: "Interview title is required." };
  if (!input.date) return { error: "Interview date is required." };

  const interview: Interview = {
    id: uid(),
    title: input.title.trim(),
    date: input.date,
    time: input.time || null,
    location: input.location?.trim() || null,
    durationMinutes: input.durationMinutes,
    notes: input.notes?.trim() || null,
    scheduledAt: new Date().toISOString(),
  };
  applicant.interview = interview;
  applicant.status = "interview";
  applicant.statusHistory.push({
    status: "interview",
    at: new Date().toISOString(),
    note: `Interview scheduled: ${interview.title} on ${interview.date}${interview.time ? ` at ${interview.time}` : ""}.`,
  });

  const job = getJobById(applicant.jobId);
  createEvent(applicant.createdBy, {
    title: `Interview: ${applicant.candidateName} — ${job?.title ?? "Position"}`,
    date: interview.date,
    time: interview.time,
    participants: [applicant.userId],
    type: "interview",
  });
  notify(
    applicant.userId,
    "interview",
    `Your interview for "${job?.title ?? "the position"}" is scheduled on ${interview.date}${interview.time ? ` at ${interview.time}` : ""}.`
  );
  return applicant;
}

// ---------------------------------------------------------------
// Qualification tests
// ---------------------------------------------------------------

const PROFICIENCY_OPTIONS = [
  { label: "No experience", weight: 0 },
  { label: "Beginner", weight: 25 },
  { label: "Intermediate", weight: 50 },
  { label: "Advanced", weight: 75 },
  { label: "Expert", weight: 100 },
];

export function buildTestQuestions(skills: string[]): TestQuestion[] {
  const unique = Array.from(new Set(skills.map((s) => s.trim()).filter(Boolean))).slice(0, 8);
  return unique.map((skill) => ({
    skill,
    question: `How would you rate your hands-on experience with ${skill}?`,
    options: PROFICIENCY_OPTIONS.map((o) => `${o.label} (${o.weight})`),
    weights: PROFICIENCY_OPTIONS.map((o) => o.weight),
  }));
}

export function assignTest(
  applicantId: string,
  input: {
    kind?: TestKind;
    title?: string;
    description?: string;
    instructions?: string;
    deadline?: string;
    minScore?: number;
    timeLimitMinutes?: number;
  }
): TestAssignment | { error: string } | null {
  const applicant = getApplicantById(applicantId);
  if (!applicant) return null;
  const job = getJobById(applicant.jobId);
  if (!job) return { error: "Job not found." };

  const kind: TestKind = input.kind === "challenge" ? "challenge" : "quiz";
  const minScore = Math.min(100, Math.max(0, input.minScore ?? job.minQualificationScore));

  let questions: TestQuestion[] = [];
  if (kind === "quiz") {
    const skills = [...job.skills, ...job.preferredSkills];
    if (skills.length === 0) {
      return {
        error: "This job has no skills. Add required or preferred skills to the job before sending a test.",
      };
    }
    questions = buildTestQuestions(skills);
  }

  const description = kind === "challenge" ? input.description?.trim() || null : null;
  const instructions = kind === "challenge" ? input.instructions?.trim() || null : null;
  const deadline =
    kind === "challenge" && input.deadline
      ? new Date(input.deadline).toISOString().slice(0, 10)
      : null;

  const assignment: TestAssignment = {
    id: uid(),
    applicationId: applicant.id,
    jobId: job.id,
    candidateId: applicant.userId,
    createdBy: applicant.createdBy,
    kind,
    title: input.title?.trim() || (kind === "challenge" ? `Technical Challenge — ${job.title}` : `Qualification Test — ${job.title}`),
    description,
    instructions,
    deadline,
    questions,
    minScore,
    timeLimitMinutes: Math.max(5, Math.min(180, input.timeLimitMinutes ?? 30)),
    status: "pending",
    score: null,
    passed: null,
    answers: [],
    submission: null,
    reviewScore: null,
    reviewFeedback: null,
    reviewedBy: null,
    reviewedAt: null,
    assignedAt: new Date().toISOString(),
    completedAt: null,
  };
  data.testAssignments.push(assignment);

  applicant.testAssignmentId = assignment.id;
  applicant.status = "test";
  applicant.statusHistory.push({
    status: "test",
    at: new Date().toISOString(),
    note:
      kind === "challenge"
        ? `Technical challenge assigned: ${assignment.title} (passing score ${minScore}/100).`
        : `Qualification test assigned: ${assignment.title} (min ${minScore}/100).`,
  });
  notify(
    applicant.userId,
    "test",
    kind === "challenge"
      ? `You have a new technical challenge for "${job.title}". Complete it to continue your application.`
      : `You have a new qualification test for "${job.title}". Complete it to continue your application.`
  );
  return assignment;
}

export function submitChallenge(
  assignmentId: string,
  candidateId: string,
  input: {
    gitHubUrl?: string;
    liveDemoUrl?: string;
    textAnswer?: string;
    notes?: string;
  }
): TestAssignment | { error: string } | null {
  const assignment = getTestAssignmentForUser(assignmentId, candidateId);
  if (!assignment) return null;
  if (assignment.kind !== "challenge") return { error: "This test is a qualification quiz, not a challenge." };
  if (assignment.status !== "pending") {
    return { error: "This challenge has already been submitted and cannot be changed." };
  }
  const gitHubUrl = input.gitHubUrl?.trim() || null;
  const liveDemoUrl = input.liveDemoUrl?.trim() || null;
  const textAnswer = input.textAnswer?.trim() || null;
  const notes = input.notes?.trim() || null;
  if (!gitHubUrl && !liveDemoUrl && !textAnswer) {
    return { error: "Submit at least a GitHub URL, a live demo URL, or a text answer." };
  }
  if (assignment.deadline) {
    const today = new Date().toISOString().slice(0, 10);
    if (today > assignment.deadline) {
      return { error: "The submission deadline has passed and this challenge is closed." };
    }
  }

  assignment.submission = {
    gitHubUrl,
    liveDemoUrl,
    textAnswer,
    notes,
    submittedAt: new Date().toISOString(),
  };
  assignment.status = "submitted";
  assignment.completedAt = null;

  const applicant = getApplicantByJobAndUser(assignment.jobId, assignment.candidateId);
  const job = getJobById(assignment.jobId);
  if (applicant) {
    applicant.statusHistory.push({
      status: "test",
      at: assignment.submission.submittedAt,
      note: `Technical challenge submitted for review.`,
    });
  }
  notify(
    candidateId,
    "test",
    `Your technical challenge for "${job?.title ?? "the position"}" was submitted. The company will review it.`
  );
  notify(
    assignment.createdBy,
    "test",
    `${applicant?.candidateName ?? "A candidate"} submitted the challenge for "${job?.title ?? "the position"}" — ready for review.`
  );
  pushActivity(
    assignment.createdBy,
    "test",
    `${applicant?.candidateName ?? "A candidate"} submitted the technical challenge for "${job?.title ?? "the position"}".`
  );
  return assignment;
}

export function reviewTest(
  assignmentId: string,
  input: {
    score: number;
    feedback?: string;
    decision: "pass" | "fail";
  }
): TestAssignment | { error: string } | null {
  const assignment = getTestAssignmentById(assignmentId);
  if (!assignment) return null;
  if (assignment.kind !== "challenge") return { error: "Only challenges are reviewed manually." };
  if (assignment.status === "completed") return { error: "This challenge was already reviewed." };

  const score = Math.min(100, Math.max(0, Math.round(Number(input.score) || 0)));
  const passed = input.decision === "pass";
  const feedback = input.feedback?.trim() || null;

  assignment.reviewScore = score;
  assignment.reviewFeedback = feedback;
  assignment.passed = passed;
  assignment.reviewedBy = assignment.createdBy;
  assignment.reviewedAt = new Date().toISOString();
  assignment.status = "completed";
  assignment.score = score;
  assignment.completedAt = assignment.reviewedAt;

  const applicant = getApplicantByJobAndUser(assignment.jobId, assignment.candidateId);
  const job = getJobById(assignment.jobId);
  if (applicant) {
    const note = `Technical challenge reviewed: ${score}/100 — ${passed ? "passed" : "failed"}.`;
    if (passed) {
      applicant.statusHistory.push({ status: "interview", at: assignment.completedAt, note });
      applicant.status = "interview";
      notify(
        applicant.userId,
        "status",
        `Great news! You passed the technical challenge for "${job?.title ?? "the position"}". You are moving on to the interview stage.`
      );
      pushActivity(
        applicant.createdBy,
        "applicant",
        `${applicant.candidateName} passed the technical challenge and moved to interview.`
      );
    } else {
      applicant.statusHistory.push({ status: "rejected", at: assignment.completedAt, note });
      applicant.status = "rejected";
      notify(
        applicant.userId,
        "status",
        `Your application for "${job?.title ?? "the position"}" was not selected after the technical challenge.`
      );
      pushActivity(
        applicant.createdBy,
        "applicant",
        `${applicant.candidateName} did not pass the technical challenge.`
      );
    }
  }

  notify(
    assignment.createdBy,
    "test",
    `${applicant?.candidateName ?? "A candidate"} scored ${score}/100 on "${assignment.title}" — ${passed ? "passed" : "failed"}.`
  );
  return assignment;
}

export function getTestAssignmentsByCandidate(candidateId: string): TestAssignment[] {
  return data.testAssignments
    .filter((t) => t.candidateId === candidateId)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
}

export function getTestAssignmentForUser(
  assignmentId: string,
  candidateId: string
): TestAssignment | null {
  return (
    data.testAssignments.find((t) => t.id === assignmentId && t.candidateId === candidateId) ??
    null
  );
}

export function getTestAssignmentsByOwner(createdBy: string): TestAssignment[] {
  return data.testAssignments
    .filter((t) => t.createdBy === createdBy)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
}

export function getTestAssignmentById(assignmentId: string): TestAssignment | null {
  return data.testAssignments.find((t) => t.id === assignmentId) ?? null;
}

export function hasPendingTestFor(candidateId: string, applicationId: string): boolean {
  return data.testAssignments.some(
    (t) =>
      t.candidateId === candidateId &&
      t.applicationId === applicationId &&
      t.status === "pending"
  );
}

export function recordTestResult(
  assignmentId: string,
  candidateId: string,
  answers: number[]
): TestAssignment | { error: string } | null {
  const assignment = getTestAssignmentForUser(assignmentId, candidateId);
  if (!assignment) return null;
  if (assignment.status === "completed") {
    return { error: "This test has already been completed." };
  }
  if (!Array.isArray(answers) || answers.length !== assignment.questions.length) {
    return { error: "Invalid answers submitted." };
  }

  let total = 0;
  for (let i = 0; i < assignment.questions.length; i++) {
    const q = assignment.questions[i];
    const answer = answers[i];
    if (typeof answer !== "number" || answer < 0 || answer >= q.options.length) {
      return { error: "Invalid answer format." };
    }
    total += q.weights[answer];
  }
  const score = Math.round(total / assignment.questions.length);
  const passed = score >= assignment.minScore;

  assignment.status = "completed";
  assignment.score = score;
  assignment.passed = passed;
  assignment.answers = answers.map(Number);
  assignment.completedAt = new Date().toISOString();

  const applicant = getApplicantByJobAndUser(assignment.jobId, assignment.candidateId);
  if (applicant) {
    applicant.qualScore = score;
    applicant.qualMinScore = assignment.minScore;
    applicant.statusHistory.push({
      status: "test",
      at: assignment.completedAt,
      note: `Qualification test submitted: ${score}/100${passed ? " (passed)" : " (below minimum)"}.`,
    });
  }

  const job = getJobById(assignment.jobId);
  notify(
    assignment.candidateId,
    "test",
    passed
      ? `You passed the qualification test for "${job?.title ?? "the position"}" (${score}/${assignment.minScore}).`
      : `Your qualification test for "${job?.title ?? "the position"}" scored ${score}/100 (minimum ${assignment.minScore}).`,
  );
  notify(
    assignment.createdBy,
    "test",
    `${applicant?.candidateName ?? "A candidate"} submitted the test for "${job?.title ?? "the position"}": ${score}/100${passed ? " — passed" : " — below minimum"}.`,
  );
  return assignment;
}

// ---------------------------------------------------------------
// Employees
// ---------------------------------------------------------------

export function getEmployeesByOwner(createdBy: string): Employee[] {
  return data.employees.filter((e) => e.createdBy === createdBy);
}

export function getEmployeeById(id: string, createdBy: string): Employee | null {
  return (
    data.employees.find((e) => e.id === id && e.createdBy === createdBy) ?? null
  );
}

// Finds an employee by auth user id across owners (used by the employee's own
// workspace to resolve their company/HRD).
export function getEmployeeForUser(userId: string): Employee | null {
  return data.employees.find((e) => e.id === userId) ?? null;
}

// ---------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------

export function getTasksByOwner(createdBy: string): Task[] {
  return data.tasks
    .filter((t) => t.createdBy === createdBy)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTasksByAssignee(userId: string): Task[] {
  return data.tasks
    .filter((t) => t.assigneeId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTaskById(id: string): Task | null {
  return data.tasks.find((t) => t.id === id) ?? null;
}

export function createTask(
  createdBy: string,
  values: Omit<Task, "id" | "createdBy" | "createdAt">
): Task {
  const task: Task = { ...values, id: uid(), createdBy, createdAt: new Date().toISOString() };
  data.tasks.push(task);
  const assignee = values.assigneeName ? ` to ${values.assigneeName}` : "";
  pushActivity(createdBy, "task", `Task "${task.title}" assigned${assignee}.`);
  if (values.assigneeId) {
    notify(
      values.assigneeId,
      "task",
      `You were assigned a new task: "${task.title}".`
    );
  }
  return task;
}

const VALID_TASK_STATUSES = ["todo", "in_progress", "in_review", "completed"];

export function updateTaskStatus(
  id: string,
  status: string
): Task | { error: string } | null {
  if (!VALID_TASK_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }
  const task = getTaskById(id);
  if (!task) return null;
  task.status = status as Task["status"];
  const verb =
    status === "in_progress"
      ? "started"
      : status === "in_review"
        ? "submitted for review"
        : status === "completed"
          ? "approved"
          : "moved back to todo";
  pushActivity(task.createdBy, "task", `Task "${task.title}" was ${verb}.`);
  return task;
}

// ---------------------------------------------------------------
// Projects
// ---------------------------------------------------------------

export function getProjectsByOwner(createdBy: string): Project[] {
  return data.projects
    .filter((p) => p.createdBy === createdBy)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProjectById(id: string): Project | null {
  return data.projects.find((p) => p.id === id) ?? null;
}

export function createProject(
  createdBy: string,
  values: Omit<Project, "id" | "createdBy" | "createdAt">
): Project {
  const project: Project = { ...values, id: uid(), createdBy, createdAt: new Date().toISOString() };
  data.projects.push(project);
  pushActivity(createdBy, "project", `Project "${project.name}" was created.`);
  for (const memberId of project.memberIds) {
    notify(memberId, "project", `You were added to project "${project.name}".`);
  }
  return project;
}

// ---------------------------------------------------------------
// Messages
// ---------------------------------------------------------------

export function getOrCreateGeneralConversation(createdBy: string): Conversation {
  let conv = data.conversations.find(
    (c) => c.createdBy === createdBy && c.channel && c.name === "General"
  );
  if (!conv) {
    conv = {
      id: uid(),
      createdBy,
      name: "General",
      channel: true,
      memberId: null,
      lastMessageAt: null,
    };
    data.conversations.push(conv);
  }
  return conv;
}

export function getConversationsByOwner(createdBy: string): Conversation[] {
  return data.conversations
    .filter((c) => c.createdBy === createdBy)
    .map((c) => {
      const last = getMessages(c.id)[0];
      return { ...c, lastMessageAt: last?.createdAt ?? c.lastMessageAt };
    })
    .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

// Conversations a non-HRD user (candidate during recruitment, employee after
// hire) can see: their own 1:1 thread(s) plus the company channel once hired.
export function getConversationsForMember(userId: string): Conversation[] {
  return data.conversations
    .filter((c) => {
      if (c.memberId === userId) return true;
      const employee = getEmployeeForUser(userId);
      if (c.channel && employee && c.createdBy === employee.createdBy) return true;
      return false;
    })
    .map((c) => {
      const last = getMessages(c.id)[0];
      return { ...c, lastMessageAt: last?.createdAt ?? c.lastMessageAt };
    })
    .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

// 1:1 thread between the HRD and one candidate/employee.
export function getOrCreateApplicantThread(
  createdBy: string,
  memberId: string,
  memberName: string
): Conversation {
  let conv = data.conversations.find(
    (c) => c.createdBy === createdBy && !c.channel && c.memberId === memberId
  );
  if (!conv) {
    conv = {
      id: uid(),
      createdBy,
      name: `Chat with ${memberName}`,
      channel: false,
      memberId,
      lastMessageAt: null,
    };
    data.conversations.push(conv);
  }
  return conv;
}

export function getApplicantThread(createdBy: string, memberId: string): Conversation | null {
  return (
    data.conversations.find(
      (c) => c.createdBy === createdBy && !c.channel && c.memberId === memberId
    ) ?? null
  );
}

export function getConversationById(id: string): Conversation | null {
  return data.conversations.find((c) => c.id === id) ?? null;
}

export function getMessages(conversationId: string): ChatMessage[] {
  return data.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string
): ChatMessage {
  const message: ChatMessage = {
    id: uid(),
    conversationId,
    senderId,
    senderName,
    text,
    createdAt: new Date().toISOString(),
  };
  data.messages.push(message);
  const conv = getConversationById(conversationId);
  if (conv) conv.lastMessageAt = message.createdAt;
  if (conv) {
    const recipient =
      senderId === conv.createdBy ? conv.memberId : conv.createdBy;
    if (recipient && recipient !== senderId) {
      notify(
        recipient,
        "message",
        `New message from ${senderName}: ${cleanText(text)}`
      );
    }
  }
  return message;
}

function cleanText(text: string): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > 120 ? `${oneLine.slice(0, 120)}…` : oneLine;
}

// ---------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------

export function getEventsByOwner(createdBy: string): CalendarEvent[] {
  return data.events
    .filter((e) => e.createdBy === createdBy)
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
}

export function createEvent(
  createdBy: string,
  values: Omit<CalendarEvent, "id" | "createdBy">
): CalendarEvent {
  const event: CalendarEvent = { ...values, createdBy, id: uid() };
  data.events.push(event);
  pushActivity(createdBy, "event", `Event "${event.title}" was scheduled.`);
  return event;
}

// ---------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------

export function getAnnouncementsByOwner(createdBy: string): Announcement[] {
  return data.announcements
    .filter((a) => a.createdBy === createdBy)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createAnnouncement(
  createdBy: string,
  values: Omit<Announcement, "id" | "createdBy" | "createdAt">
): Announcement {
  const announcement: Announcement = {
    ...values,
    createdBy,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  data.announcements.push(announcement);
  pushActivity(createdBy, "announcement", `Announcement "${announcement.title}" was published.`);
  const employees = getEmployeesByOwner(createdBy);
  for (const employee of employees) {
    notify(
      employee.id,
      "announcement",
      `New announcement from ${announcement.audience || "your company"}: "${announcement.title}"`
    );
  }
  return announcement;
}

// ---------------------------------------------------------------
// Activity
// ---------------------------------------------------------------

export function getActivityByOwner(createdBy: string, limit = 10): ActivityItem[] {
  return data.activity.filter((a) => a.createdBy === createdBy).slice(0, limit);
}

// ---------------------------------------------------------------
// Company profile (per-owner metadata is read in services/actions;
// this helper keeps the write key in one place)
// ---------------------------------------------------------------

export function companyProfileFromMeta(
  meta: Record<string, unknown>
): CompanyProfile | null {
  const raw = meta[COMPANY_PROFILE_KEY];
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  return {
    name: String(p.name ?? ""),
    industry: String(p.industry ?? ""),
    companySize: String(p.companySize ?? ""),
    location: String(p.location ?? ""),
    website: String(p.website ?? ""),
    description: String(p.description ?? ""),
    updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : null,
  };
}