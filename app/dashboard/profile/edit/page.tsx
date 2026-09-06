import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile-form";
import { getDashboardUser, getProfileFromAuthUser } from "@/lib/dashboard-helpers";
import type { Profile } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Edit Profile — Jobseek",
  description: "Edit your Jobseek career profile.",
};

export default async function EditProfilePage() {
  const supabase = await createClient();
  const dashUser = await getDashboardUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = (user
    ? getProfileFromAuthUser(user)
    : {}) as Profile;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your career information.</p>
      </div>

      <ProfileForm profile={profile} email={dashUser.email} />
    </div>
  );
}