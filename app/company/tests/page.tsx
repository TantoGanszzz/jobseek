import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/hrd/page-header";
import EmptyState from "@/components/hrd/empty-state";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, FileQuestion, Code2, ArrowRight } from "lucide-react";

export default async function CompanyTestsPage() {
  const dashUser = await getDashboardUser();
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("test_assignments")
    .select("*, profiles:candidate_id(full_name), jobs(title)")
    .order("created_at", { ascending: false });

  const rows = (assignments || []).map((a: any) => ({
    id: a.id,
    applicantId: a.application_id,
    kind: a.kind,
    candidateName: a.profiles?.full_name ?? "Candidate",
    jobTitle: a.jobs?.title ?? "Position",
    minScore: a.min_score,
    score: a.score,
    passed: a.passed,
    status: a.status,
    assignedAt: a.created_at,
    completedAt: a.completed_at,
    deadline: a.deadline,
  }));

  const sorted = [...rows].sort(
    (a: any, b: any) =>
      (a.status === "submitted" ? 0 : 1) - (b.status === "submitted" ? 0 : 1) ||
      b.assignedAt.localeCompare(a.assignedAt)
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Qualification Tests" subtitle="Review qualification tests and technical challenges sent to applicants." />

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        {sorted.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No assessments sent yet"
            description="When you send a qualification test or technical challenge to an applicant (from their profile), it appears here with its result."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Candidate</th>
                  <th className="pb-3 pr-4 font-medium">Job</th>
                  <th className="pb-3 pr-4 font-medium">Minimum</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4">
                      {t.kind === "challenge" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <Code2 className="h-3.5 w-3.5" /> Challenge
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          <FileQuestion className="h-3.5 w-3.5" /> Quiz
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-medium text-slate-900">{t.candidateName}</div>
                      <div className="text-xs text-slate-400">
                        Sent {new Date(t.assignedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {t.deadline ? ` · Closes ${t.deadline}` : ""}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-700">{t.jobTitle}</td>
                    <td className="py-4 pr-4 text-slate-700">{t.minScore} / 100</td>
                    <td className="py-4 pr-4 text-slate-700">
                      {t.status === "completed" && t.score != null ? `${t.score} / 100` : "—"}
                    </td>
                    <td className="py-4">
                      {t.status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      ) : t.status === "submitted" ? (
                        t.applicantId ? (
                          <Link
                            href={`/company/applicants/${t.applicantId}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            To review <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Awaiting review
                          </span>
                        )
                      ) : t.passed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <XCircle className="h-3.5 w-3.5" /> Below minimum
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}