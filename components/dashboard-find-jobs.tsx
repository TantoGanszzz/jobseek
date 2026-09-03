"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockJobs } from "@/lib/mock-data";
import JobCard from "@/components/job-card";
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Wifi,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Job } from "@/types/database.types";

interface DashboardFindJobsClientProps {
  initialJobs: Job[];
  initialSavedJobIds: string[];
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const EXPERIENCE_LEVELS = ["Entry-level", "Junior", "Mid-level", "Senior"];
const WORK_MODES = ["On-site", "Remote", "Hybrid"];

export default function DashboardFindJobsClient({
  initialJobs,
  initialSavedJobIds,
}: DashboardFindJobsClientProps) {
  // Use Supabase jobs if available, fall back to mock data
  const allJobs = initialJobs.length > 0 ? initialJobs : mockJobs;

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const savedSet = useMemo(() => new Set(initialSavedJobIds), [initialSavedJobIds]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // Keyword filter
      if (keyword) {
        const kw = keyword.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(kw);
        const matchCompany = job.company?.name?.toLowerCase().includes(kw);
        const matchSkills = job.skills?.some((s) =>
          s.toLowerCase().includes(kw)
        );
        if (!matchTitle && !matchCompany && !matchSkills) return false;
      }

      // Location filter
      if (location) {
        const loc = location.toLowerCase();
        if (!job.location?.toLowerCase().includes(loc)) return false;
      }

      // Job type filter
      if (selectedJobType && job.job_type !== selectedJobType) return false;

      // Experience filter
      if (selectedExperience && job.experience_level !== selectedExperience)
        return false;

      // Work mode filter
      if (selectedWorkMode) {
        if (selectedWorkMode === "Remote" && job.job_type !== "Remote") return false;
        if (selectedWorkMode === "On-site" && job.job_type === "Remote") return false;
      }

      return true;
    });
  }, [allJobs, keyword, location, selectedJobType, selectedExperience, selectedWorkMode]);

  const hasActiveFilters =
    selectedJobType || selectedExperience || selectedWorkMode;

  function clearFilters() {
    setSelectedJobType(null);
    setSelectedExperience(null);
    setSelectedWorkMode(null);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
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
            placeholder="Cari posisi, skill, atau perusahaan..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 h-12 bg-light-bg border-brand-border focus:border-navy rounded-xl"
          />
        </div>
        <div className="relative flex-1 sm:max-w-[220px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Lokasi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 h-12 bg-light-bg border-brand-border focus:border-navy rounded-xl"
          />
        </div>
        <Button
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="h-12 px-4 rounded-xl border-brand-border text-navy cursor-pointer sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-2 mb-6 ${showFilters ? "" : "hidden sm:flex"}`}>
        {/* Job Type */}
        {JOB_TYPES.map((type) => (
          <button
            key={type}
            onClick={() =>
              setSelectedJobType(selectedJobType === type ? null : type)
            }
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
              selectedJobType === type
                ? "bg-navy text-white"
                : "text-navy/70 bg-white border border-brand-border hover:border-navy/30 hover:text-navy"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            {type}
          </button>
        ))}

        <div className="w-px h-8 bg-brand-border hidden sm:block self-center" />

        {/* Experience */}
        {EXPERIENCE_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() =>
              setSelectedExperience(selectedExperience === level ? null : level)
            }
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
              selectedExperience === level
                ? "bg-navy text-white"
                : "text-navy/70 bg-white border border-brand-border hover:border-navy/30 hover:text-navy"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {level}
          </button>
        ))}

        <div className="w-px h-8 bg-brand-border hidden sm:block self-center" />

        {/* Work Mode */}
        {WORK_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() =>
              setSelectedWorkMode(selectedWorkMode === mode ? null : mode)
            }
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
              selectedWorkMode === mode
                ? "bg-navy text-white"
                : "text-navy/70 bg-white border border-brand-border hover:border-navy/30 hover:text-navy"
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            {mode}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Hapus Filter
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredJobs.length} pekerjaan ditemukan
          {initialJobs.length === 0 && (
            <span className="text-amber-600 ml-1">(data contoh)</span>
          )}
        </p>
      </div>

      {/* Job Cards */}
      {filteredJobs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              initialSaved={savedSet.has(job.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-border p-12 text-center">
          <Search className="h-12 w-12 text-navy/15 mx-auto mb-3" />
          <p className="text-muted-foreground mb-1">
            Tidak ada pekerjaan yang cocok dengan pencarian Anda.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Coba ubah kata kunci atau filter pencarian.
          </p>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
              className="mt-4 border-brand-border text-navy cursor-pointer"
            >
              Hapus Semua Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
