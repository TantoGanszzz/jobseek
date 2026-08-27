"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockJobs } from "@/lib/mock-data";
import { applyToJob, saveJob } from "@/app/actions/jobs";
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Filter,
  DollarSign,
  Wifi,
  CheckCircle2,
} from "lucide-react";

export default function DashboardFindJobsClient() {
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [loadingApply, setLoadingApply] = useState<string | null>(null);
  const [loadingSave, setLoadingSave] = useState<string | null>(null);

  const jobs = mockJobs;

  async function handleApply(jobId: string) {
    setLoadingApply(jobId);
    try {
      const result = await applyToJob(jobId);
      if (!result?.error) {
        setAppliedJobs((prev) => new Set([...prev, jobId]));
      }
    } catch {
      // Supabase might not be configured — still update UI for demo
      setAppliedJobs((prev) => new Set([...prev, jobId]));
    }
    setLoadingApply(null);
  }

  async function handleSave(jobId: string) {
    setLoadingSave(jobId);
    try {
      if (savedJobs.has(jobId)) {
        setSavedJobs((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await saveJob(jobId);
        setSavedJobs((prev) => new Set([...prev, jobId]));
      }
    } catch {
      // Toggle anyway for demo
      setSavedJobs((prev) => {
        const next = new Set(prev);
        if (next.has(jobId)) next.delete(jobId);
        else next.add(jobId);
        return next;
      });
    }
    setLoadingSave(null);
  }

  return (
    <div className="bg-light-bg min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">
            Find Jobs
          </h1>
          <p className="mt-2 text-muted-foreground">
            Cari dan lamar pekerjaan yang sesuai dengan skill Anda.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-2xl border border-brand-border mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, skills, or companies"
              className="pl-10 h-12 bg-light-bg border-brand-border focus:border-navy rounded-xl"
            />
          </div>
          <div className="relative flex-1 sm:max-w-[220px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Location"
              className="pl-10 h-12 bg-light-bg border-brand-border focus:border-navy rounded-xl"
            />
          </div>
          <Button
            size="lg"
            className="bg-navy text-white hover:bg-navy-light font-medium h-12 px-8 rounded-xl cursor-pointer"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { icon: Briefcase, label: "Job Type" },
            { icon: Clock, label: "Experience" },
            { icon: MapPin, label: "Location" },
            { icon: Wifi, label: "Remote" },
            { icon: DollarSign, label: "Salary" },
          ].map((filter) => (
            <button
              key={filter.label}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-navy/70 bg-white border border-brand-border rounded-full hover:border-navy/30 hover:text-navy transition-colors cursor-pointer"
            >
              <filter.icon className="h-3.5 w-3.5" />
              {filter.label}
              <Filter className="h-3 w-3 opacity-50" />
            </button>
          ))}
        </div>

        {/* Job Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const isApplied = appliedJobs.has(job.id);
            const isSaved = savedJobs.has(job.id);

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-brand-border p-6 hover:shadow-lg hover:border-navy/20 transition-all duration-300 group relative"
              >
                {/* Applied Badge */}
                {isApplied && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Applied
                  </div>
                )}

                {/* Company */}
                <div className="flex items-start gap-3 mb-4">
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

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied || loadingApply === job.id}
                    className={`flex-1 font-medium cursor-pointer transition-all duration-300 ${
                      isApplied
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                        : "bg-navy text-white hover:bg-navy-light"
                    }`}
                  >
                    {loadingApply === job.id
                      ? "Applying..."
                      : isApplied
                      ? "Applied"
                      : "Apply Now"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSave(job.id)}
                    disabled={loadingSave === job.id}
                    className={`border-brand-border cursor-pointer transition-all duration-300 ${
                      isSaved
                        ? "bg-navy/5 border-navy/20 text-navy"
                        : "text-muted-foreground hover:text-navy"
                    }`}
                    aria-label={isSaved ? "Unsave job" : "Save job"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
