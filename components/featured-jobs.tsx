import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockJobs } from "@/lib/mock-data";
import { MapPin, Clock, Briefcase, ArrowRight } from "lucide-react";

interface FeaturedJobsProps {
  isLoggedIn?: boolean;
}

export default function FeaturedJobs({ isLoggedIn = false }: FeaturedJobsProps) {
  const jobs = mockJobs.slice(0, 6);

  return (
    <section className="bg-light-bg py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
              Featured Jobs
            </h2>
            <p className="mt-2 text-muted-foreground text-lg">
              Pekerjaan terbaru yang sesuai dengan skill Anda.
            </p>
          </div>
          <Link
            href={isLoggedIn ? "/dashboard/find-jobs" : "/find-jobs"}
            className="text-navy font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Job Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-brand-border p-6 hover:shadow-lg hover:border-navy/20 transition-all duration-300 group"
            >
              {/* Company */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-navy/5 border border-brand-border flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy group-hover:text-navy-light transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {job.job_type}
                  </span>
                  {job.salary_range && (
                    <span className="font-medium text-navy text-xs">
                      {job.salary_range}
                    </span>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {job.skills?.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 text-xs bg-light-bg text-navy rounded-md border border-brand-border font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action */}
              <Link href={isLoggedIn ? "/dashboard/find-jobs" : "/login"}>
                <Button
                  variant="outline"
                  className="w-full border-navy/20 text-navy hover:bg-navy hover:text-white font-medium transition-all duration-300 cursor-pointer"
                >
                  View Job
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
