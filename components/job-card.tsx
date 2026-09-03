"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveJob, unsaveJob } from "@/app/actions/jobs";
import {
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import type { Job } from "@/types/database.types";

interface JobCardProps {
  job: Job;
  initialSaved?: boolean;
  showSaveButton?: boolean;
  compact?: boolean;
}

export default function JobCard({
  job,
  initialSaved = false,
  showSaveButton = true,
  compact = false,
}: JobCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loadingSave, setLoadingSave] = useState(false);

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
      // Toggle anyway for graceful degradation
      setIsSaved(!isSaved);
    }
    setLoadingSave(false);
  }

  return (
    <div
      className={`bg-white rounded-xl border border-brand-border hover:shadow-lg hover:border-navy/20 transition-all duration-300 group ${
        compact ? "p-4" : "p-6"
      }`}
    >
      {/* Company header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`rounded-lg bg-navy/5 border border-brand-border flex items-center justify-center shrink-0 ${
            compact ? "h-9 w-9" : "h-11 w-11"
          }`}
        >
          <Briefcase
            className={`text-navy ${compact ? "h-4 w-4" : "h-5 w-5"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-navy group-hover:text-navy-light transition-colors truncate ${
              compact ? "text-sm" : ""
            }`}
          >
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {job.company?.name}
          </p>
        </div>
        {showSaveButton && (
          <button
            type="button"
            onClick={handleSave}
            disabled={loadingSave}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isSaved
                ? "text-navy bg-navy/5"
                : "text-muted-foreground hover:text-navy hover:bg-light-bg"
            }`}
            aria-label={isSaved ? "Hapus simpanan" : "Simpan pekerjaan"}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {job.job_type && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {job.job_type}
            </span>
          )}
          {job.salary_range && (
            <span className="font-medium text-navy text-xs">
              {job.salary_range}
            </span>
          )}
        </div>
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, compact ? 2 : 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs bg-light-bg text-navy rounded-md border border-brand-border font-medium"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > (compact ? 2 : 3) && (
            <span className="px-2 py-0.5 text-xs text-muted-foreground">
              +{job.skills.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      {!compact && (
        <Button
          size="sm"
          variant="outline"
          className="w-full border-brand-border text-navy hover:bg-navy hover:text-white font-medium cursor-pointer transition-all"
        >
          Lihat Detail
        </Button>
      )}
    </div>
  );
}
