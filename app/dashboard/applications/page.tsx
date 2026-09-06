import type { Metadata } from "next";
import Link from "next/link";
import { ApplicantStatusBadge } from "@/components/applicant-status-badge";
import { createClient } from "@/lib/supabase/server";
import { BriefcaseBusiness, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "My Applications — Jobseek",
  description: "Track the status of your job applications.",
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: applications } = user
    ? await supabase.from("applications").select("id,status,applied_at,jobs(title,location,job_type,companies(name))").eq("user_id", user.id).order("applied_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="mt-1 text-sm text-slate-500">Track the progress of every application you have submitted.</p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">You haven&apos;t applied to any jobs yet.</p>
          <Link
            href="/dashboard/find-jobs"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Browse jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(applications ?? []).map((application: any) => {
            const job = application.jobs;
            return (
            <Link
              key={application.id}
              href={`/dashboard/applications/${application.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{job?.title ?? "Position"}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{job?.companies?.name ?? "Company"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ApplicantStatusBadge status={application.status} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                <span>
                  Applied{" "}
                  {new Date(application.applied_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-medium text-blue-700">View details</span>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
