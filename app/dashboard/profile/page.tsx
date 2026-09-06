import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Pencil } from "lucide-react";
import { getDashboardUser, getProfileFromAuthUser, calculateProfileStrength } from "@/lib/dashboard-helpers";
import type { Profile } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Profile — Jobseek",
  description: "Your career profile.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const dashUser = await getDashboardUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = (user ? getProfileFromAuthUser(user) : {}) as Profile;
  const completion = calculateProfileStrength(profile);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shrink-0">
              {(profile?.full_name || dashUser.name || "U")[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {profile?.full_name || dashUser.name}
              </h1>
              {profile?.headline && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  {profile.headline}
                </p>
              )}
              {profile?.location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
          <Link href="/dashboard/profile/edit">
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile strength on header */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Profile Strength</span>
            <span className="text-lg font-bold text-blue-700">{completion}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Complete your profile to improve your chances of being discovered by recruiters.
          </p>
        </div>

        {/* Sections overview */}
        <div className="mt-5 space-y-4">
          {profile?.bio && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">About</h2>
              <p className="mt-1 text-sm text-slate-600">{profile.bio}</p>
            </div>
          )}
          {profile?.skills && profile.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(profile?.university || profile?.major || profile?.education) && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Education</h2>
              <p className="mt-1 text-sm text-slate-600">
                {[profile.education, profile.major ? `Major in ${profile.major}` : null, profile.university]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}
          {(profile?.github_url || profile?.linkedin_url || profile?.portfolio_url) && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Links</h2>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">GitHub</a>}
                {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>}
                {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">Portfolio</a>}
              </div>
            </div>
          )}
          {profile?.resume_url && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">CV</h2>
              <a href={profile.resume_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-blue-700 hover:underline">View CV</a>
            </div>
          )}
          {!profile?.bio && !profile?.skills?.length && !profile?.university && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
              Complete your profile to showcase your skills and experience.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}