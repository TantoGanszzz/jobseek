import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfileFromAuthUser } from "@/lib/dashboard-helpers";
import { generateCareerRecommendationsFromProfile } from "@/lib/recommendations";
import CareerGenerateButton from "@/components/career-generate-button";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissingableProfile {
  skills?: string[] | null;
  major?: string | null;
  headline?: string | null;
  bio?: string | null;
  preferred_roles?: string[] | null;
  interests?: string[] | null;
}

export default async function DashboardCareerPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const profile: MissingableProfile = {
    ...getProfileFromAuthUser(user),
    interests: Array.isArray(metadata.interests) ? metadata.interests : [],
    preferred_roles: Array.isArray(metadata.preferred_roles)
      ? metadata.preferred_roles
      : [],
  };

  const recommendations = generateCareerRecommendationsFromProfile(profile);

  const hasSkills = !!(profile.skills && profile.skills.length > 0);
  const hasMajor = !!profile.major;
  const hasHeadline = !!profile.headline;
  const hasBio = !!profile.bio;
  const hasCareerSignals = !!(
    (profile.preferred_roles && profile.preferred_roles.length > 0) ||
    (profile.interests && profile.interests.length > 0) ||
    metadata.career_goal
  );
  const signalCount = [
    hasSkills,
    hasMajor,
    hasHeadline,
    hasBio,
    hasCareerSignals,
  ].filter(Boolean).length;

  const missing: string[] = [];
  if (!hasSkills) missing.push("Skills");
  if (!hasMajor) missing.push("Major");
  if (!hasHeadline) missing.push("Headline");
  if (!hasBio) missing.push("Bio / Summary");
  if (!hasCareerSignals) missing.push("Career interests");

  const incomplete = signalCount <= 2;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Career Recommendations
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Top career matches based on your profile.
        </p>
      </div>

      {saved === "1" && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Profile saved — here are your updated career matches.</span>
        </div>
      )}

      {recommendations.length > 0 ? (
        <>
          <div className="space-y-4">
            {recommendations.map((r) => (
              <div
                key={r.careerName}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900">
                    {r.careerName}
                  </h3>
                  <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                    {r.matchScore}% Match
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Why this matches you
                  </p>
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Your matching skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(r.matchedSkills.length > 0 ? r.matchedSkills : r.requiredSkills).map(
                        (s: string) => (
                          <span
                            key={s}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                          >
                            {s}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Recommended skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.recommendedSkills.map((s: string) => (
                        <span
                          key={s}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Career Match — scored from your profile signals (not AI).
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/dashboard/find-jobs">
              <Button className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                Explore Jobs
              </Button>
            </Link>
            <Link href="/dashboard/profile/edit">
              <Button variant="outline" className="h-10 w-full sm:w-auto">
                Update Preferences
              </Button>
            </Link>
          </div>
        </>
      ) : incomplete ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Complete your profile to get better career recommendations.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Add skills, your major, and a short summary so we can match you to
            the careers that fit you best.
          </p>
          {missing.length > 0 && (
            <div className="mx-auto mt-4 max-w-md rounded-lg bg-slate-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Missing
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missing.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            <Link href="/dashboard/profile/edit">
              <Button className="bg-blue-600 px-6 text-white hover:bg-blue-700">
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Analyze Your Career Profile
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            We&apos;ll analyze the profile information you&apos;ve saved and
            suggest the career paths that match your skills and education.
          </p>
          {missing.length > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              Tip: adding{" "}
              {missing.slice(0, 2).join(", ").toLowerCase()} will improve your
              matches.
            </p>
          )}
          <div className="mt-6">
            <CareerGenerateButton />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Or{" "}
            <Link
              href="/dashboard/profile/edit"
              className="font-medium text-blue-600 hover:underline"
            >
              update your profile
            </Link>{" "}
            first for better results.
          </p>
        </div>
      )}
    </div>
  );
}