// Read-layer helpers for the HRD / Company workspace.
// Pages and components query through these functions (never the store
// directly) so swapping the in-memory store for Supabase later only touches
// this file and the store.
//
// TODO: Replace in-memory queries with Supabase queries when the database
// schema is available.

import {
  getActivityByOwner,
  getAnnouncementsByOwner,
  getApplicantByJobAndUser,
  getApplicantForUser,
  getApplicantById,
  getApplicantsByCandidate,
  getApplicantsByOwner,
  getConversationsByOwner,
  getConversationsForMember,
  getEmployeeForUser,
  getEmployeesByOwner,
  getEventsByOwner,
  getAllJobs,
  getJobById,
  getJobsByOwner,
  getMessages,
  getProjectById,
  getProjectsByOwner,
  getSavedJobsByUser,
  getTestAssignmentById,
  getTestAssignmentForUser,
  getTestAssignmentsByCandidate,
  getTestAssignmentsByOwner,
  getTaskById,
  getTasksByOwner,
} from "./store";
import type {
  Applicant,
  ApplicantStatus,
  Announcement,
  CalendarEvent,
  Conversation,
  Employee,
  JobPosting,
  Project,
  Task,
  TestAssignment,
} from "./types";

export interface HrdDashboardData {
  activeJobs: number;
  totalApplicants: number;
  screeningApplicants: number;
  employees: number;
  hiringInProgress: number;
  pendingTasks: number;
  recentApplicants: Applicant[];
  recentActivity: ReturnType<typeof getActivityByOwner>;
  upcomingDeadlines: Array<Task | JobPosting>;
  pipeline: Record<ApplicantStatus, number>;
  upcomingInterviews: { applicant: Applicant; job?: JobPosting }[];
  pendingTestReviews: { assignment: TestAssignment; applicant?: Applicant; job?: JobPosting }[];
  testsToReview: number;
}

export function getHrdDashboard(hrdUserId: string): HrdDashboardData {
  const jobs = getJobsByOwner(hrdUserId);
  const applicants = getApplicantsByOwner(hrdUserId);
  const tasks = getTasksByOwner(hrdUserId);
  const employees = getEmployeesByOwner(hrdUserId);

  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const hiringInProgress = applicants.filter(
    (a) => a.status !== "rejected" && a.status !== "hired"
  ).length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;

  const now = new Date().toISOString().slice(0, 10);
  const upcomingDeadlines = [
    ...tasks.filter((t) => t.deadline && t.deadline >= now && t.status !== "completed"),
    ...jobs.filter((j) => j.deadline && j.deadline >= now && j.status === "active"),
  ]
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
    .slice(0, 5);

  const pipeline: Record<ApplicantStatus, number> = {
    new: 0,
    screening: 0,
    test: 0,
    interview: 0,
    final_review: 0,
    hired: 0,
    rejected: 0,
  };
  for (const a of applicants) pipeline[a.status] = (pipeline[a.status] ?? 0) + 1;

  const upcomingInterviews = applicants
    .filter((a) => a.interview)
    .sort((a, b) => String(a.interview!.date).localeCompare(String(b.interview!.date)))
    .slice(0, 5)
    .map((a) => ({ applicant: a, job: getJobById(a.jobId) ?? undefined }));

  const challengeAssignments = getTestAssignmentsByOwner(hrdUserId).filter(
    (t) => t.kind === "challenge"
  );
  const pendingTestReviews = challengeAssignments
    .filter((t) => t.status === "submitted")
    .sort((a, b) => String(a.submission?.submittedAt ?? "").localeCompare(String(b.submission?.submittedAt ?? "")))
    .map((t) => ({
      assignment: t,
      applicant: getApplicantById(t.applicationId) ?? undefined,
      job: getJobById(t.jobId) ?? undefined,
    }));

  return {
    activeJobs,
    totalApplicants: applicants.length,
    screeningApplicants: applicants.filter((a) => a.status === "screening").length,
    employees: employees.length,
    hiringInProgress,
    pendingTasks,
    recentApplicants: applicants.slice(0, 5),
    recentActivity: getActivityByOwner(hrdUserId, 8),
    upcomingDeadlines,
    pipeline,
    upcomingInterviews,
    pendingTestReviews,
    testsToReview: pendingTestReviews.length,
  };
}

export interface JobFilters {
  search?: string;
  status?: "all" | JobPosting["status"];
}

