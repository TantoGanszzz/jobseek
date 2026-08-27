import type { Metadata } from "next";
import JobSearch from "@/components/job-search";
import FeaturedJobs from "@/components/featured-jobs";

export const metadata: Metadata = {
  title: "Find Jobs — Jobseek",
  description:
    "Cari pekerjaan terbaru di Indonesia. Temukan posisi yang sesuai dengan skill dan preferensi Anda.",
};

export default function FindJobsPage() {
  return (
    <>
      <JobSearch />
      <FeaturedJobs />
    </>
  );
}
