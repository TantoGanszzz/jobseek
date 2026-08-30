import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile-form";

export const metadata: Metadata = {
  title: "Profile — Jobseek",
  description: "Edit profil karier Anda di Jobseek.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    profile = data;
  } catch {
    // Profile table might not exist yet
  }

  return (
    <div className="bg-light-bg min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">
            My Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola informasi profil dan pengaturan akun Anda.
          </p>
        </div>

        <ProfileForm profile={profile} email={user?.email || ""} />
      </div>
    </div>
  );
}