export function getJobs(hrdUserId: string, filters: JobFilters = {}): JobPosting[] {
  const jobs = getJobsByOwner(hrdUserId);
  const term = (filters.search ?? "").trim().toLowerCase();
  return jobs.filter((j) => {
    const matchesStatus = !filters.status || filters.status === "all" || j.status === filters.status;
    const matchesTerm =
      !term ||
      j.title.toLowerCase().includes(term) ||
      j.location.toLowerCase().includes(term) ||
      j.skills.some((s) => s.toLowerCase().includes(term));
    return matchesStatus && matchesTerm;
  });
}

export interface ApplicantFilters {
  search?: string;
  status?: "all" | string;
  jobId?: string;
}

const APPLICANT_STATUSES = ["new", "screening", "test", "interview", "final_review", "hired", "rejected"];

export function getApplicants(hrdUserId: string, filters: ApplicantFilters = {}): Applicant[] {
  const applicants = getApplicantsByOwner(hrdUserId);
  const term = (filters.search ?? "").trim().toLowerCase();
  const status = filters.status && APPLICANT_STATUSES.includes(filters.status) ? filters.status : null;
  return applicants.filter((a) => {
    const matchesStatus = !status || a.status === status;
    const matchesJob = !filters.jobId || a.jobId === filters.jobId;
    const matchesTerm =
      !term ||
      a.candidateName.toLowerCase().includes(term) ||
      (a.candidateHeadline ?? "").toLowerCase().includes(term) ||
      a.candidateSkills.some((s) => s.toLowerCase().includes(term));
    return matchesStatus && matchesJob && matchesTerm;
  });
}

export function getApplicantDetail(id: string): { applicant?: Applicant; job?: JobPosting } {
  const applicant = getApplicantById(id);
  if (!applicant) return {};
  return { applicant, job: getJobById(applicant.jobId) ?? undefined };
}

export function getEmployees(hrdUserId: string): Employee[] {
  return getEmployeesByOwner(hrdUserId);
}

export function getEmployeeDetail(id: string, hrdUserId: string): {
  employee?: Employee;
  assignedTasks?: Task[];
} {
  const employee = getEmployees(hrdUserId).find((e) => e.id === id);
  if (!employee) return {};
  return {
    employee,
    assignedTasks: getTasksByOwner(hrdUserId).filter((t) => t.assigneeId === id),
  };
}

export function getTasks(hrdUserId: string): Task[] {
  return getTasksByOwner(hrdUserId);
}

export function getTaskDetail(id: string): { task?: Task; assignee?: Employee | null } {
  const task = getTaskById(id);
  if (!task) return {};
  const assignee = task.assigneeId
    ? getEmployeesByOwner(task.createdBy).find((e) => e.id === task.assigneeId) ?? null
    : null;
  return { task, assignee };
}

export function getProjects(hrdUserId: string): Project[] {
  return getProjectsByOwner(hrdUserId);
}

export function getProjectDetail(id: string): {
  project?: Project;
  tasks?: Task[];
} {
  const project = getProjectById(id);
  if (!project) return {};
  return {
    project,
    tasks: getTasksByOwner(project.createdBy).filter((t) => t.projectId === id),
  };
}

export function getConversations(hrdUserId: string): Conversation[] {
  return getConversationsByOwner(hrdUserId);
}

export function getMessagesFor(conversationId: string) {
  return getMessages(conversationId);
}

export function getCalendar(hrdUserId: string): CalendarEvent[] {
  return getEventsByOwner(hrdUserId);
}

export function getAnnouncements(hrdUserId: string): Announcement[] {
  return getAnnouncementsByOwner(hrdUserId);
}

// ---------------------------------------------------------------
// Employee workspace (hired candidates / team members)
// ---------------------------------------------------------------

export function getEmployeeTasks(userId: string): { tasks: Task[]; companyOwnerId: string } {
  const employee = getEmployeeForUser(userId);
  const companyOwnerId = employee?.createdBy ?? "";
  const tasks = companyOwnerId ? getTasksByOwner(companyOwnerId).filter((t) => t.assigneeId === userId) : [];
  return { tasks, companyOwnerId };
}

export function getEmployeeProjects(userId: string): Project[] {
  const employee = getEmployeeForUser(userId);
  if (!employee) return [];
  return getProjectsByOwner(employee.createdBy).filter((p) =>
    p.memberIds.includes(userId)
  );
}

export function getEmployeeConversations(userId: string): Conversation[] {
  const employee = getEmployeeForUser(userId);
  if (!employee) return [];
  return getConversationsByOwner(employee.createdBy).filter(
    (c) => c.channel || c.memberId === userId
  );
}

