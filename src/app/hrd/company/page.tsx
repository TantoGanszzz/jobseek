import { Card, CardBody, CardHeader } from "@/components/ui/DataDisplay";
import { CompanyForm } from "@/components/hrd/CompanyForm";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { Company } from "@/types/database";

export const metadata = { title: "Company Profile" };

export default async function CompanyPage() {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.userId)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          This information appears on all of your job postings.
        </p>
      </section>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader title={company ? "Edit company" : "Set up your company"} />
        <CardBody>
          <CompanyForm company={(company as unknown as Company) ?? null} />
        </CardBody>
      </Card>
    </div>
  );
}
