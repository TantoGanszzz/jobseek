import type { Metadata } from "next";
import Link from "next/link";
import { getCandidateTests } from "@/lib/hrd/services";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { CheckCircle2, Clock, Code2, Hourglass, ListChecks, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "My Technical Assessments — Jobseek",
  description: "Complete your pending assessments and review results.",
};

export default async function TechnicalTestsPage() {
  const dashUser = await getDashboardUser();
  const tests = getCandidateTests(dashUser.id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Technical Assessments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete the tests and challenges the company sent you and review your results.
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          <ListChecks className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3">You don&apos;t have any assessments yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Assessments appear here after a company invites you, once your application reaches that stage.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(({ assignment, job }) => {
            const isPending = assignment.status === "pending";
            const isSubmitted = assignment.status === "submitted";
            const isChallenge = assignment.kind === "challenge";
            return (
              <div
                key={assignment.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                      {isChallenge && <Code2 className="h-4 w-4 text-blue-600" />}
                      {assignment.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {job?.title ?? "Position"} · {job?.companyName ?? "Company"}
                    </p>
                  </div>
                  {isPending ? (
                    <Link href={`/dashboard/tests/${assignment.id}`}>
                      <span className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">
                        {isChallenge ? "Start Challenge" : "Start Test"}
                      </span>
                    </Link>
                  ) : isSubmitted ? (
                    <Link href={`/dashboard/tests/${assignment.id}`}>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 cursor-pointer">
                        <Hourglass className="h-4 w-4" /> Under Review
                      </span>
                    </Link>
                  ) : assignment.passed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                      <XCircle className="h-4 w-4" /> Below minimum
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-sm">
                  {isPending && (
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {isChallenge ? "Passing score" : `${assignment.timeLimitMinutes} minute limit`}
                    </span>
                  )}
                  <span className="text-slate-500">
                    Score: <span className="font-medium text-slate-700">{assignment.minScore} / 100</span>
                  </span>
                  {isChallenge && assignment.deadline && isPending && (
                    <span className="text-slate-500">Deadline: {assignment.deadline}</span>
                  )}
                  {!isPending && !isSubmitted && (
                    <span className={`font-semibold ${assignment.passed ? "text-emerald-700" : "text-red-600"}`}>
                      Your result: {assignment.reviewScore ?? assignment.score} / 100
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}