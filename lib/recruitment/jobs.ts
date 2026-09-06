import { createClient } from "@/lib/supabase/server";

export type RecruitmentJobStatus = "draft" | "active" | "paused" | "closed";

export interface CreateRecruitmentJobInput {
  companyId: string;
  title: string;
  description: string | null;
  location: string | null;
  jobType: string | null;
  workMode: string | null;
  salaryRange: string | null;
  experienceLevel: string | null;
  department: string | null;
  education: string | null;
  skills: string[];
  preferredSkills: string[];
  requirements: string | null;
  responsibilities: string | null;
  stages: string[];
  minQualificationScore: number;
  deadline: string | null;
  status: RecruitmentJobStatus;
}

export async function createRecruitmentJob(input: CreateRecruitmentJobInput) {
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      company_id: input.companyId,
      title: input.title,
      description: input.description,
      location: input.location,
      job_type: input.jobType,
      salary_range: input.salaryRange,
      experience_level: input.experienceLevel,
      skills: input.skills,
      preferred_skills: input.preferredSkills,
      requirements: input.requirements,
      responsibilities: input.responsibilities,
      min_qualification_score: input.minQualificationScore,
      status: input.status,
    })
    .select("id")
    .single();

  if (error || !job) return { error: error?.message ?? "Unable to create job." };

  return { jobId: job.id };
}
