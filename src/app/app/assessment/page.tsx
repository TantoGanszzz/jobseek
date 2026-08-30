"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleAlert, ArrowRight, CircleCheck, Clock, ListChecks } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/demo/ui";
import { demoAssessments, type DemoAssessment } from "@/lib/demo/data";

function AssessmentCard({ assessment }: { assessment: DemoAssessment }) {
  const [started, setStarted] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={assessment.status === "selesai" ? "success" : "warning"}>
              {assessment.status === "selesai" ? (
                <>
                  <CircleCheck className="h-3.5 w-3.5" /> Selesai
                </>
              ) : (
                <>
                  <CircleAlert className="h-3.5 w-3.5" /> Belum Selesai
                </>
              )}
            </Badge>
            <Badge tone="slate">{assessment.category}</Badge>
          </div>
          <h3 className="mt-2.5 text-base font-bold text-slate-900">{assessment.title}</h3>
          <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {assessment.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" /> {assessment.questions} soal
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {assessment.status === "selesai" && assessment.score !== undefined ? (
            <>
              <span className="text-2xl font-extrabold tracking-tight text-cyan-600">
                {assessment.score}
                <span className="text-sm font-bold text-slate-400"> / {assessment.maxScore}</span>
              </span>
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700">
                {assessment.level}
              </span>
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-400">{assessment.level}</span>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        {assessment.status === "selesai" ? (
          <Link
            href={`/app/assessment/${assessment.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
          >
            Lihat Hasil Assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : started ? (
          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-cyan-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-bright" />
            </div>
            <p className="text-center text-xs font-semibold text-cyan-700">
              Pertanyaan 3 dari {assessment.questions}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-600"
          >
            Mulai Assessment
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

export default function AssessmentPage() {
  const done = demoAssessments.filter((a) => a.status === "selesai").length;
  const avg = Math.round(
    demoAssessments.filter((a) => a.score !== undefined).reduce((s, a) => s + a.score!, 0) /
      Math.max(1, done)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Saya"
        subtitle="Ukur kemampuanmu secara objektif dan buktikan ke perusahaan."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Selesai</p>
          <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{done}</p>
          <p className="mt-0.5 text-xs text-slate-400">assessment dikerjakan</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Rata-rata Skor</p>
          <p className="mt-1.5 text-2xl font-extrabold text-cyan-600">
            {avg}
            <span className="text-sm font-bold text-slate-400"> / 100</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">dari semua assessment</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Belum Selesai</p>
          <p className="mt-1.5 text-2xl font-extrabold text-slate-900">
            {demoAssessments.filter((a) => a.status === "belum").length}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">menunggu untuk dikerjakan</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {demoAssessments.map((a) => (
          <AssessmentCard key={a.id} assessment={a} />
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
        <span className="mt-0.5 text-violet-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18a3.5 3.5 0 10-3.5-3.5c0 .5.1 1 .3 1.4a2.9 2.9 0 01-3.9.4A6 6 0 0121 18h-4.5zM9 18.5a2.5 2.5 0 112.5-2.5c0 .4-.1.8-.3 1.1a2.9 2.9 0 012 1.4H9z" />
          </svg>
        </span>
        <div className="text-sm leading-relaxed text-slate-600">
          <p className="font-bold text-slate-900">Kenapa assessment penting?</p>
          <p className="mt-0.5">
            Skor assessment yang kuat bisa menaikkan match score kamu hingga{" "}
            <span className="font-semibold text-violet-700">+15%</span> di mata recruiter.
          </p>
        </div>
      </div>
    </div>
  );
}