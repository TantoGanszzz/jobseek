import type { Metadata } from "next";
import DashboardFindJobsClient from "@/components/dashboard-find-jobs";

export const metadata: Metadata = {
  title: "Find Jobs — Jobseek",
  description: "Cari dan lamar pekerjaan yang sesuai dengan skill Anda.",
};

export default function DashboardFindJobsPage() {
  return <DashboardFindJobsClient />;
}
