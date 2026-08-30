import { Card, CardBody, CardHeader } from "@/components/ui/DataDisplay";
import { PasswordForm } from "@/components/dashboard/PasswordForm";
import { requireRole } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Settings" };

export default async function HrdSettingsPage() {
  const user = await requireRole("hrd");

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account security.</p>
      </section>

      <Card>
        <CardHeader title="Account" description="Your account details." />
        <CardBody className="text-sm">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Role</dt>
              <dd className="mt-0.5 font-medium text-slate-800">HRD / Employer</dd>
            </div>
            <div>
              <dt className="text-slate-400">Member since</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {formatDate(user.profile.created_at)}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change password" description="Use a strong, unique password." />
        <CardBody>
          <PasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
