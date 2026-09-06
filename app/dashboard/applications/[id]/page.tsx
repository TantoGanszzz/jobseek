import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  FileCheck2,
  ListChecks,
  MessageSquare,
  PartyPopper,
  XCircle,
} from "lucide-react";
import { getCandidateApplicationDetail } from "@/lib/hrd/services";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { ApplicantStatusBadge } from "@/components/applicant-status-badge";
import {
  APPLICANT_PIPELINE,
  APPLICANT_STATUS_LABELS,
} from "@/lib/hrd/applicant-status";
import type { ApplicantStatus } from "@/lib/hrd/types";

export const metadata: Metadata = {
  title: "Application — Jobseek",
  description: "Your application status and timeline.",
};

function PipelineSteps({ status }: { status: ApplicantStatus }) {
  const steps = [...APPLICANT_PIPELINE] as ApplicantStatus[];
  const currentIndex =
    status === "hired" || status === "rejected"
      ? APPLICANT_PIPELINE.length
      : APPLICANT_PIPELINE.indexOf(status) >= 0
        ? APPLICANT_PIPELINE.indexOf(status) + 1
        : 1;

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        return (
          <div key={step} className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              {done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-slate-300" />
              )}
              <span className={`text-xs font-medium whitespace-nowrap ${done ? "text-slate-800" : "text-slate-400"}`}>
                {APPLICANT_STATUS_LABELS[step]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 sm:w-10 ${i < currentIndex - 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashUser = await getDashboardUser();
  const detail = getCandidateApplicationDetail(dashUser.id, id);

  if (!detail.applicant || !detail.job) {
    notFound();
  }

  const { applicant, job, testAssignment } = detail;
  // Recruitment chat is not supported by the current schema contract.
  const thread = null;
  const isFinal = applicant.status === "hired" || applicant.status === "rejected";
  const isInterviewScheduled = !!applicant.interview;
  const isTestAssigned = !!testAssignment;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <Link href="/dashboard/applications" className="text-sm text-blue-700 hover:text-blue-800">
          ← Back to applications
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-4 w-4 text-slate-400" /> {job.companyName}
            </p>
          </div>
          <ApplicantStatusBadge status={applicant.status} />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Applied{" "}
          {new Date(applicant.appliedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {applicant.status === "hired" && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <PartyPopper className="h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">You were hired!</p>
              <p className="text-sm text-emerald-700">
                Your employee workspace is now active. Open the <strong>Workspace</strong> section to see your tasks, projects, and messages.
              </p>
            </div>
          </div>
        )}
        {applicant.status === "rejected" && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <XCircle className="h-6 w-6 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">
              Thank you for applying — this position has been filled or closed. Keep an eye on Find Jobs for new opportunities.
            </p>
          </div>
        )}

        {/* Pipeline */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <PipelineSteps status={applicant.status} />
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-slate-900">Timeline</h2>
          {applicant.statusHistory.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No updates yet.</p>
          ) : (
            <ol className="mt-3 space-y-4 border-l border-slate-200 pl-4">
              {applicant.statusHistory.map((entry, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] flex h-2 w-2 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  </span>
                  <p className="text-sm font-medium text-slate-800">
                    {APPLICANT_STATUS_LABELS[entry.status]}
                  </p>
                  <p className="text-xs text-slate-500">{entry.note ?? entry.status}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(entry.at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Interview */}
        {applicant.interview && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-900">Interview Scheduled</h3>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">{applicant.interview.title}</p>
            <p className="mt-1 text-sm text-slate-600">
              {applicant.interview.date}
              {applicant.interview.time ? ` at ${applicant.interview.time}` : ""}
            </p>
            {applicant.interview.durationMinutes && (
              <p className="text-sm text-slate-500">{applicant.interview.durationMinutes} minutes</p>
            )}
            {applicant.interview.location && (
              <p className="text-sm text-slate-500">Location: {applicant.interview.location}</p>
            )}
            {applicant.interview.notes && <p className="mt-1 text-sm text-slate-500">{applicant.interview.notes}</p>}
          </div>
        )}

        {/* Qualification test */}
        <div id="test" className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Qualification Test</h3>
          </div>
          {!isTestAssigned && !isFinal ? (
            <p className="mt-2 text-sm text-slate-600">
              When your application reaches this stage, the company will invite you to take a qualification test.
            </p>
          ) : testAssignment && testAssignment.status === "pending" ? (
            <div className="mt-3">
              <p className="text-sm text-slate-600">
                You have a pending test: <span className="font-medium text-slate-800">{testAssignment.title}</span>. Minimum score {testAssignment.minScore}/100
              </p>
              <Link href={`/dashboard/tests/${testAssignment.id}`}>
                <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                  Start Test
                </Button>
              </Link>
            </div>
          ) : testAssignment && testAssignment.status === "completed" ? (
            <div className="mt-3 flex items-center gap-3">
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                testAssignment.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {testAssignment.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {testAssignment.passed ? "Passed" : "Below minimum"}
              </span>
              <span className="text-sm text-slate-700">
                Score {testAssignment.score} / {testAssignment.minScore}
              </span>
              <FileCheck2 className="ml-auto h-4 w-4 text-slate-400" />
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              A qualification test is part of this job&apos;s flow.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {thread && (
            <Link href={`/dashboard/workspace/messages?conv=${thread.id}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-slate-200 text-slate-700 cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                Message HRD
              </Button>
            </Link>
          )}
          <Link href={`/dashboard/jobs/${job.id}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-slate-200 text-slate-700 cursor-pointer">
              View job posting
            </Button>
          </Link>
        </div>

        {isInterviewScheduled && !isFinal && (
          <p className="mt-4 text-xs text-slate-500">
            Tip: add the interview to your calendar and prepare ahead of time.
          </p>
        )}
      </div>
    </div>
  );
}
