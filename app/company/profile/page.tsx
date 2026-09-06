import { createClient } from "@/lib/supabase/server";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import CompanyProfileForm from "@/components/hrd/company-profile-form";
import PageHeader from "@/components/hrd/page-header";

export default async function CompanyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const dashUser = await getDashboardUser();

  const profile = null;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Company Profile"
        subtitle="Your company information — kept in your account so candidates can read it while you finalize the data layer."
      />

      {!profile && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Complete your company profile to make your team workspace feel complete.
        </div>
      )}

      {profile && profile.name && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            {profile.name[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
            <p className="text-sm text-slate-500">{profile.industry || "Industry not set"} · {profile.companySize || "Size not set"}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <CompanyProfileForm key={dashUser.id} initial={profile} />
      </div>
    </div>
  );
}
