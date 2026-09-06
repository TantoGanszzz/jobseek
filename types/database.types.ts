export type UserRole = "user" | "hrd" | "admin";

export type ApplicationStatus =
  | "test_required"
  | "test_in_progress"
  | "test_failed"
  | "qualified"
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected";

export type JobStatus = "draft" | "active" | "closed" | "pending";

export type OnboardingStatus = "pending" | "in_progress" | "completed";

export type CompanyStatus = "pending" | "approved" | "rejected" | "suspended";

export interface Profile {
  id: string;
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  education: string | null;
  university: string | null;
  major: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  role: string | null;
  // Onboarding data
  onboarding_completed: boolean;
  onboarding_step: number;
  date_of_birth: string | null;
  gender: string | null;
  city: string | null;
  province: string | null;
  education_level: string | null;
  graduation_year: number | null;
  education_status: string | null;
  gpa: string | null;
  experience_level: string | null;
  has_experience: boolean | null;
  interests: string[] | null;
  preferred_roles: string[] | null;
  preferred_work_type: string[] | null;
  preferred_work_location: string[] | null;
  preferred_city: string | null;
  preferred_province: string | null;
  willing_to_relocate: boolean | null;
  career_goal: string | null;
  short_term_goal: string | null;
  long_term_goal: string | null;
  behance_url: string | null;
  dribbble_url: string | null;
  // HRD fields
  position: string | null;
  company_id: string | null;
  created_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  description: string | null;
  created_at: string;
}

export interface CareerRecommendation {
  id: string;
  user_id: string;
  career_name: string;
  match_score: number;
  reason: string;
  required_skills: string[];
  recommended_skills: string[];
  created_at: string;
}

export interface CompanyPreference {
  id: string;
  company_id: string;
  preferred_roles: string[];
  hiring_types: string[];
  work_modes: string[];
  candidate_experience: string[];
  preferred_skills: string[];
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  description?: string | null;
  location?: string | null;
  website?: string | null;
  industry?: string | null;
  status?: string;
  company_size?: string | null;
  company_type?: string | null;
  city?: string | null;
  province?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company_id: string;
  location: string | null;
  job_type: string | null;
  experience_level: string | null;
  salary_range: string | null;
  skills: string[] | null;
  preferred_skills?: string[] | null;
  description: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  min_qualification_score?: number;
  status?: JobStatus;
  created_at: string;
  company?: Company;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStatus;
  score: number | null;
  applied_at: string;
  cv_url: string | null;
  test_attempt_id: string | null;
  job?: Job;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_at: string;
  job?: Job;
}

export interface QualificationTest {
  id: string;
  job_id: string;
  title: string;
  description: string | null;
  questions: Question[];
  time_limit_minutes: number;
  created_at: string;
  job?: Job;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface QualificationTestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  application_id: string;
  score: number;
  total_questions: number;
  answers: number[];
  started_at: string;
  completed_at: string | null;
  test?: QualificationTest;
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tech_stack: string[] | null;
  role: string | null;
  year: number | null;
  live_url: string | null;
  github_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  skill_category: string | null;
  difficulty: string | null;
  estimated_duration: string | null;
  image_url: string | null;
  created_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress_pct: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, "id" | "created_at" | "status">;
        Update: Partial<Omit<Company, "id" | "created_at">>;
      };
      experiences: {
        Row: Experience;
        Insert: Omit<Experience, "id" | "created_at">;
        Update: Partial<Omit<Experience, "id" | "created_at">>;
      };
      career_recommendations: {
        Row: CareerRecommendation;
        Insert: Omit<CareerRecommendation, "id" | "created_at">;
        Update: Partial<Omit<CareerRecommendation, "id" | "created_at">>;
      };
      company_preferences: {
        Row: CompanyPreference;
        Insert: Omit<CompanyPreference, "id" | "created_at">;
        Update: Partial<Omit<CompanyPreference, "id" | "created_at">>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, "id" | "created_at" | "company" | "status">;
        Update: Partial<Omit<Job, "id" | "created_at" | "company">>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, "id" | "applied_at" | "job">;
        Update: Partial<Omit<Application, "id" | "applied_at" | "job">>;
      };
      saved_jobs: {
        Row: SavedJob;
        Insert: Omit<SavedJob, "id" | "saved_at" | "job">;
        Update: Partial<Omit<SavedJob, "id" | "saved_at" | "job">>;
      };
      qualification_tests: {
        Row: QualificationTest;
        Insert: Omit<QualificationTest, "id" | "created_at" | "job">;
        Update: Partial<Omit<QualificationTest, "id" | "created_at" | "job">>;
      };
      qualification_test_attempts: {
        Row: QualificationTestAttempt;
        Insert: Omit<QualificationTestAttempt, "id" | "started_at" | "test">;
        Update: Partial<Omit<QualificationTestAttempt, "id" | "started_at" | "test">>;
      };
      portfolio_projects: {
        Row: PortfolioProject;
        Insert: Omit<PortfolioProject, "id" | "created_at">;
        Update: Partial<Omit<PortfolioProject, "id" | "created_at">>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | "created_at">;
        Update: Partial<Omit<Course, "id" | "created_at">>;
      };
      learning_progress: {
        Row: LearningProgress;
        Insert: Omit<LearningProgress, "id" | "started_at" | "course">;
        Update: Partial<Omit<LearningProgress, "id" | "started_at" | "course">>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, "id" | "created_at">;
        Update: Partial<Omit<Activity, "id" | "created_at">>;
      };
    };
  };
}
