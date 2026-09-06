"use server";

import { createClient } from "@/lib/supabase/server";

export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const job_type = formData.get("job_type") as string;
  const salary_range = formData.get("salary_range") as string;
  const experience_level = formData.get("experience_level") as string;
  const minScoreStr = formData.get("min_qualification_score") as string;
  const responsibilities = formData.get("responsibilities") as string;
  const requirements = formData.get("requirements") as string;
  const companyId = formData.get("company_id") as string;

  const requiredSkillsJson = formData.get("required_skills") as string;
  const preferredSkillsJson = formData.get("preferred_skills") as string;

  let skills: string[] = [];
  let preferred_skills: string[] = [];
  try {
    skills = JSON.parse(requiredSkillsJson);
  } catch {
    skills = [];
  }
  try {
    preferred_skills = JSON.parse(preferredSkillsJson);
  } catch {
    preferred_skills = [];
  }

  const minScore = parseInt(minScoreStr, 10);
  if (isNaN(minScore) || minScore < 0 || minScore > 100) {
    return { error: "Minimum qualification score must be between 0 and 100." };
  }

  // Verify the HRD created/owns this company
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .single();

  if (!company) {
    return { error: "Company not found." };
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      company_id: companyId,
      title,
      description: description || null,
      location: location || null,
      job_type: job_type || null,
      salary_range: salary_range || null,
      experience_level: experience_level || null,
      responsibilities: responsibilities || null,
      requirements: requirements || null,
      skills,
      preferred_skills,
      min_qualification_score: minScore,
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  return { success: true, jobId: job.id };
}
