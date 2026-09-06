import type { Metadata } from "next";
import CreateJobForm from "@/components/create-job-form";

export const metadata: Metadata = {
  title: "Create Job — Jobseek",
  description: "Create a new job posting.",
};

export default function CreateJobPage() {
  return <CreateJobForm />;
}