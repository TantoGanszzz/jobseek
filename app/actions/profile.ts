"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const location = formData.get("location") as string;
  const bio = formData.get("bio") as string;
  const skillsJson = formData.get("skills") as string;

  let skills: string[] = [];
  try {
    skills = JSON.parse(skillsJson);
  } catch {
    skills = [];
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: fullName,
      phone,
      location,
      bio,
      skills,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

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
