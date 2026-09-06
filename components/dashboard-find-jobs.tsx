"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveJob, unsaveJob } from "@/app/actions/jobs";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  X,
  Building2,
  LayoutDashboard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { CandidateJob } from "@/lib/hrd/services";

interface DashboardFindJobsClientProps {
  jobs: CandidateJob[];
  savedJobIds: string[];
  profileComplete: boolean;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const WORK_MODES = ["On-site", "Hybrid", "Remote"];
const EXPERIENCE_LEVELS = ["Entry-level", "Junior", "Mid-level", "Senior"];
const SALARY_TIERS = [
  { label: "Any salary", min: 0 },
  { label: "Rp 5 Jt+", min: 5 },
  { label: "Rp 10 Jt+", min: 10 },
  { label: "Rp 15 Jt+", min: 15 },
];

type SortKey = "recommended" | "newest" | "nearest" | "salary";

// Extract the lower bound of "Rp 5 - 8 Juta" in millions of Rupiah.
function salaryMinMillion(salaryRange: string | null): number | null {
  if (!salaryRange) return null;
  const numbers = salaryRange.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length === 0) return null;
  const base = Math.min(...numbers);
  const lower = salaryRange.toLowerCase();
  let million = base;
  if (lower.includes("juta") || lower.includes("jt") || lower.includes("mil")) {
    million = base;
  } else {
    million = base / 1000000;
  }
  return Math.round(million);
}

function MatchScore({ score }: { score: number }) {
  const tone = score >= 70 ? "text-emerald-700" : score >= 40 ? "text-blue-700" : "text-slate-500";
  return <span className={`font-semibold ${tone}`}>{score}% Match</span>;
}

