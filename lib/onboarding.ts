import { createClient } from "@/lib/supabase/server";

export interface OnboardingUser {
  user_id: string;
  role: string;
  onboarding_completed: boolean;
  onboarding_step: number;
}

/** Fetch onboarding + role state for the current user. Returns null when unavailable. */
export async function getOnboardingStatus(): Promise<OnboardingUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let role = user.user_metadata?.role || "user";
  let onboarding_completed = true;
  let onboarding_step = 1;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed, onboarding_step")
      .eq("id", user.id)
      .single();
    if (profile) {
      role = profile.role || role;
      if (profile.onboarding_completed !== null && profile.onboarding_completed !== undefined) {
        onboarding_completed = !!profile.onboarding_completed;
      }
      onboarding_step = profile.onboarding_step ?? 1;
    }
  } catch {}

  return { user_id: user.id, role, onboarding_completed, onboarding_step };
}

/** Route an authenticated user to the correct post-login page (middleware/layouts). */
export function onboardingRedirectTarget(
  role: string,
  onboardingCompleted: boolean
): string | null {
  if (role === "admin") return "/admin";
  if (!onboardingCompleted) {
    return role === "hrd" ? "/onboarding/hrd" : "/onboarding/user";
  }
  return role === "hrd" ? "/company/dashboard" : "/dashboard";
}