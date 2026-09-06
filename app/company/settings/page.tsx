import Link from "next/link";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import PageHeader from "@/components/hrd/page-header";
import { Building2, ShieldCheck, UserCircle } from "lucide-react";

export default async function CompanySettingsPage() {
  const dashUser = await getDashboardUser();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings" subtitle="Manage your workspace preferences." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/company/profile"
          className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-slate-900">Company Profile</h3>
          <p className="mt-1 text-sm text-slate-500">Update company name, industry, and details that candidates see.</p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UserCircle className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-slate-900">Your Account</h3>
          <p className="mt-1 text-sm text-slate-500">Edit your personal profile and account details.</p>
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-slate-900">Security</h3>
          <p className="mt-1 text-sm text-slate-500">
            Signed in as <span className="font-medium text-slate-700">{dashUser.email}</span>. Role: HRD.
          </p>
        </div>
      </div>
    </div>
  );
}