import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardLearningClient from "@/components/dashboard-learning";
import type { Course, LearningProgress } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Learning — Jobseek",
  description:
    "Kembangkan skill Anda dan persiapkan diri untuk peluang karier berikutnya.",
};

export default async function LearningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let courses: Course[] = [];
  let progress: LearningProgress[] = [];

  try {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    courses = (coursesData as Course[]) || [];
  } catch {
    // Table might not exist
  }

  try {
    const { data: progressData } = await supabase
      .from("learning_progress")
      .select("*, course:courses(*)")
      .eq("user_id", user!.id);
    progress = (progressData as LearningProgress[]) || [];
  } catch {
    // Table might not exist
  }

  return (
    <DashboardLearningClient courses={courses} progress={progress} />
  );
}
