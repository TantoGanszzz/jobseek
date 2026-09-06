"use server";

import { createClient } from "@/lib/supabase/server";
import { generateCareerRecommendations } from "@/lib/recommendations";

const USER_PROFILE_COLUMNS = [
  "full_name", "phone", "date_of_birth", "gender", "location", "city", "province",
  "avatar_url", "education_level", "university", "major", "graduation_year",
  "education_status", "gpa", "skills", "interests", "preferred_roles",
  "preferred_work_type", "preferred_work_location", "preferred_city",
  "preferred_province", "willing_to_relocate", "career_goal", "short_term_goal",
  "long_term_goal", "github_url", "linkedin_url", "portfolio_url", "behance_url",
  "dribbble_url", "resume_url", "experience_level", "has_experience",
] as const;

const HRD_PROFILE_COLUMNS = ["full_name", "phone", "position", "avatar_url"] as const;

const COMPANY_COLUMNS = [
  "name", "logo_url", "industry", "company_size", "company_type", "location",
  "city", "province", "website", "description",
] as const;

const COMPANY_PREF_COLUMNS = [
  "preferred_roles", "hiring_types", "work_modes", "candidate_experience", "preferred_skills",
] as const;

function pick(data: Record<string, unknown>, allowed: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };
  return { supabase, user };
}

// ============================================================
// USER ONBOARDING
// ============================================================

export async function saveUserStep(step: number, data: Record<string, unknown>) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const clean = pick(data, USER_PROFILE_COLUMNS);
  const nextStep =
    typeof data.onboarding_step === "number"
      ? data.onboarding_step
      : typeof step === "number"
        ? step
        : 1;
  clean.onboarding_step = Math.max(nextStep, 1);

  const { error } = await supabase
    .from("profiles")
    .update(clean)
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveUserExperiences(experiences: {
  company_name: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}[]) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.from("experiences").delete().eq("user_id", user.id);

  if (experiences.length > 0) {
    const rows = experiences.map((e) => ({ ...e, user_id: user.id }));
    const { error } = await supabase.from("experiences").insert(rows);
    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function uploadCv(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "Only PDF files are supported." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "CV must be under 5 MB." };
  }

  const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  try {
    const { data, error } = await supabase.storage
      .from("cvs")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });

    if (error) {
      const msg = (error as { message?: string })?.message || String(error);
      // Bucket not provisioned — allow the user to fall back to a URL.
      return { error: `CV upload failed (${msg}). You can paste a CV link instead.` };
    }

    const { data: urlData } = await supabase.storage.from("cvs").getPublicUrl(data.path);
    const publicUrl = urlData?.publicUrl || null;
    if (!publicUrl) return { error: "Could not resolve CV URL." };

    await supabase.from("profiles").update({ resume_url: publicUrl }).eq("id", user.id);
    return { success: true, url: publicUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Storage unavailable";
    return { error: `CV upload failed (${msg}). You can paste a CV link instead.` };
  }
}

export async function completeUserOnboarding() {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const skills = (profile?.skills as string[]) || [];
  const interests = (profile?.interests as string[]) || [];
  const roles = (profile?.preferred_roles as string[]) || [];

  // Generate from real data, not hardcoded values
  const recommendations = generateCareerRecommendations({
    skills,
    interests,
    preferredRoles: roles,
    educationLevel: profile?.education_level || null,
    major: profile?.major || null,
    experienceLevel: profile?.experience_level || null,
  });

  await supabase
    .from("career_recommendations")
    .delete()
    .eq("user_id", user.id);

  if (recommendations.length > 0) {
    const { error } = await supabase
      .from("career_recommendations")
      .insert(
        recommendations.map((r) => ({
          user_id: user.id,
          career_name: r.careerName,
          match_score: r.matchScore,
          reason: r.reason,
          required_skills: r.requiredSkills,
          recommended_skills: r.recommendedSkills,
        }))
      );
    if (error) return { error: error.message };
  }

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true, onboarding_step: 7 })
    .eq("id", user.id);

  return { success: true, recommendations };
}

// ============================================================
// HRD ONBOARDING
// ============================================================

export async function saveHrdStep(
  step: number,
  data: Record<string, unknown>,
  prefs: Record<string, unknown>
) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const profileClean = pick(data, HRD_PROFILE_COLUMNS);
  const nextStep =
    typeof data.onboarding_step === "number"
      ? data.onboarding_step
      : typeof step === "number"
        ? step
        : 1;
  profileClean.onboarding_step = Math.max(nextStep, 1);
  await supabase.from("profiles").update(profileClean).eq("id", user.id);

  const companyClean = pick(data, COMPANY_COLUMNS);

  if (Object.keys(companyClean).length > 0) {
    // Find/create the HRD's company
    let companyId: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();
    companyId = profile?.company_id || null;

    if (!companyId) {
      const name = (companyClean.name as string) || "My Company";
      const { data: created, error } = await supabase
        .from("companies")
        .insert({
          name,
          created_by: user.id,
          status: "pending",
          ...companyClean,
        })
        .select("id")
        .single();
      if (error) return { error: error.message };
      companyId = created.id;
      await supabase.from("profiles").update({ company_id: companyId }).eq("id", user.id);
    } else {
      const { error } = await supabase
        .from("companies")
        .update({ ...companyClean, status: "pending" })
        .eq("id", companyId)
        .eq("created_by", user.id);
      if (error) return { error: error.message };
    }

    // Upsert company preferences
    const prefClean = pick(prefs, COMPANY_PREF_COLUMNS);
    if (Object.keys(prefClean).length > 0 && companyId) {
      const { error: upsertError } = await supabase
        .from("company_preferences")
        .upsert({ company_id: companyId, ...prefClean }, { onConflict: "company_id" });
      if (upsertError) return { error: upsertError.message };
    }
  }

  return { success: true };
}

export async function completeHrdOnboarding() {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return { error: "Company information is required before completing onboarding." };
  }

  // Company remains "pending" until an admin approves it.
  await supabase
    .from("companies")
    .update({ status: "pending" })
    .eq("id", profile.company_id)
    .eq("created_by", user.id);

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true, onboarding_step: 7 })
    .eq("id", user.id);

  return { success: true };
}