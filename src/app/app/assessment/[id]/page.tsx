import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleCheck, GraduationCap, TriangleAlert } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, ProgressBar, RingProgress, SectionHeader } from "@/components/demo/ui";
import { demoAssessments } from "@/lib/demo/data";

export const metadata = { title: "Hasil Assessment" };

export default async function AssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = demoAssessments.find((a) => a.id === id);
  if (!assessment) notFound();

  if (assessment.status !== "selesai" || assessment.score === undefined) {
    return (
      <div className="space-y-5">
        <Link
          href="/app/assessment"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-cyan-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Assessment
        </Link>
        <EmptyState
          title="Assessment belum dikerjakan"
          description="Selesaikan assessment ini untuk melihat hasil dan rekomendasi skill-mu."
          action={
            <Link
              href="/app/assessment"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-600"
            >
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  const hasDetail = Boolean(assessment.categories?.length);

  return (
    <div className="space-y-5">
      <Link
        href="/app/assessment"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-cyan-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Assessment
      </Link>

      <PageHeader
        title="Hasil Assessment"
        subtitle={assessment.title}
        actions={<Badge tone="success">Selesai</Badge>}
      />

      {/* Overall */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <RingProgress value={assessment.score} size={160} stroke={14} sublabel="Skor Akhir" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="cyan">{assessment.level}</Badge>
              <Badge tone="slate">{assessment.category}</Badge>
            </div>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
              {assessment.score} / {assessment.maxScore}
            </h2>
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-500">
              Kamu berada di level {assessment.level.toLowerCase()} untuk{" "}
              {assessment.category.toLowerCase()}. Skill-mu sudah cukup kuat untuk
              kategori frontend. Terus latih bagian yang masih lemah untuk naik ke level Expert.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/app/latihan"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <GraduationCap className="h-4 w-4" />
                Latihan Skill
              </Link>
              <Link
                href="/app/portfolio"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
              >
                Buktikan di Portfolio
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {hasDetail && assessment.categories && (
        <Card className="p-6">
          <SectionHeader title="Pembagian Skor per Kategori" />
          <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {assessment.categories.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{c.name}</span>
                  <span className="font-extrabold text-slate-900">
                    {c.score}
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </span>
                </div>
                <ProgressBar value={c.score} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {assessment.strengths && assessment.gaps && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <CircleCheck className="h-5 w-5 text-green-500" />
              Kekuatan Skill
            </h3>
            <ul className="mt-3 space-y-2">
              {assessment.strengths.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                  <CircleCheck className="h-4 w-4 shrink-0 text-green-500" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <TriangleAlert className="h-5 w-5 text-amber-500" />
              Skill Gap
            </h3>
            <ul className="mt-3 space-y-2">
              {assessment.gaps.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                  <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
            <Link
              href="/app/latihan"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-600"
            >
              Latihan Skill
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 text-sm leading-relaxed text-slate-600">
        <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
        <p>
          <span className="font-bold text-slate-900">Rekomendasi JobSeek: </span>
          Hasil assessment ini akan otomatis memperkuat skill profile kamu. Melamar ke
          pekerjaan yang skill-nya cocok akan menaikkan peluang dipanggil interview.
        </p>
      </div>
    </div>
  );
}