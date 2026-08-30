import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/layout/PublicChrome";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { EmptyState, Skeleton } from "@/components/ui/DataDisplay";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/server";
import { queryPublishedJobs } from "@/lib/jobs/queries";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Find Jobs",
  description: "Browse published job openings on JobSeek.",
};

interface JobsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function JobResults({ searchParams }: JobsPageProps) {
  const sp = await searchParams;
  const q = first(sp.q);
  const location = first(sp.location);
  const type = first(sp.type);
  const salary = Number(first(sp.salary));
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const perPage = 9;

  const supabase = await createClient();
  let jobs: Awaited<ReturnType<typeof queryPublishedJobs>>["jobs"] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const result = await queryPublishedJobs(supabase, {
      search: q,
      location,
      employmentType: type,
      salaryMin: salary > 0 ? salary : undefined,
      page,
      perPage,
    });
    jobs = result.jobs;
    total = result.total;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load jobs.";
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function pageHref(p: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (salary > 0) params.set("salary", String(salary));
    if (p > 1) params.set("page", String(p));
    return `/jobs${params.toString() ? `?${params}` : ""}`;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Suspense fallback={<Skeleton className="h-[430px] w-full" />}>
          <JobFilters />
        </Suspense>
      </aside>

      <section>
        {!error && (
          <p className="mb-4 text-sm text-slate-500" aria-live="polite">
            Showing{" "}
            <span className="font-semibold text-slate-900">{jobs.length}</span>{" "}
            of <span className="font-semibold text-slate-900">{total}</span>{" "}
            jobs
          </p>
        )}

        {error && (
          <EmptyState
            icon={<Icon name="search" className="h-6 w-6" />}
            title="Something went wrong"
            description={error}
          />
        )}

        {!error && jobs.length === 0 && (
          <EmptyState
            icon={<Icon name="briefcase" className="h-6 w-6" />}
            title="No jobs found"
            description="Try adjusting your filters or check back later — new jobs are posted regularly."
            action={
              <ButtonLink href="/jobs" variant="outline" size="sm">
                Clear all filters
              </ButtonLink>
            }
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:border-cyan-400 hover:text-cyan-700"
              >
                ← Previous
              </Link>
            )}
            <span className="rounded-lg bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:border-cyan-400 hover:text-cyan-700"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}

export default async function JobsPage(props: JobsPageProps) {
  const user = await getCurrentUser();

  return (
    <>
      <PublicHeader userName={user?.profile.full_name} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Find your next job
          </h1>
          <p className="mt-1.5 text-slate-500">
            Browse open roles from companies hiring right now.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-[480px] w-full" />}>
          <JobResults {...props} />
        </Suspense>
      </main>
      <PublicFooter />
    </>
  );
}
