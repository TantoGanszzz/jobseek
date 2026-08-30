import { PublicHeader, PublicFooter } from "@/components/layout/PublicChrome";
import { JobCard } from "@/components/jobs/JobCard";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/server";
import { queryPublishedJobs } from "@/lib/jobs/queries";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  let featuredJobs: Awaited<ReturnType<typeof queryPublishedJobs>>["jobs"] = [];
  try {
    const result = await queryPublishedJobs(supabase, { perPage: 6 });
    featuredJobs = result.jobs;
  } catch {
    featuredJobs = [];
  }

  return (
    <>
      <PublicHeader userName={user?.profile.full_name} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl"
          />
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              <Icon name="briefcase" className="h-3.5 w-3.5" />
              Connecting talent with opportunity
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find your next{" "}
              <span className="text-cyan-600">dream job</span> today
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
              JobSeek brings job seekers and companies together. One profile,
              thousands of opportunities, zero hassle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/app/jobs" size="lg" className="w-full sm:w-auto">
                Browse jobs
              </ButtonLink>
              {!user && (
                <ButtonLink href="/register" variant="outline" size="lg" className="w-full sm:w-auto">
                  Create free account
                </ButtonLink>
              )}
              {user && (
                <ButtonLink
                  href={
                    user.profile.role === "admin"
                      ? "/admin/dashboard"
                      : user.profile.role === "hrd"
                        ? "/hrd/dashboard"
                        : "/app/dashboard"
                  }
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Go to dashboard
                </ButtonLink>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your profile",
                desc: "Sign up in seconds, add your skills, experience, and CV.",
                icon: "user",
              },
              {
                step: "02",
                title: "Apply to jobs",
                desc: "Search curated listings and apply with a single click.",
                icon: "document",
              },
              {
                step: "03",
                title: "Track applications",
                desc: "Follow every status change from review to offer.",
                icon: "chart",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-cyan-100">{item.step}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured jobs */}
        {featuredJobs.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Latest openings
                  </h2>
                  <p className="mt-1.5 text-slate-500">
                    Fresh roles posted by companies on JobSeek.
                  </p>
                </div>
                <ButtonLink href="/app/jobs" variant="subtle" size="sm" className="hidden sm:inline-flex">
                  View all jobs →
                </ButtonLink>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <ButtonLink href="/app/jobs" variant="subtle" size="sm">
                  View all jobs →
                </ButtonLink>
              </div>
            </div>
          </section>
        )}

        {/* For companies CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-cyan-700 to-slate-900 px-8 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Are you hiring?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-cyan-100">
              Post your openings, manage applicants, and move candidates through
              every hiring stage — all from one dashboard.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/register"
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20 hover:text-white sm:w-auto"
              >
                Register as HRD
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
