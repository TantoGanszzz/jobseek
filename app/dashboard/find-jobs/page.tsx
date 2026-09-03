import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardFindJobsClient from "@/components/dashboard-find-jobs";
import type { Job } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Find Jobs — Jobseek",
  description: "Cari dan lamar pekerjaan yang sesuai dengan skill Anda.",
};

export default async function DashboardFindJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch jobs from Supabase
  let jobs: Job[] = [];
  let savedJobIds: string[] = [];

  try {
    const { data } = await supabase
      .from("jobs")
      .select("*, company:companies(*)")
      .order("created_at", { ascending: false });
    jobs = (data as Job[]) || [];
  } catch {
    // Table might not exist — client will use mock data as fallback
  }

  // Fetch user's saved jobs
  try {
    const { data: savedData } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", user!.id);
    savedJobIds = savedData?.map((s) => s.job_id) || [];
  } catch {
    // Table might not exist
  }

  return (
    <DashboardFindJobsClient
      initialJobs={jobs}
      initialSavedJobIds={savedJobIds}
    />
  );
}
