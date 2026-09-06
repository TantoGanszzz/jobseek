import type { Metadata } from "next";
import Link from "next/link";
import CreateProjectForm from "@/components/hrd/create-project-form";
import PageHeader from "@/components/hrd/page-header";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Project — Jobseek HRD",
  description: "Create a new project.",
};

export default function CreateProjectPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Create Project" subtitle="Start a new initiative for your team.">
        <Link href="/company/projects" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </PageHeader>
      <CreateProjectForm />
    </div>
  );
}