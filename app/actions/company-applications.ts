"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify the HRD owns the company associated with this application's job
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  let companyId = profile?.company_id || null;
  if (!companyId) {
    const { data: comp } = await supabase.from("companies").select("id").eq("created_by", user.id).maybeSingle();
    companyId = comp?.id || null;
  }

  const { data: application } = await supabase
    .from("applications")
    .select("job:jobs(company_id)")
    .eq("id", applicationId)
    .single();

  if (!application?.job || application.job.company_id !== companyId) {
    return { error: "You are not authorized to update this application." };
  }

  const allowed = ["shortlisted", "rejected", "accepted", "interview"];
  if (!allowed.includes(status)) {
    return { error: "Invalid status" };
  }

  // HRD cannot modify the candidate's score — only the status
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { error: error.message };

  revalidatePath("/company/applicants");
  return { success: true };
}
