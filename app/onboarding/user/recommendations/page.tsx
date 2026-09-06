import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default async function UserRecommendationsPage() {
  const status = await getOnboardingStatus();
  if (!status) redirect("/login");
  if (status.role !== "user") redirect(status.role === "hrd" ? "/onboarding/hrd" : "/admin");
  if (!status.onboarding_completed) redirect("/onboarding/user");

  const supabase = await createClient();
  let recommendations: any[] = [];
  try {
    const { data } = await supabase
      .from("career_recommendations")
      .select("career_name, match_score, reason, required_skills, recommended_skills")
      .eq("user_id", status.user_id)
      .order("match_score", { ascending: false })
      .limit(5);
    recommendations = data || [];
  } catch {}

  const top = recommendations[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Sparkles className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">You&apos;re all set!</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Your Jobseek profile is ready. Here are the career paths that best match your profile.
        </p>
        {top && (
          <div className="mx-auto mt-4 w-full max-w-md rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Your Top Career Match</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{top.career_name}</p>
            <p className="text-sm font-semibold text-blue-700">{top.match_score}% Match</p>
          </div>
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Recommended Career Paths</h2>

      {recommendations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Add more skills and interests to unlock stronger career matches.
        </p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((r) => (
            <div key={r.career_name} className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900">{r.career_name}</h3>
                <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                  {r.match_score}% Match
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Why this matches you</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {String(r.reason || "")
                    .split("\n")
                    .filter(Boolean)
                    .map((line: string) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {line}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Skills you have / required</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.required_skills?.map((s: string) => (
                      <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Skills to learn</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.recommended_skills?.map((s: string) => (
                      <span key={s} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard/career">
          <Button className="h-10 bg-blue-600 px-6 text-white hover:bg-blue-700">Explore Jobs</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="h-10 px-6">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}