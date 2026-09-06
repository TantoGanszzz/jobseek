import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/recruitment/matching";
import DashboardFindJobsClient from "@/components/dashboard-find-jobs";

export const metadata: Metadata = {
  title: "Find Jobs — Jobseek",
  description: "Discover opportunities that match your skills and career goals.",
};

export default async function FindJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? "";
  const { data: profile } = user
    ? await supabase.from("profiles").select("skills, location, headline, bio").eq("id", user.id).maybeSingle()
    : { data: null };

  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const location = typeof profile?.location === "string" ? profile.location : null;
  const preferredWorkType: string[] | undefined = undefined;
  const preferredRoles: string[] | undefined = undefined;
  const education: string | null = null;
  const [{ data: rows }, { data: applications }, { data: savedRows }] = await Promise.all([
    supabase.from("jobs").select("id,title,description,location,job_type,experience_level,salary_range,skills,created_at,companies(name,logo_url)").order("created_at", { ascending: false }),
    user ? supabase.from("applications").select("id,job_id,status,applied_at").eq("user_id", user.id) : Promise.resolve({ data: [] }),
    user ? supabase.from("saved_jobs").select("job_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
  ]);
  const applicationByJob = new Map((applications ?? []).map((application) => [application.job_id, application]));
  const jobs = (rows ?? []).map((row) => {
    const job = {
      id: row.id, createdBy: "", companyName: row.companies?.name ?? "Company", title: row.title,
      description: row.description, department: null, location: row.location ?? "", jobType: row.job_type ?? "",
      workMode: "", salaryRange: row.salary_range, experienceLevel: row.experience_level ?? "", education: null,
      skills: row.skills ?? [], preferredSkills: [], requirements: null,
      responsibilities: null, stages: [], minQualificationScore: 0,
      deadline: null, status: row.status === "active" ? "active" : "closed", createdAt: row.created_at,
    };
    const snapshot = calculateJobMatch({ candidateSkills: skills, candidateLocation: location, preferredWorkModes: preferredWorkType, preferredRoles, candidateEducation: education, jobSkills: job.skills, jobLocation: job.location, jobWorkMode: null, jobTitle: job.title, jobEducation: null });
    const application = applicationByJob.get(row.id);
    return { job, applicant: application ? { id: application.id, status: application.status, userId, jobId: application.job_id } : null, match: { overall: snapshot.overall, skillScore: snapshot.skill, locationScore: snapshot.location, workModeScore: snapshot.workMode, careerScore: snapshot.career, weights: { skill: 50, location: 25, workMode: 15, career: 10 }, matchedSkills: snapshot.matchedSkills, missingSkills: snapshot.missingSkills, reasons: [] } };
  });
  const savedJobIds = (savedRows ?? []).map((saved) => saved.job_id);

  const profileComplete = skills.length > 0 && !!location;

  return (
    <DashboardFindJobsClient
      jobs={jobs as never}
      savedJobIds={savedJobIds}
      profileComplete={profileComplete}
    />
  );
}
