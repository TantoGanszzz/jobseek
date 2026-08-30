import { CvManager } from "@/components/dashboard/CvManager";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "My CV" };

export default async function CvPage() {
  const user = await requireRole("job_seeker");

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My CV</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload your latest CV. It&apos;s attached automatically when you apply
          for jobs.
        </p>
      </section>
      <CvManager cvPath={user.profile.cv_url} />
    </div>
  );
}
