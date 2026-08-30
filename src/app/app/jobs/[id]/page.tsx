import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CircleCheck,
  Lightbulb,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import { Avatar, Card, MatchBadge, RingProgress, SkillTag } from "@/components/demo/ui";
import { demoJobs } from "@/lib/demo/data";

export const metadata = { title: "Detail Pekerjaan" };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = demoJobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/app/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-cyan-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Jobs
      </Link>

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar initials={job.initials} color={job.color} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {job.title}
                </h1>
                <MatchBadge value={job.match} />
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">{job.company}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location} · {job.workMode}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <Briefcase className="h-4 w-4" />
                  {job.salary}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Diposting {job.posted}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:w-48">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
            >
              Lamaran Sekarang
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Simpan
            </button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 xl:col-span-2">
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900">Deskripsi Pekerjaan</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              {job.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900">Tanggung Jawab</h2>
            <ul className="mt-3 space-y-2.5">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900">Requirements</h2>
            <ul className="mt-3 space-y-2.5">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <SkillTag key={s}>{s}</SkillTag>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900">Tentang Perusahaan</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{job.about}</p>
          </Card>
        </div>

        {/* Match sidebar */}
        <div className="space-y-5">
          <Card className="sticky top-24 p-6">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Match Kamu
              </p>
              <RingProgress value={job.match} size={128} stroke={11} sublabel="Match" />
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold text-slate-900">Kenapa cocok?</p>
              <ul className="mt-2.5 space-y-2">
                {job.matchReasons.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-slate-600">
                    <CircleCheck className="h-4 w-4 shrink-0 text-green-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <TriangleAlert className="h-4 w-4 text-amber-500" />
                Skill yang perlu ditingkatkan
              </p>
              <ul className="mt-2.5 space-y-2">
                {job.missingSkills.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                Tingkatkan skill ini lewat latihan untuk naikkan match score-mu.
              </div>
              <Link
                href="/app/latihan"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                Latihan Skill Ini
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}