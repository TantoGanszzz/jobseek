import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getEmployees, getProjects } from "@/lib/hrd/services";
import CreateTaskForm from "@/components/hrd/create-task-form";
import PageHeader from "@/components/hrd/page-header";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Task — Jobseek HRD",
  description: "Create a new team task.",
};

export default async function CreateTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  const dashUser = await getDashboardUser();
  const projects = getProjects(dashUser.id);
  const employees = getEmployees(dashUser.id);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Create Task" subtitle="Assign work and set expectations.">
        <Link href="/company/tasks" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </PageHeader>
      <CreateTaskForm projects={projects} employees={employees} defaultProjectId={project} />
    </div>
  );
}