import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  ListChecks,
  Building2,
  CalendarClock,
  GraduationCap,
  Target,
  Layers,
} from "lucide-react";
import { ApplicantStatusBadge } from "@/components/applicant-status-badge";
import { getCandidateJobDetailMatch } from "@/lib/hrd/services";
import { getProfileFromAuthUser } from "@/lib/dashboard-helpers";
import ApplyButton from "@/components/apply-button";
import SaveButton from "@/components/job-save-button";

export const metadata: Metadata = {
  title: "Job Detail — Jobseek",
  description: "Job details and application.",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = getProfileFromAuthUser(user);
  const userId = user?.id ?? "";

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const location = typeof profile.location === "string" ? profile.location : null;
  const preferredWorkType = Array.isArray(profile.preferred_work_type)
    ? profile.preferred_work_type
    : undefined;
  const preferredRoles = Array.isArray(profile.preferred_roles)
    ? profile.preferred_roles
    : undefined;
  const education = typeof profile.education === "string" ? profile.education : typeof profile.education_level === "string" ? profile.education_level : null;

  const detail = getCandidateJobDetailMatch(userId, id, {
    skills,
    location,
    preferred_work_type: preferredWorkType,
    education,
    major: typeof profile.major === "string" ? profile.major : null,
    preferred_roles: preferredRoles,
    headline: typeof profile.headline === "string" ? profile.headline : null,
  });

  const { job, applicant, saved = false, match } = detail;
  if (!job) {
    notFound();
  }

  const isSaved = userId ? saved : false;
  // Qualification-test persistence is not part of the current schema contract.
  const hasPendingTest = false;
  const today = new Date().toISOString().slice(0, 10);
  const isClosed = !!job.deadline && job.deadline < today;
  const canApply = !applicant && !isClosed;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <Link href="/dashboard/find-jobs" className="text-sm text-blue-700 hover:text-blue-800">
          ← Back to results
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-4 w-4 text-slate-400" /> {job.companyName}
            </p>
            {applicant && (
              <div className="mt-2">
                <ApplicantStatusBadge status={applicant.status} />
              </div>
            )}
          </div>
          {!applicant && <SaveButton jobId={job.id} initialSaved={isSaved} />}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          {job.location && (
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-blue-600" /> {job.location}</span>
          )}
          {job.jobType && (
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-600" /> {job.jobType}</span>
          )}
          {job.workMode && (
            <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-blue-600" /> {job.workMode}</span>
          )}
          {job.experienceLevel && (
            <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-blue-600" /> {job.experienceLevel}</span>
          )}
          {job.education && (
            <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-blue-600" /> {job.education}</span>
          )}
          {job.salaryRange && (
            <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-blue-600" /> {job.salaryRange}</span>
          )}
          {job.deadline && (
            <span className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-blue-600" /> Deadline: {job.deadline}</span>
          )}
        </div>

        {job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.map((skill) => {
              const matched = match.matchedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border ${
                    matched
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-100 text-slate-700"
                  }`}
                >
                  {matched && "✓ "}
                  {skill}
                </span>
              );
            })}
          </div>
        )}

        {job.stages.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Recruitment process</h3>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-600">
              {job.stages.map((stage, i) => (
                <span key={stage} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-300">→</span>}
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">{stage}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-5">
          {job.description && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">About the role</h2>
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{job.description}</p>
            </div>
          )}
          {job.responsibilities && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">Responsibilities</h2>
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">Requirements</h2>
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{job.requirements}</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Your Match</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">Overall</p>
              <p className="mt-1 text-xl font-bold text-blue-700">{match.overall}%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">Skills</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{match.skillScore}%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">Location</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{match.locationScore ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">Work Mode</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{match.workModeScore ?? "—"}</p>
            </div>
          </div>
          {match.reasons.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {match.reasons.map((reason, i) => (
                <li key={i}>· {reason}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Qualification Test</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {applicant
              ? "You will be invited to take a technical assessment as part of your application flow."
              : "After you apply, the company may invite you to take a technical assessment before moving forward."}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-slate-500">Required score:</span>
            <span className="font-semibold text-slate-900">{job.minQualificationScore} / 100</span>
          </div>
          {applicant && job.skills.length > 0 && (
            <div className="mt-2 text-sm text-slate-500">
              Your skill match: <span className={`font-semibold ${match.skillScore >= 60 ? "text-emerald-700" : "text-slate-700"}`}>{match.skillScore}%</span>
            </div>
          )}
          {applicant && hasPendingTest && (
            <Link href={`/dashboard/applications/${applicant.id}#test`}>
              <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                Take your test
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {applicant ? (
            <>
              <Button
                className="w-full sm:w-auto bg-slate-100 text-slate-500 cursor-not-allowed"
                disabled
              >
                Application submitted
              </Button>
              <Link href={`/dashboard/applications/${applicant.id}`} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-slate-200 text-slate-700 cursor-pointer">
                  View application status
                </Button>
              </Link>
            </>
          ) : isClosed ? (
            <Button className="w-full sm:w-auto bg-slate-100 text-slate-400 cursor-not-allowed" disabled>
              Application Closed
            </Button>
          ) : (
            <ApplyButton jobId={job.id} jobTitle={job.title} />
          )}
          {!applicant && !isClosed && <SaveButton jobId={job.id} initialSaved={isSaved} asButton />}
        </div>
      </div>
    </div>
  );
}
