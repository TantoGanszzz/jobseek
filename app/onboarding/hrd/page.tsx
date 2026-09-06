import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import HrdOnboarding, { type HrdOnboardingState, type HrdPrefsState } from "@/components/onboarding/hrd-onboarding";

export default async function HrdOnboardingPage() {
  const status = await getOnboardingStatus();
  if (!status) redirect("/login");
  if (status.role === "admin") redirect("/admin");
  if (status.role === "user") redirect("/onboarding/user");
  if (status.onboarding_completed) redirect("/company/dashboard");

  const supabase = await createClient();

  let initial: Partial<HrdOnboardingState> | null = null;
  let initialPrefs: Partial<HrdPrefsState> | null = null;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, position, avatar_url, company_id, onboarding_step")
      .eq("id", status.user_id)
      .single();

    const base = {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      position: profile?.position || "",
      avatar_url: profile?.avatar_url || "",
      onboarding_step: profile?.onboarding_step || 1,
    };

    if (profile?.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("name, logo_url, industry, company_size, company_type, location, city, province, website, description")
        .eq("id", profile.company_id)
        .single();

      const { data: prefs } = await supabase
        .from("company_preferences")
        .select("preferred_roles, hiring_types, work_modes, candidate_experience, preferred_skills")
        .eq("company_id", profile.company_id)
        .maybeSingle();

      initial = {
        ...base,
        ...(company
          ? {
              name: company.name || "",
              logo_url: company.logo_url || "",
              industry: company.industry ? String(company.industry).split(",").map((s) => s.trim()).filter(Boolean) : [],
              company_size: company.company_size || "",
              company_type: company.company_type || "",
              location: company.location || "",
              city: company.city || "",
              province: company.province || "",
              website: company.website || "",
              description: company.description || "",
            }
          : {}),
      };
      initialPrefs = prefs
        ? {
            preferred_roles: prefs.preferred_roles || [],
            hiring_types: prefs.hiring_types || [],
            work_modes: prefs.work_modes || [],
            candidate_experience: prefs.candidate_experience || [],
            preferred_skills: prefs.preferred_skills || [],
          }
        : null;
    } else {
      initial = { ...base };
    }
  } catch {}

  return <HrdOnboarding initial={initial} initialPrefs={initialPrefs} />;
}