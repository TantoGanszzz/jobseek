"use server";

import { createClient } from "@/lib/supabase/server";

export async function addProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const role = formData.get("role") as string;
  const yearStr = formData.get("year") as string;
  const live_url = formData.get("live_url") as string;
  const github_url = formData.get("github_url") as string;
  const techStackJson = formData.get("tech_stack") as string;

  let tech_stack: string[] = [];
  try {
    tech_stack = JSON.parse(techStackJson);
  } catch {
    tech_stack = [];
  }

  const year = yearStr ? parseInt(yearStr, 10) : null;

  const { error } = await supabase.from("portfolio_projects").insert({
    user_id: user.id,
    name,
    description: description || null,
    role: role || null,
    year,
    live_url: live_url || null,
    github_url: github_url || null,
    tech_stack,
    thumbnail_url: null,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const role = formData.get("role") as string;
  const yearStr = formData.get("year") as string;
  const live_url = formData.get("live_url") as string;
  const github_url = formData.get("github_url") as string;
  const techStackJson = formData.get("tech_stack") as string;

  let tech_stack: string[] = [];
  try {
    tech_stack = JSON.parse(techStackJson);
  } catch {
    tech_stack = [];
  }

  const year = yearStr ? parseInt(yearStr, 10) : null;

  const { error } = await supabase
    .from("portfolio_projects")
    .update({
      name,
      description: description || null,
      role: role || null,
      year,
      live_url: live_url || null,
      github_url: github_url || null,
      tech_stack,
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("portfolio_projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
