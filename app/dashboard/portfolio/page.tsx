import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardPortfolioClient from "@/components/dashboard-portfolio";
import type { Profile, PortfolioProject } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Portfolio — Jobseek",
  description: "Tampilkan proyek dan karya terbaik Anda.",
};

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let projects: PortfolioProject[] = [];

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    profile = data as Profile | null;
  } catch {
    // Profile table might not exist
  }

  try {
    const { data } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    projects = (data as PortfolioProject[]) || [];
  } catch {
    // Table might not exist
  }

  return (
    <DashboardPortfolioClient
      profile={profile}
      initialProjects={projects}
      userEmail={user?.email || ""}
    />
  );
}
