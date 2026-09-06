import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Hourglass, Link2, MessageSquareQuote, XCircle } from "lucide-react";
import { getCandidateTest } from "@/lib/hrd/services";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import TestAssignmentClient from "@/components/test-assignment-client";
import TestSubmissionClient from "@/components/test-submission-client";

export const metadata: Metadata = {
  title: "Technical Assessment — Jobseek",
  description: "Complete your technical assessment.",
};

export default async function TestAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const dashUser = await getDashboardUser();
  const detail = getCandidateTest(dashUser.id, assignmentId);
  if (!detail.assignment || !detail.job) {
    notFound();
  }

  const { assignment, job } = detail;
  const isQuiz = assignment.kind === "quiz";
  const isCompleted = assignment.status === "completed";
  const isSubmitted = assignment.status === "submitted";

  // Quiz: self-assessed proficiency, auto-scored server-side.
  if (isQuiz) {
    if (isCompleted && assignment.score != null) {
      const passed = !!assignment.passed;
      return (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-green-50" : "bg-red-50"}`}>
              {passed ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-red-500" />}
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              {passed
                ? "Congratulations! You passed the qualification test."
                : "Your score is below the minimum for this position."}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {assignment.title} · {job.title} at {job.companyName}
            </p>

            <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Your Score</p>
                <p className={`mt-1 text-xl font-bold ${passed ? "text-emerald-700" : "text-red-600"}`}>
                  {assignment.score} / 100
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Required</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{assignment.minScore} / 100</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Status</p>
                <p className={`mt-1 text-xl font-bold ${passed ? "text-emerald-700" : "text-red-600"}`}>
                  {passed ? "Qualified" : "Not Qualified"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Link href="/dashboard/tests">
                <Button variant="outline" className="border-slate-200 text-slate-700 cursor-pointer">
                  All Tests
                </Button>
              </Link>
              <Link href="/dashboard/applications">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                  View Applications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <TestAssignmentClient
        assignmentId={assignment.id}
        title={assignment.title}
        jobTitle={job.title}
        companyName={job.companyName}
        questions={assignment.questions}
        minScore={assignment.minScore}
        timeLimitMinutes={assignment.timeLimitMinutes}
      />
    );
  }

  // Challenge: brief + manual submission, reviewed by the HRD.
  const submission = assignment.submission;

  if (isCompleted) {
    const passed = !!assignment.passed;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-green-50" : "bg-red-50"}`}>
            {passed ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-red-500" />}
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            {passed
              ? "Your challenge was accepted. You are moving to the interview stage."
              : "This challenge did not pass this time."}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {assignment.title} · {job.title} at {job.companyName}
          </p>

          <div className="mx-auto mt-6 max-w-sm space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Review score</span>
              <span className={`text-xl font-bold ${passed ? "text-emerald-700" : "text-red-600"}`}>
                {assignment.reviewScore ?? assignment.score} / {assignment.minScore}
              </span>
            </div>
            {assignment.reviewFeedback && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600">
                <MessageSquareQuote className="mb-1 h-4 w-4 text-slate-400" /> Review feedback:
                <p className="mt-1 whitespace-pre-line">{assignment.reviewFeedback}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard/tests">
              <Button variant="outline" className="border-slate-200 text-slate-700 cursor-pointer">
                All Tests
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                View Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">{assignment.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {job.title} · {job.companyName}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5" /> Passing score {assignment.minScore} / 100
            </span>
            {assignment.deadline && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                <Hourglass className="h-3.5 w-3.5" /> {assignment.deadline}
              </span>
            )}
          </div>
        </div>

        {assignment.description && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">The challenge</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{assignment.description}</p>
          </div>
        )}

        {assignment.instructions && (
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Instructions</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{assignment.instructions}</p>
          </div>
        )}

        {isSubmitted && submission ? (
          <div className="mt-6">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Submitted — awaiting review
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Submitted on {new Date(submission.submittedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}. You cannot change your submission now.
              </p>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {submission.gitHubUrl && (
                <p><span className="text-slate-500">Repository:</span> <a href={submission.gitHubUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{submission.gitHubUrl}</a></p>
              )}
              {submission.liveDemoUrl && (
                <p><span className="text-slate-500">Live demo:</span> <a href={submission.liveDemoUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{submission.liveDemoUrl}</a></p>
              )}
              {submission.textAnswer && (
                <p className="whitespace-pre-line"><span className="text-slate-500">Your answer:</span> {submission.textAnswer}</p>
              )}
              {submission.notes && (
                <p className="whitespace-pre-line"><span className="text-slate-500">Notes:</span> {submission.notes}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Link2 className="h-4 w-4 text-blue-600" /> Submit your work
            </h2>
            <TestSubmissionClient assignmentId={assignment.id} deadline={assignment.deadline} />
          </div>
        )}
      </div>
    </div>
  );
}