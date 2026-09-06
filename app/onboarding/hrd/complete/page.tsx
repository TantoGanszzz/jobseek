import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default async function HrdCompletePage() {
  const status = await getOnboardingStatus();
  if (!status) redirect("/login");
  if (status.role !== "hrd") redirect("/onboarding/user");
  if (!status.onboarding_completed) redirect("/onboarding/hrd");

  const supabase = await createClient();
  let companyStatus = "pending";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", status.user_id)
      .single();
    if (profile?.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("status")
        .eq("id", profile.company_id)
        .single();
      if (company?.status) companyStatus = company.status;
    }
  } catch {}

  const isPending = companyStatus === "pending";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Building2 className="h-7 w-7" />
      </span>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">Your company profile is ready.</h1>

      <div
        className={`mx-auto mt-5 max-w-md rounded-xl border p-5 ${
          isPending ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <p className="text-lg font-bold text-slate-900">
          Status: {isPending ? "Pending Review" : companyStatus}
        </p>
        {isPending && (
          <p className="mt-2 text-sm text-slate-600">
            Your company profile has been submitted. An administrator will review your company
            information before jobs can be publicly published.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/company/dashboard">
          <Button className="h-10 bg-blue-600 px-6 text-white hover:bg-blue-700">Go to Company Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}