import { Suspense } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { EmptyState, Skeleton } from "@/components/ui/DataDisplay";
import { createClient } from "@/lib/supabase/server";
import { queryPublishedJobs } from "@/lib/jobs/queries";

export const metadata = { title: "Find Jobs" };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function Results({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  let jobs: Awaited<ReturnType<typeof queryPublishedJobs>>["jobs"] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const result = await queryPublishedJobs(supabase, {
      search: first(sp.q),
      location: first(sp.location),
      employmentType: first(sp.type),
      salaryMin: Number(first(sp.salary)) || undefined,
      page: Number(first(sp.page)) || 1,
      perPage: 12,
    });
    jobs = result.jobs;
    total = result.total;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Please try again.";
  }

  if (loadError) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
        }
        title="Could not load jobs"
        description={loadError}
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-500" aria-live="polite">
        <span className="font-semibold text-slate-900">{total}</span> open roles
      </p>
      {jobs.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
          title="No matching jobs"
          description="Try different keywords or clear your filters."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}

export default async function FindJobsPage(props: Props) {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Find Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and filter all published openings.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Suspense fallback={<Skeleton className="h-[430px] w-full" />}>
            <JobFilters />
          </Suspense>
        </aside>
        <section>
          <Suspense fallback={<Skeleton className="h-[480px] w-full" />}>
            <Results {...props} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
