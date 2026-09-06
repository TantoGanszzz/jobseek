import Link from "next/link";
import { notFound } from "next/navigation";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { getApplicantDetail } from "@/lib/hrd/services";
import { getApplicantThread, getTestAssignmentById } from "@/lib/hrd/store";
import { ApplicantStatusBadge } from "@/components/applicant-status-badge";
import ApplicantActions from "@/components/hrd/applicant-actions";
import ScheduleInterviewForm from "@/components/hrd/schedule-interview-form";
import SendTestForm from "@/components/hrd/send-test-form";
import ReviewChallengeForm from "@/components/hrd/review-challenge-form";
import { ArrowLeft, Briefcase, MapPin, Calendar, ListChecks, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CompanyApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashUser = await getDashboardUser();
  const { applicant, job } = getApplicantDetail(id);

  if (!applicant || applicant.createdBy !== dashUser.id) notFound();

  const score = applicant.matchScore;
  const minScore = applicant.qualMinScore ?? 70;
  const thread = job ? getApplicantThread(job.createdBy, applicant.userId) : null;
  const testAssignment = applicant.testAssignmentId ? getTestAssignmentById(applicant.testAssignmentId) : null;
  const hasInterview = !!applicant.interview;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5">
        <Link href="/company/applicants" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" /> Back to applicants
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {(applicant.candidateName || "C")[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{applicant.candidateName}</h1>
              <ApplicantStatusBadge status={applicant.status} />
            </div>
            {applicant.candidateHeadline && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                <Briefcase className="h-4 w-4 text-blue-600" /> {applicant.candidateHeadline}
              </p>
            )}
            {applicant.candidateLocation && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-blue-600" /> {applicant.candidateLocation}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span className="text-sm text-slate-500">Applied for </span>
          <span className="text-sm font-medium text-slate-900">{job?.title ?? "a role"}</span>
          <div className="mt-1 text-xs text-slate-500">
            Applied {new Date(applicant.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {applicant.candidateBio && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">About</h2>
              <p className="mt-1 text-sm text-slate-600">{applicant.candidateBio}</p>
            </div>
          )}
          {applicant.candidateSkills.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {applicant.candidateSkills.map((skill) => (
                  <span key={skill} className="rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{skill}</span>
                ))}
              </div>
            </div>
          )}
          {(applicant.candidateSchool || applicant.candidateMajor || applicant.candidateEducation) && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Education</h2>
              <p className="mt-1 text-sm text-slate-600">
                {[applicant.candidateEducation, applicant.candidateMajor ? `Major in ${applicant.candidateMajor}` : null, applicant.candidateSchool].filter(Boolean).join(" · ")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Qualification</h2>
        <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Career Match</p>
            <p className={`mt-1 text-xl font-bold ${score != null && score >= minScore ? "text-green-700" : "text-red-600"}`}>
              {score != null ? `${score}%` : "Pending"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Qualification Score</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {applicant.qualScore != null ? `${applicant.qualScore} / 100` : "Pending"}
            </p>
          </div>
        </div>

        {testAssignment && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                {testAssignment.kind === "challenge" ? "Technical Challenge" : "Qualification Test"}
              </h3>
              {testAssignment.kind === "challenge" && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Challenge</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">{testAssignment.title}</p>

            {testAssignment.kind === "challenge" && (
              <>
                {testAssignment.description && (
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{testAssignment.description}</p>
                )}
                {testAssignment.instructions && (
                  <p className="mt-1 text-xs text-slate-500 whitespace-pre-line">Instructions: {testAssignment.instructions}</p>
                )}
                {testAssignment.deadline && (
                  <p className="mt-1 text-xs text-slate-500">Deadline: {testAssignment.deadline}</p>
                )}
              </>
            )}

            {testAssignment.status === "pending" && (
              <p className="mt-2 text-xs text-slate-500">
                Status: Pending — awaiting the candidate&apos;s {testAssignment.kind === "challenge" ? "submission" : "test taking"}.
              </p>
            )}

            {testAssignment.kind === "challenge" && testAssignment.status === "submitted" && (
              <div className="mt-3">
                <ReviewChallengeForm assignment={testAssignment} jobTitle={job?.title} />
              </div>
            )}

            {testAssignment.status === "completed" && (
              <div className="mt-2 flex items-center gap-3">
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  testAssignment.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {testAssignment.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {testAssignment.passed ? "Passed" : "Below minimum"}
                </span>
                <span className="text-sm text-slate-700">
                  {testAssignment.score} / {testAssignment.minScore}
                </span>
                {testAssignment.kind === "challenge" && testAssignment.reviewFeedback && (
                  <span className="text-xs text-slate-500">· {testAssignment.reviewFeedback}</span>
                )}
              </div>
            )}
          </div>
        )}

        {hasInterview && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Interview Scheduled</h3>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-800">{applicant.interview!.title}</p>
            <p className="text-sm text-slate-600">
              {applicant.interview!.date}
              {applicant.interview!.time ? ` at ${applicant.interview!.time}` : ""}
              {applicant.interview!.durationMinutes ? ` · ${applicant.interview!.durationMinutes} minutes` : ""}
            </p>
            {applicant.interview!.location && (
              <p className="text-sm text-slate-500">Location: {applicant.interview!.location}</p>
            )}
          </div>
        )}

        {(applicant.candidateResumeUrl || applicant.candidatePortfolioUrl) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {applicant.candidateResumeUrl && (
              <a href={applicant.candidateResumeUrl} target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                View CV
              </a>
            )}
            {applicant.candidatePortfolioUrl && (
              <a href={applicant.candidatePortfolioUrl} target="_blank" rel="noreferrer" className="inline-block rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Portfolio
              </a>
            )}
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Move candidate through</h3>
          <ApplicantActions applicant={applicant} />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">Interview & Test</h3>
          <ScheduleInterviewForm applicantId={applicant.id} />
          <SendTestForm applicantId={applicant.id} />
        </div>

        <div className="mt-5">
          {thread && (
            <Link href={`/company/messages?conv=${thread.id}`}>
              <Button variant="outline" className="border-slate-200 text-slate-700 cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4 text-blue-600" /> Message candidate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}