function JobResult({
  item,
  initialSaved,
}: {
  item: CandidateJob;
  initialSaved: boolean;
}) {
  const { job, applicant, match } = item;
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loadingSave, setLoadingSave] = useState(false);
  const isApplied = !!applicant;

  async function handleSave() {
    setLoadingSave(true);
    try {
      if (isSaved) {
        await unsaveJob(job.id);
        setIsSaved(false);
      } else {
        await saveJob(job.id);
        setIsSaved(true);
      }
    } catch {
      setIsSaved(!isSaved);
    }
    setLoadingSave(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/jobs/${job.id}`} className="font-semibold text-slate-900 hover:text-blue-700">
              {job.title}
            </Link>
            <MatchScore score={match.overall} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            {job.companyName}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={loadingSave || isApplied}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            isApplied
              ? "text-slate-300 cursor-default"
              : isSaved
                ? "text-blue-700 bg-blue-50"
                : "text-slate-400 hover:text-blue-700 hover:bg-blue-50"
          }`}
          aria-label={isSaved ? "Remove from saved" : "Save job"}
        >
          {isApplied ? (
            <LayoutDashboard className="h-4 w-4" />
          ) : isSaved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {job.location && (
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
        )}
        {job.workMode && <span className="font-medium text-slate-600">{job.workMode}</span>}
        {job.jobType && (
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.jobType}</span>
        )}
        {job.experienceLevel && <span>{job.experienceLevel}</span>}
        {job.salaryRange && <span className="font-medium text-slate-700">{job.salaryRange}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.map((skill) => {
          const matched = match.matchedSkills.includes(skill);
          return (
            <span
              key={skill}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border ${
                matched
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              {matched && <CheckCircle2 className="h-3 w-3" />}
              {skill}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {job.skills.length > 0 && (
            <span>
              Skills: <span className="font-medium text-slate-700">{match.matchedSkills.length} / {job.skills.length}</span>
            </span>
          )}
          {match.locationScore != null && <span>Location: {match.locationScore}%</span>}
          {job.deadline && <span>Closes {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
        </div>
        <div className="flex gap-3">
          {isApplied ? (
            <Link
              href={`/dashboard/applications/${applicant!.id}`}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Applied — View
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="text-xs font-medium text-slate-500 hover:text-blue-700 cursor-pointer"
            >
              Save
            </button>
          )}
          <Link href={`/dashboard/jobs/${job.id}`} className="text-xs font-medium text-blue-700 hover:text-blue-800">
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardFindJobsClient({
  jobs,
  savedJobIds,
  profileComplete,
}: DashboardFindJobsClientProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [selectedSalary, setSelectedSalary] = useState<number>(0);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const savedSet = useMemo(() => new Set(savedJobIds), [savedJobIds]);

  const recommended = useMemo(
    () =>
      jobs
        .filter(({ applicant, match }) => !applicant && match.matchedSkills.length > 0)
        .sort(
          (a, b) =>
            b.match.overall - a.match.overall ||
            b.match.matchedSkills.length - a.match.matchedSkills.length ||
            b.job.createdAt.localeCompare(a.job.createdAt)
        )
        .slice(0, 3),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const list = jobs.filter(({ job }) => {
      const kw = keyword.trim().toLowerCase();
      if (kw) {
        const matchTitle = job.title.toLowerCase().includes(kw);
        const matchCompany = job.companyName.toLowerCase().includes(kw);
        const matchSkills = job.skills.some((s) => s.toLowerCase().includes(kw));
        const matchLocationPart = job.location?.toLowerCase().includes(kw);
        if (!matchTitle && !matchCompany && !matchSkills && !matchLocationPart) return false;
      }
      if (location.trim()) {
        const loc = location.trim().toLowerCase();
        if (!job.location?.toLowerCase().includes(loc)) return false;
      }
      if (selectedJobType && job.jobType !== selectedJobType) return false;
      if (selectedWorkMode && job.workMode !== selectedWorkMode) return false;
      if (selectedExperience && job.experienceLevel !== selectedExperience) return false;
      if (selectedSalary > 0) {
        const min = salaryMinMillion(job.salaryRange);
        if (min == null || min < selectedSalary) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => b.job.createdAt.localeCompare(a.job.createdAt));
        break;
      case "salary":
        sorted.sort((a, b) => (salaryMinMillion(b.job.salaryRange) ?? 0) - (salaryMinMillion(a.job.salaryRange) ?? 0));
        break;
      case "nearest":
        sorted.sort(
          (a, b) =>
            (b.match.locationScore ?? 0) - (a.match.locationScore ?? 0) ||
            b.match.overall - a.match.overall
        );
        break;
      default:
        sorted.sort(
          (a, b) => b.match.overall - a.match.overall || b.job.createdAt.localeCompare(a.job.createdAt)
        );
    }
    return sorted;
  }, [jobs, keyword, location, selectedJobType, selectedWorkMode, selectedExperience, selectedSalary, sort]);

  const hasActiveFilters = !!selectedJobType || !!selectedWorkMode || !!selectedExperience || selectedSalary > 0;

  function clearFilters() {
    setSelectedJobType(null);
    setSelectedWorkMode(null);
    setSelectedExperience(null);
    setSelectedSalary(0);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Find Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discover opportunities that match your skills and career goals.
        </p>
      </div>

      {!profileComplete && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Complete your profile to get better job recommendations.</p>
              <p className="text-xs text-amber-700">Add your skills, location, and education so the matching engine can rank jobs for you.</p>
            </div>
          </div>
          <Link href="/dashboard/profile/edit">
            <Button size="sm" className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {recommended.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-blue-600" /> Recommended for You
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recommended.map((item) => (
              <div key={item.job.id} className="rounded-xl border border-blue-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/dashboard/jobs/${item.job.id}`} className="font-semibold text-slate-900 hover:text-blue-700">
                      {item.job.title}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" /> {item.job.companyName}
                    </p>
                  </div>
                  <MatchScore score={item.match.overall} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {[item.job.location, item.job.workMode, item.job.jobType].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.match.matchedSkills.slice(0, 3).map((skill) => (
                    <span key={skill} className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">
                    {item.match.matchedSkills.length}/{item.job.skills.length} skills
                  </span>
                  <Link href={`/dashboard/jobs/${item.job.id}`} className="text-xs font-medium text-blue-700 hover:text-blue-800">
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 h-11 border-slate-200 focus:border-blue-500"
          />
        </div>
        <div className="relative sm:w-56">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 h-11 border-slate-200 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="newest">Sort: Newest</option>
            <option value="nearest">Sort: Nearest</option>
            <option value="salary">Sort: Salary</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="h-11 px-4 border-slate-200 text-slate-700 cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className={`mb-6 space-y-4 ${showFilters ? "" : "hidden sm:block"}`}>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Employment Type</p>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedJobType(selectedJobType === type ? null : type)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                  selectedJobType === type
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-slate-600 bg-white border-slate-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Work Mode</p>
          <div className="flex flex-wrap gap-2">
            {WORK_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedWorkMode(selectedWorkMode === mode ? null : mode)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                  selectedWorkMode === mode
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-slate-600 bg-white border-slate-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Experience</p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedExperience(selectedExperience === level ? null : level)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                  selectedExperience === level
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-slate-600 bg-white border-slate-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Salary (minimum)</p>
          <div className="flex flex-wrap gap-2">
            {SALARY_TIERS.map((tier) => (
              <button
                key={tier.min}
                onClick={() => setSelectedSalary(selectedSalary === tier.min ? 0 : tier.min)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer ${
                  selectedSalary === tier.min
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-slate-600 bg-white border-slate-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-500">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredJobs.map((item) => (
            <JobResult key={item.job.id} item={item} initialSaved={savedSet.has(item.job.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No jobs match your search.</p>
          <p className="text-sm text-slate-400 mt-1">
            {jobs.length === 0
              ? "No jobs available yet. Companies haven't published any opportunities yet."
              : "Try adjusting your keywords or filters."}
          </p>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
              className="mt-4 border-slate-200 text-slate-700 cursor-pointer"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
