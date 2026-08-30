"use client";

import Link from "next/link";
import { Bookmark, MapPin, ArrowRight, Check, Briefcase } from "lucide-react";
import { useState } from "react";
import type { DemoJob } from "@/lib/demo/data";
import { useBookmarks } from "@/lib/demo/useBookmarks";
import { cn } from "@/lib/utils/cn";
import { Avatar, Badge, MatchBadge, SkillTag } from "./ui";

function BookmarkButton({ jobId }: { jobId: string }) {
  const { saved, toggle } = useBookmarks();
  const active = saved.includes(jobId);
  return (
    <button
      type="button"
      aria-label={active ? "Hapus dari tersimpan" : "Simpan pekerjaan"}
      onClick={() => toggle(jobId)}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
        active
          ? "border-cyan-200 bg-cyan-50 text-cyan-600"
          : "border-line bg-white text-slate-400 hover:border-cyan-300 hover:text-cyan-600"
      )}
    >
      <Bookmark className="h-4 w-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}

export function JobCard({ job, variant = "grid" }: { job: DemoJob; variant?: "grid" | "list" }) {
  const [applied, setApplied] = useState(false);

  return (
    <div
      className={cn(
        "group flex flex-col rounded-card border border-line bg-surface shadow-card transition-all hover:border-cyan-200 hover:shadow-card-hover",
        variant === "list" ? "gap-4 p-5 sm:flex-row sm:items-start" : "gap-3 p-5"
      )}
    >
      <div className={cn("flex items-start gap-3.5", variant === "list" && "sm:min-w-0 sm:flex-1")}>
        <Avatar
          initials={job.initials}
          color={job.color}
          size={variant === "list" ? "lg" : "md"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/app/jobs/${job.id}`} className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-cyan-700">
                {job.title}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-slate-500">{job.company}</p>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <MatchBadge value={job.match} className="hidden sm:inline-flex" />
              <BookmarkButton jobId={job.id} />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location} · {job.workMode}
            </span>
            <span className="font-semibold text-slate-700">{job.salary}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <SkillTag key={s}>{s}</SkillTag>
            ))}
          </div>

          {variant === "grid" && (
            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/app/jobs/${job.id}`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
              >
                Lihat Detail
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setApplied(true)}
                disabled={applied}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                  applied
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-line bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-600"
                )}
              >
                {applied ? (
                  <>
                    <Check className="h-4 w-4" /> Terkirim
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4" /> Lamar
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {variant === "list" && (
        <div className="flex shrink-0 flex-col items-start justify-between gap-4 sm:w-44 sm:items-end">
          <MatchBadge value={job.match} className="sm:hidden" />
          <span className="hidden text-xs text-slate-400 sm:block">Dibuat {job.posted}</span>
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => setApplied(true)}
              disabled={applied}
              className={cn(
                "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                applied
                  ? "bg-green-100 text-green-700"
                  : "bg-cyan-500 text-white hover:bg-cyan-600"
              )}
            >
              {applied ? (
                <>
                  <Check className="h-4 w-4" /> Lamaran Terkirim
                </>
              ) : (
                "Lamar Sekarang"
              )}
            </button>
            <Link
              href={`/app/jobs/${job.id}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function JobMetaRow({ job }: { job: DemoJob }) {
  if (job.match >= 80) {
    return (
      <Badge tone="cyan" className="font-bold">
        {job.match}% cocok untukmu
      </Badge>
    );
  }
  return <Badge tone="slate">{job.posted}</Badge>;
}