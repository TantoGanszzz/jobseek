export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  resume_url: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
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
  description: string | null;
  created_at: string;
  // Joined data
  company?: Company;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  // Joined data
  job?: Job;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_at: string;
  // Joined data
  job?: Job;
}

// Supabase Database type helper
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
        Insert: Omit<Company, "id" | "created_at">;
        Update: Partial<Omit<Company, "id" | "created_at">>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, "id" | "created_at" | "company">;
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
    };
  };
}
