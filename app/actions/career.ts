"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getProfileFromAuthUser } from "@/lib/dashboard-helpers";
import { generateCareerRecommendationsFromProfile } from "@/lib/recommendations";

/**
 * Generate career recommendations from the signed-in user's own auth
 * metadata (auth.users.raw_user_meta_data) — no public table needed —
 * and persist the result back into their metadata.
 */
export async function generateCareerRecommendations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const profile = {
    ...getProfileFromAuthUser(user),
    interests: Array.isArray(metadata.interests) ? metadata.interests : [],
    preferred_roles: Array.isArray(metadata.preferred_roles)
      ? metadata.preferred_roles
      : [],
    experience_level:
      typeof metadata.experience_level === "string"
        ? metadata.experience_level
        : null,
    career_goal:
      typeof metadata.career_goal === "string" ? metadata.career_goal : null,
  };

  const recommendations = generateCareerRecommendationsFromProfile(profile);

  const { error } = await supabase.auth.updateUser({
    data: {
      career_recommendations: recommendations,
      recommendations_generated_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("generateCareerRecommendations failed:", error);
    return { error: "Unable to save recommendations. Please try again." };
  }

  revalidatePath("/dashboard/career");

  return { success: true, recommendations };
}