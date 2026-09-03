import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile-form";
import type { Profile } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Profile — Jobseek",
  description: "Edit profil karier Anda di Jobseek.",
};

function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0;
  const fields: (keyof Profile)[] = [
    "full_name",
    "headline",
    "phone",
    "location",
    "bio",
    "skills",
    "resume_url",
    "avatar_url",
  ];
  let filled = 0;
  for (const field of fields) {
    const val = profile[field];
    if (val !== null && val !== undefined && val !== "") {
      if (Array.isArray(val) && val.length === 0) continue;
      filled++;
    }
  }
  return Math.round((filled / fields.length) * 100);
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    profile = data as Profile | null;
  } catch {
    // Profile table might not exist yet
  }

  const completion = calculateProfileCompletion(profile);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">
              Profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              Kelola informasi profil dan pengaturan akun Anda.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-bold text-navy">{completion}%</div>
            <div className="text-xs text-muted-foreground">Profil Lengkap</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-light-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-navy rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 sm:hidden">
            <span className="text-xs text-muted-foreground">Profil Lengkap</span>
            <span className="text-xs font-medium text-navy">{completion}%</span>
          </div>
        </div>
      </div>

      <ProfileForm profile={profile} email={user?.email || ""} />
    </div>
  );
}
