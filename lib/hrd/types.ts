// HRD / Company Workspace domain types.
// These mirror the tables the feature eventually needs (jobs, applications,
// employees, tasks, projects, messages, calendar_events, announcements).
// The store below is intentionally table-shaped so each type maps 1:1 to a
// future Supabase table.

export type JobStatus = "draft" | "active" | "paused" | "closed";

// Default recruitment workflow when the HRD does not define custom stages.
export const DEFAULT_JOB_STAGES = [
  "Application",
  "Screening",
  "Technical Test",
  "Interview",
  "Final Review",
];

export interface JobPosting {
  id: string;
  createdBy: string; // HRD user id who owns this job
  companyName: string; // company name snapshot for public job listings
  title: string;
  description: string | null;
  department: string | null;
  location: string;
  jobType: string;
  workMode: string;
  salaryRange: string | null;
  experienceLevel: string;
  education: string | null; // SMK / D3 / S1 / S2 / Any
  skills: string[];
  preferredSkills: string[];
  requirements: string | null;
  responsibilities: string | null;
  stages: string[]; // recruitment workflow chosen by the HRD
  minQualificationScore: number;
  deadline: string | null;
  status: JobStatus;
  createdAt: string;
}

export type ApplicantStatus =
  | "new"
  | "screening"
  | "test"
  | "interview"
  | "final_review"
  | "hired"
  | "rejected";

export interface StatusHistoryEntry {
  status: ApplicantStatus;
  at: string;
  note: string | null;
}

// A scheduled interview for an applicant. Stored on the applicant and mirrored
// into the company calendar as an interview event.
export interface Interview {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  location: string | null;
  durationMinutes: number | null;
  notes: string | null;
  scheduledAt: string;
}

export interface TestQuestion {
  skill: string;
  question: string;
  options: string[];
  weights: number[]; // score weight per option (parallel to options)
}

export interface TestSubmission {
  gitHubUrl: string | null;
  liveDemoUrl: string | null;
  textAnswer: string | null;
  notes: string | null;
  submittedAt: string;
}

export type TestKind = "quiz" | "challenge";

// A technical assessment the HRD assigns to one applicant.
// - kind "quiz": self-assessed proficiency questions built from the job's
//   skills; the score is computed server-side from the selected weights.
// - kind "challenge": a brief + submission the HRD reviews manually
//   (score 0-100 + feedback) and decides PASS/FAIL.
export interface TestAssignment {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string; // candidate auth user id
  createdBy: string; // HRD user id who assigned the test
  kind: TestKind;
  title: string;
  description: string | null; // challenge brief
  instructions: string | null; // how to submit
  deadline: string | null; // challenge deadline (YYYY-MM-DD)
  questions: TestQuestion[];
  minScore: number; // quiz: passing score; challenge: passing score
  timeLimitMinutes: number;
  status: "pending" | "submitted" | "completed";
  score: number | null;
  passed: boolean | null;
  answers: number[];
  submission: TestSubmission | null;
  reviewScore: number | null;
  reviewFeedback: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  assignedAt: string;
  completedAt: string | null;
}

// An applicant is a candidate application to one of the HRD's jobs.
export interface Applicant {
  id: string;
  createdBy: string; // HRD user id who owns the job
  jobId: string;
  userId: string; // candidate auth user id
  candidateName: string;
  candidateHeadline: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateLocation: string | null;
  candidateEducation: string | null;
  candidateSchool: string | null;
  candidateMajor: string | null;
  candidateSkills: string[];
  candidateBio: string | null;
  candidatePortfolioUrl: string | null;
  candidateGithubUrl: string | null;
  candidateLinkedinUrl: string | null;
  candidateResumeUrl: string | null;
  matchScore: number | null;
  qualScore: number | null;
  qualMinScore: number | null;
  appliedAt: string;
  status: ApplicantStatus;
  statusHistory: StatusHistoryEntry[];
  interview: Interview | null;
  testAssignmentId: string | null;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
}

export type NotificationType =
  | "applicant"
  | "status"
  | "interview"
  | "test"
  | "task"
  | "message"
  | "project"
  | "announcement";

export interface AppNotification {
  id: string;
  userId: string; // recipient auth user id
  type: NotificationType;
  text: string;
  createdAt: string;
  read: boolean;
}

export type EmployeeStatus = "active" | "on_leave" | "inactive";

// An employee is created automatically when a candidate is hired.
export interface Employee {
  id: string; // = candidate user id
  createdBy: string; // HRD user id who hired the candidate
  name: string;
  position: string;
  department: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  joinedDate: string;
  status: EmployeeStatus;
}

export type TaskStatus = "todo" | "in_progress" | "in_review" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  createdBy: string; // HRD user id who assigned the task
  title: string;
  description: string | null;
  projectId: string | null;
  projectName: string | null;
  assigneeId: string | null; // employee user id; null = unassigned / team task
  assigneeName: string;
  priority: TaskPriority;
  startDate: string | null;
  deadline: string | null;
  status: TaskStatus;
  createdAt: string;
}

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export interface Project {
  id: string;
  createdBy: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  deadline: string | null;
  memberIds: string[];
  memberNames: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  createdBy: string; // HRD user id who owns the workspace
  name: string;
  channel: boolean; // true = system/group channel, false = employee 1:1 thread
  memberId: string | null; // employee user id for 1:1 threads
  lastMessageAt: string | null;
}

export type EventType = "interview" | "meeting" | "deadline" | "event";

export interface CalendarEvent {
  id: string;
  createdBy: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  participants: string[];
  type: EventType;
}

export type AnnouncementAudience =
  | "all"
  | "department"
  | "employee";

export interface Announcement {
  id: string;
  createdBy: string;
  title: string;
  message: string;
  audience: string; // free text: "All Employees", department name, or employee name
  publishDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  createdBy: string;
  type: string; // e.g. applicant, task, test, project, hire
  text: string;
  createdAt: string;
}

// Company profile is persisted to the HRD's own auth metadata
// (auth.users.raw_user_meta_data.company_profile) — no public table needed.
export interface CompanyProfile {
  name: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  description: string;
  updatedAt: string | null;
}