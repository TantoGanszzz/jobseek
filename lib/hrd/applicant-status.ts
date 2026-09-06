import type { ApplicantStatus } from "./types";

// Candidate-facing labels for the application pipeline.
export const APPLICANT_STATUS_LABELS: Record<ApplicantStatus, string> = {
  new: "Applied",
  screening: "Screening",
  test: "Technical Test",
  interview: "Interview",
  final_review: "Final Review",
  hired: "Hired",
  rejected: "Not selected",
};

// Leading edge of the pipeline a candidate runs through (per status flow).
export const APPLICANT_PIPELINE: ApplicantStatus[] = [
  "new",
  "screening",
  "test",
  "interview",
  "final_review",
];

export const APPLICANT_STATUS_STYLES: Record<ApplicantStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  screening: "bg-sky-50 text-sky-700 ring-sky-200",
  test: "bg-amber-50 text-amber-700 ring-amber-200",
  interview: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  final_review: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  hired: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};