import { notFound } from "next/navigation";
import { Badge, Card, CardBody, CardHeader, EmptyState } from "@/components/ui/DataDisplay";
import { ButtonLink } from "@/components/ui/Button";
import { JobForm } from "@/components/hrd/JobForm";
import { ApplicationStatusSelect } from "@/components/hrd/ApplicationStatusSelect";
import { Avatar } from "@/components/ui/DataDisplay";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { APPLICATION_STATUS_STYLES, formatDate } from "@/lib/utils/format";
import type { ApplicationStatus } from "@/types/database";

export const metadata = { title: "Manage Job" };

interface ApplicantRow {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  cover_note: string | null;
  profiles: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    position: string | null;
    avatar_url: string | null;
  } | null;
}

export default async function ManageJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("hrd");
  const supabase = await createClient();

  // Fetch the job and ensure it belongs to this HRD.
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.userId)
    .maybeSingle();

  if (!job) notFound();

  const { data: applicants } = await supabase
    .from("applications")
    .select(
      `id, status, applied_at, cover_note,
       profiles (user_id, full_name, email, position, avatar_url)`
    )
    .eq("job_id", id)
    .order("applied_at", { ascending: false });

  const rows = (applicants ?? []) as unknown as ApplicantRow[];

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{job.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Manage this posting and its applicants.</p>
        </div>
        <ButtonLink href="/hrd/jobs" variant="outline" size="sm">← All jobs</ButtonLink>
      </section>

      <Card className="w-full max-w-3xl">
        <CardHeader title="Edit job" />
        <CardBody>
          <JobForm
            job={{
              ...(job as unknown as import("@/types/database").Job),
            }}
          />
        </CardBody>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Applicants <span className="text-slate-400">({rows.length})</span>
        </h2>

        {rows.length === 0 ? (
          <EmptyState
            title="No applicants yet"
            description="Candidates who apply for this job will appear here."
          />
        ) : (
          rows.map((a) => (
            <Card key={a.id}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={a.profiles?.full_name ?? "C"} url={a.profiles?.avatar_url} size={44} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {a.profiles?.full_name ?? "Candidate"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {a.profiles?.position ? `${a.profiles.position} · ` : ""}
                        Applied {formatDate(a.applied_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={APPLICATION_STATUS_STYLES[a.status]?.className}>
                      {APPLICATION_STATUS_STYLES[a.status]?.label ?? a.status}
                    </Badge>
                    <ApplicationStatusSelect applicationId={a.id} status={a.status} />
                  </div>
                </div>
                {a.cover_note && (
                  <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                    “{a.cover_note}”
                  </p>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
