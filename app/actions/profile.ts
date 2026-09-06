"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const fullName = (formData.get("full_name") as string)?.trim() || "";
  const headline = formData.get("headline") as string;
  const phone = formData.get("phone") as string;
  const location = formData.get("location") as string;
  const bio = formData.get("bio") as string;
  const education = formData.get("education") as string;
  const university = formData.get("university") as string;
  const major = formData.get("major") as string;
  const github_url = formData.get("github_url") as string;
  const linkedin_url = formData.get("linkedin_url") as string;
  const portfolio_url = formData.get("portfolio_url") as string;
  const skillsJson = formData.get("skills") as string;

  let skills: string[] = [];
  try {
    skills = JSON.parse(skillsJson);
  } catch {
    skills = [];
  }

  // Profile lives in the signed-in user's own metadata (auth.users).
  // The user can only ever update their own account — no public table needed.
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      headline: headline || null,
      phone,
      location,
      bio,
      skills,
      education: education || null,
      university: university || null,
      major: major || null,
      github_url: github_url || null,
      linkedin_url: linkedin_url || null,
      portfolio_url: portfolio_url || null,
      updated_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("updateProfile failed:", error);
    return { error: "Unable to save your profile. Please try again." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/profile/edit");

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();

  const newPassword = formData.get("new_password") as string;

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