export function getEmployeeCalendar(userId: string): CalendarEvent[] {
  const employee = getEmployeeForUser(userId);
  if (!employee) return [];
  return getEventsByOwner(employee.createdBy).filter((e) =>
    e.participants.some((p) => p.toLowerCase().includes(userId.toLowerCase()))
  );
}

// ---------------------------------------------------------------
// Candidate side (signed-in candidates browsing jobs/applications)
// ---------------------------------------------------------------

export function getPublicJobs(): JobPosting[] {
  return getAllJobs()
    .filter((j) => j.status === "active")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------------------------------------------------------------
// Deterministic job matching (skills/location/work mode/career)
// ---------------------------------------------------------------

// Profile signals used by the match engine. All fields come from the
// candidate's own auth metadata — nothing is invented or randomized.
export interface MatchProfile {
  skills?: string[] | null;
  location?: string | null;
  preferred_work_type?: string[] | null;
  education?: string | null;
  education_level?: string | null;
  major?: string | null;
  preferred_roles?: string[] | null;
  headline?: string | null;
}

export interface JobMatchBreakdown {
  overall: number;
  skillScore: number;
  locationScore: number | null;
  workModeScore: number | null;
  careerScore: number | null;
  weights: { skill: number; location: number; workMode: number; career: number };
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

export const emptyMatch: JobMatchBreakdown = {
  overall: 0,
  skillScore: 0,
  locationScore: null,
  workModeScore: null,
  careerScore: null,
  weights: { skill: 50, location: 25, workMode: 15, career: 10 },
  matchedSkills: [],
  missingSkills: [],
  reasons: [],
};

const norm = (s: string) => s.trim().toLowerCase();

function locationTokens(location: string | null | undefined): string[] {
  if (!location) return [];
  const cleaned = norm(location)
    .replace(/\b(kota|kabupaten|kab|city|province|provinsi|jakarta raya|daerah khusus ibukota|indonesia|id)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(new Set(cleaned.split(" ").filter((t) => t.length > 1)));
}

export function matchSkillsAgainstJob(
  job: JobPosting,
  candidateSkills: string[] | null | undefined
): { matchedSkills: string[]; missingSkills: string[] } {
  const cand = (candidateSkills || []).map(norm).filter(Boolean);
  const pool = job.skills.length > 0 ? job.skills : job.preferredSkills;
  const matchedSkills = pool.filter((s) => cand.includes(norm(s)));
  const missingSkills = pool.filter((s) => !cand.includes(norm(s)));
  return { matchedSkills, missingSkills };
}

export function computeJobMatch(job: JobPosting, profile: MatchProfile): JobMatchBreakdown {
  const reasons: string[] = [];

  // 1. Skill match (50/weight points).
  const { matchedSkills, missingSkills } = matchSkillsAgainstJob(job, profile.skills);
  const pool = job.skills.length > 0 ? job.skills : job.preferredSkills;
  const skillScore = pool.length > 0 ? Math.round((matchedSkills.length / pool.length) * 100) : 0;
  if (pool.length > 0) {
    if (matchedSkills.length > 0) {
      reasons.push(`You match ${matchedSkills.length}/${pool.length} required skills (${matchedSkills.join(", ")}).`);
    } else {
      reasons.push(`None of this job's required skills are in your profile skills yet.`);
    }
    if (missingSkills.length > 0) {
      reasons.push(`Missing skills: ${missingSkills.join(", ")}.`);
    }
  } else {
    reasons.push(`This job lists no required skills, so skill match is not counted.`);
  }

  // 2. Location match (25/weight points).
  const candLoc = profile.location ?? null;
  const jobLoc = job.location ?? null;
  const candTokens = locationTokens(candLoc);
  const jobTokens = locationTokens(jobLoc);
  let locationScore: number | null = null;
  if (jobTokens.length === 0) {
    reasons.push(`This job has no location, so location match is not counted.`);
  } else if (candTokens.length === 0) {
    reasons.push(`Add your location to your profile to improve location matching.`);
  } else {
    const hits = jobTokens.filter((t) => candTokens.includes(t)).length;
    if (hits === jobTokens.length) {
      locationScore = 100;
      reasons.push(`Located in ${candLoc}, close to the job's ${jobLoc} area.`);
    } else if (hits > 0) {
      locationScore = Math.round(60 + 40 * (hits / jobTokens.length));
      reasons.push(`Your location (${candLoc}) partially overlaps the job's ${jobLoc} area.`);
    } else {
      locationScore = 0;
      reasons.push(`Your location (${candLoc}) is not near the job's ${jobLoc} area.`);
    }
  }

  // 3. Work mode match (15/weight points).
  const preferredModes = (profile.preferred_work_type || []).map(norm).filter(Boolean);
  let workModeScore: number | null = null;
  if (preferredModes.length === 0) {
    reasons.push(`Add your preferred work mode (on-site/hybrid/remote) to improve work mode matching.`);
  } else if (preferredModes.includes(norm(job.workMode))) {
    workModeScore = 100;
    reasons.push(`Work mode ${job.workMode} matches your preference.`);
  } else {
    workModeScore = 30;
    reasons.push(`This job is ${job.workMode}, which differs from your preferred work mode.`);
  }

  // 4. Career/education match (10/weight points).
  const candidateEducation = profile.education ?? profile.education_level ?? null;
  const jobEducation = job.education ?? null;
  const preferredRoles = (profile.preferred_roles || []).map(norm).filter(Boolean);
  let careerScore: number | null = null;
  const careerPieces: string[] = [];

  const roleSpans = preferredRoles.length > 0 && preferredRoles.some((r) => r.includes(norm("developer")) || job.title.toLowerCase().includes("software") || preferredRoles.includes(norm(job.title)));
  const roleMatch = roleSpans || preferredRoles.some((r) => {
    const jobTokens = norm(job.title).split(/\s+/);
    return jobTokens.some((t) => t.length > 3 && r.includes(t));
  });
  if (roleMatch) careerPieces.push(`role`);
  if (candidateEducation && jobEducation) {
    const j = norm(jobEducation.replace(/["']/g, ""));
    const c = norm(candidateEducation.replace(/["']/g, ""));
    if (j === c || j.includes(c) || c.includes(j)) careerPieces.push(`education`);
    else reasons.push(`This job asks for ${jobEducation} education; your profile lists ${candidateEducation}.`);
  } else if (!candidateEducation && jobEducation) {
    reasons.push(`This job requires ${jobEducation} education; add yours to compute an education match.`);
  }

  if (careerPieces.length > 0) {
    careerScore = Math.round((careerPieces.includes("role") && careerPieces.includes("education") ? 100 : careerPieces.length === 2 ? 100 : 60));
    if (careerPieces.includes("role")) {
      reasons.push(`This job title matches your selected career preference.`);
    }
    if (careerPieces.includes("education")) {
      reasons.push(`Your ${candidateEducation} education matches the ${jobEducation} requirement.`);
    }
  } else if (jobEducation === null && preferredRoles.length === 0) {
    reasons.push(`No education/role preference data — career match is not counted.`);
  }

  // Weighted overall using the factors that actually have data.
  const weights = { skill: 50, location: 25, workMode: 15, career: 10 };
  const active: { score: number; w: number }[] = [];
  if (skillScore !== null) active.push({ score: skillScore, w: weights.skill });
  if (locationScore !== null) active.push({ score: locationScore, w: weights.location });
  if (workModeScore !== null) active.push({ score: workModeScore, w: weights.workMode });
  if (careerScore !== null) active.push({ score: careerScore, w: weights.career });

  const totalWeight = active.reduce((sum, x) => sum + x.w, 0);
  const overall = totalWeight > 0
    ? Math.round(active.reduce((sum, x) => sum + x.score * x.w, 0) / totalWeight)
    : skillScore;

  return {
    overall,
    skillScore,
    locationScore,
    workModeScore,
    careerScore,
    weights,
    matchedSkills,
    missingSkills,
    reasons,
  };
}

// Quick skills-only percentage (used when snapshotting the applicant's score).
export function computeMatchScore(job: JobPosting, skills: string[]): number {
  const normalized = skills.map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (normalized.length === 0) return 0;
  const required = job.skills.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const pool = required.length > 0 ? required : job.preferredSkills.map((s) => s.trim().toLowerCase());
  if (pool.length === 0) return 0;
  const overlap = pool.filter((skill) => normalized.includes(skill)).length;
  return Math.round((overlap / pool.length) * 100);
}

export interface CandidateJob {
  job: JobPosting;
  applicant: Applicant | null;
  match: JobMatchBreakdown;
}

export function getCandidateJobsWithMatch(userId: string, profile: MatchProfile): CandidateJob[] {
  return getPublicJobs().map((job) => ({
    job,
    applicant: getApplicantByJobAndUser(job.id, userId),
    match: computeJobMatch(job, profile),
  }));
}

export function getCandidateJobDetailMatch(
  userId: string,
  jobId: string,
  profile: MatchProfile
): { job?: JobPosting; applicant?: Applicant; saved?: boolean; match: JobMatchBreakdown } {
  const job = getPublicJobById(jobId);
  if (!job) return { match: emptyMatch };
  const applicant = getApplicantByJobAndUser(job.id, userId) ?? undefined;
  return {
    job,
    applicant,
    saved: getSavedJobsByUser(userId).some((s) => s.jobId === job.id),
    match: computeJobMatch(job, profile),
  };
}

// Ranked applicants for one job, with per-candidate skill match against the job.
export function getRecommendedApplicantsForJob(
  hrdUserId: string,
  jobId: string
): { applicant: Applicant; matchedSkills: string[]; missingSkills: string[] }[] {
  const job = getJobById(jobId);
  if (!job || job.createdBy !== hrdUserId) return [];
  return getApplicantsByOwner(hrdUserId)
    .filter((a) => a.jobId === jobId)
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .map((a) => ({
      applicant: a,
      ...matchSkillsAgainstJob(job, a.candidateSkills),
    }));
}

// Kept for backward compatibility (Find Jobs dashboard).
export function getCandidateJobs(userId: string, skills: string[]): CandidateJob[] {
  return getCandidateJobsWithMatch(userId, { skills });
}

export function getOwnerJob(hrdUserId: string, jobId: string): JobPosting | null {
  const job = getJobById(jobId);
  return job?.createdBy === hrdUserId ? job : null;
}

export function getCandidateApplications(userId: string): { applicant: Applicant; job: JobPosting | null }[] {
  return getApplicantsByCandidate(userId).map((applicant) => ({
    applicant,
    job: getJobById(applicant.jobId) ?? null,
  }));
}

export function getCandidateApplicationDetail(
  userId: string,
  appId: string
): {
  applicant?: Applicant;
  job?: JobPosting;
  testAssignment?: TestAssignment | null;
} {
  const applicant = getApplicantForUser(appId, userId);
  if (!applicant) return {};
  return {
    applicant,
    job: getJobById(applicant.jobId) ?? undefined,
    testAssignment: applicant.testAssignmentId
      ? getTestAssignmentById(applicant.testAssignmentId)
      : null,
  };
}

export function getCandidateTests(
  userId: string
): { assignment: TestAssignment; job: JobPosting | null }[] {
  return getTestAssignmentsByCandidate(userId).map((assignment) => ({
    assignment,
    job: getJobById(assignment.jobId) ?? null,
  }));
}

export function getCandidateSavedJobs(
  userId: string
): { job: JobPosting; savedAt: string }[] {
  return getSavedJobsByUser(userId)
    .map((s) => {
      const job = getJobById(s.jobId);
      return job ? { job, savedAt: s.savedAt } : null;
    })
    .filter((x): x is { job: JobPosting; savedAt: string } => x !== null);
}

export function getCandidateTest(
  userId: string,
  assignmentId: string
): { assignment?: TestAssignment; job?: JobPosting } {
  const assignment = getTestAssignmentForUser(assignmentId, userId);
  if (!assignment) return {};
  return { assignment, job: getJobById(assignment.jobId) ?? undefined };
}

export function getMemberConversations(userId: string): Conversation[] {
  return getConversationsForMember(userId);
}

// Announcements relevant to one employee (of their company), by audience.
export function getEmployeeAnnouncements(
  userId: string
): { announcement: Announcement; companyName: string }[] {
  const employee = getEmployeeForUser(userId);
  if (!employee) return [];
  const company = companyNameOf(employee.createdBy);
  return getAnnouncementsByOwner(employee.createdBy)
    .filter((a) => {
      const audience = a.audience.trim().toLowerCase();
      if (audience === "all employees" || audience === "all") return true;
      return (
        audience.includes(employee.name.toLowerCase()) ||
        audience.includes(employee.department.toLowerCase())
      );
    })
    .map((announcement) => ({ announcement, companyName: company }));
}

function companyNameOf(hrdUserId: string): string {
  const jobs = getJobsByOwner(hrdUserId);
  return jobs.find((j) => j.companyName)?.companyName ?? "";
}

export function getPublicJobById(id: string): JobPosting | null {
  const job = getJobById(id);
  return job && job.status === "active" ? job : null;
}