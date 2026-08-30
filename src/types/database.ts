export type UserRole = "admin" | "hrd" | "job_seeker";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "internship"
  | "contract"
  | "freelance";

export type JobStatus = "draft" | "pending" | "published" | "closed" | "rejected";

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  education: string | null;
  experience: string | null;
  position: string | null;
  cv_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  location: string | null;
  website: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  created_by: string;
  title: string;
  description: string;
  location: string | null;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  requirements: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  cv_url: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: number;
}

/** Joined shapes used across the UI */

export interface JobWithCompany extends Job {
  company_name: string | null;
  company_logo_url: string | null;
}

export interface ApplicationWithJob extends Application {
  job_title: string | null;
  job_status: JobStatus | null;
  company_name: string | null;
}

export interface ApplicantRow extends Application {
  applicant_name: string | null;
  applicant_email: string | null;
  job_title: string | null;
}

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  hrd: "/hrd/dashboard",
  job_seeker: "/jobseeker/dashboard",
};

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export function employmentTypeLabel(t: string): string {
  return EMPLOYMENT_TYPES.find((e) => e.value === t)?.label ?? t;
}
