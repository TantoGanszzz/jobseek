"use server";

import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "approved", "rejected", "suspended"];

export async function updateCompanyStatus(companyId: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Only admins can change company status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden: admin access required." };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  const { error } = await supabase
    .from("companies")
    .update({ status })
    .eq("id", companyId);

  if (error) return { error: error.message };
  return { success: true };
}