"use client";

import { useState } from "react";
import { CircleCheck, Download, Eye, FileText, Pencil, RefreshCw, Upload, X } from "lucide-react";
import { Card, PageHeader, ProgressBar, RingProgress } from "@/components/demo/ui";
import { demoResumes, resumeAnalysis, type DemoResume } from "@/lib/demo/data";

function EmptyCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PreviewModal({ resume, onClose }: { resume: DemoResume; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            <p className="font-bold text-slate-900">{resume.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="rounded-xl border border-line bg-slate-50 p-6">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-base font-extrabold text-white">AP</span>
              <div>
                <p className="text-lg font-extrabold text-slate-900">Andi Pratama</p>
                <p className="text-sm text-slate-500">{resume.role}</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 text-sm text-slate-600">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ringkasan</p>
                <p className="mt-1 leading-relaxed">
                  Frontend developer dengan 3+ tahun pengalaman membangun aplikasi
                  web dengan React dan JavaScript.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pengalaman</p>
                <p className="mt-1 font-semibold text-slate-800">Frontend Developer — PT Digital Nusantara</p>
                <p className="text-xs text-slate-400">2023 - Sekarang</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-line px-5 py-3 text-center text-xs text-slate-400">
          Pratinjau {resume.title}
        </div>
      </div>
    </div>
  );
}

function ResumeCard({ resume }: { resume: DemoResume }) {
  const [preview, setPreview] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <FileText className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">{resume.title}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{resume.role}</p>
            <p className="mt-1.5 text-xs text-slate-400">
              Diperbarui {resume.updated} · Terakhir diedit {resume.last} · {resume.pages} halaman
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPreview(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setDownloaded(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
        >
          <Download className="h-4 w-4" />
          {downloaded ? "Diunduh ✓" : "Download"}
        </button>
      </div>
      {preview && <PreviewModal resume={resume} onClose={() => setPreview(false)} />}
    </Card>
  );
}

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Resume"
        subtitle="Kelola CV kamu dan pastikan selalu terbarukan dan sesuai posisi yang dituju."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
          >
            <Upload className="h-4 w-4" />
            Upload CV
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {demoResumes.map((r) => (
            <ResumeCard key={r.id} resume={r} />
          ))}
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <RefreshCw className="h-5 w-5" />
              </span>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">Kiat:</span> sesuaikan CV
                dengan kata kunci pada deskripsi pekerjaan untuk melewati AI Screening.
              </p>
            </div>
          </Card>
        </div>

        {/* Analysis */}
        <Card className="h-fit p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Resume Analysis
          </p>
          <div className="mt-4 flex items-center gap-4">
            <RingProgress value={resumeAnalysis.score} size={104} stroke={10} sublabel="Skor" />
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{resumeAnalysis.score}</p>
              <p className="text-sm text-slate-400">/ 100</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {resumeAnalysis.description}
          </p>

          <div className="mt-5 space-y-3 border-t border-line pt-4">
            <p className="text-sm font-bold text-slate-900">Sudah baik</p>
            {resumeAnalysis.strengths.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-slate-600">
                <CircleCheck className="h-4 w-4 shrink-0 text-green-500" />
                {s}
              </div>
            ))}
            <p className="pt-2 text-sm font-bold text-slate-900">Bisa ditingkatkan</p>
            {resumeAnalysis.suggestions.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-slate-600">
                <EmptyCheck />
                {s}
              </div>
            ))}
            <div className="pt-1">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Kecocokan dengan target</span>
                <span className="font-extrabold text-cyan-600">84%</span>
              </div>
              <ProgressBar value={84} />
            </div>
          </div>

          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Analisis Ulang
          </button>
        </Card>
      </div>
    </div>
  );
}