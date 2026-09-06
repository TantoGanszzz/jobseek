import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import UserOnboarding, { type UserOnboardingState } from "@/components/onboarding/user-onboarding";

export default async function UserOnboardingPage() {
  const status = await getOnboardingStatus();
  if (!status) redirect("/login");
  if (status.role === "admin") redirect("/admin");
  if (status.role === "hrd") redirect("/onboarding/hrd");
  if (status.onboarding_completed) redirect("/dashboard");

  const supabase = await createClient();

  let profile: Partial<UserOnboardingState> | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", status.user_id)
      .single();
    if (data) {
      const p: Record<string, unknown> = { ...data };
      if (p.graduation_year != null) p.graduation_year = String(p.graduation_year);
      if (p.onboarding_step == null) p.onboarding_step = 1;
      profile = p as Partial<UserOnboardingState>;
    }
  } catch {}

  let experiences: any[] = [];
  try {
    const { data } = await supabase
      .from("experiences")
      .select("company_name, position, start_date, end_date, is_current, description")
      .eq("user_id", status.user_id)
      .order("start_date", { ascending: false })
      .limit(20);
    experiences = (data || []).map((e: any) => ({
      company_name: e.company_name ?? "",
      position: e.position ?? "",
      start_date: e.start_date || "",
      end_date: e.end_date || "",
      is_current: !!e.is_current,
      description: e.description || "",
    }));
  } catch {}

  return (
    <UserOnboarding initialProfile={profile} initialExperiences={experiences} />
  );
}