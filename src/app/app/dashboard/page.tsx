import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  FolderKanban,
  Sparkles,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import { JobCard } from "@/components/demo/JobCard";
import {
  Card,
  PageHeader,
  ProgressBar,
  RingProgress,
  SectionHeader,
  StatCard,
} from "@/components/demo/ui";
import {
  careerReadiness,
  continueLearning,
  dashboardStats,
  demoActivities,
  demoJobs,
  nextBestAction,
  portfolioPromptItems,
  upcomingInterview,
} from "@/lib/demo/data";

const statIcons = {
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
};

const activityTone = {
  info: "bg-cyan-50 text-cyan-600",
  success: "bg-green-50 text-green-600",
  cyan: "bg-cyan-500 text-white",
};

export default function DashboardPage() {
  const recommended = demoJobs.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Hai, Andi Pratama!{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </>
        }
        subtitle="Semangat! Kamu selangkah lebih dekat dengan karier impianmu."
      />

      {/* Career readiness + next best action */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <RingProgress value={careerReadiness.score} sublabel="Ready" />
              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Career Readiness
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                  {careerReadiness.score} <span className="text-lg font-bold text-slate-400">/ 100</span>
                </p>
                <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-slate-500">
                  {careerReadiness.message}
                </p>
                <Link
                  href="/app/skill-profile"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
                >
                  <TrendingUp className="h-4 w-4" />
                  Tingkatkan Skor
                </Link>
              </div>
            </div>

            <div className="flex-1 space-y-3.5">
              {careerReadiness.breakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                  <ProgressBar value={item.value} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-50 blur-2xl"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Next Best Action
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
              <Target className="h-3.5 w-3.5" />
              Prioritas
            </span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
            {nextBestAction.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {nextBestAction.description}
          </p>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Interview Readiness</span>
              <span className="font-bold text-slate-900">{nextBestAction.score}%</span>
            </div>
            <ProgressBar value={nextBestAction.score} />
          </div>
          <Link
            href={nextBestAction.href}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            {nextBestAction.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            href={stat.href}
            icon={statIcons[stat.key as keyof typeof statIcons]}
          />
        ))}
      </div>

      {/* Recommended jobs + side column */}
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section>
            <SectionHeader
              title="Rekomendasi Pekerjaan Untukmu"
              action={
                <Link
                  href="/app/jobs"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Lihat Semua
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>

          {/* Continue learning */}
          <section>
            <SectionHeader
              title="Lanjutkan Latihanmu"
              action={
                <Link
                  href="/app/latihan"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Semua Latihan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <Card className="divide-y divide-line">
              {continueLearning.map((t) => (
                <Link
                  key={t.id}
                  href="/app/latihan"
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-cyan-600">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">{t.title}</p>
                      <span className="text-sm font-extrabold text-cyan-600">
                        {t.progress}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={t.progress} />
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              ))}
            </Card>
          </section>

          {/* Portfolio prompt */}
          <Card className="flex flex-col gap-4 bg-gradient-to-br from-cyan-600 via-cyan-700 to-slate-900 p-6 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                <FolderKanban className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  Tingkatkan Portfolio-mu
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-cyan-100">
                  Tambahkan project untuk memperkuat bukti kemampuanmu.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-cyan-50">
                  {portfolioPromptItems.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CircleCheck className="h-4 w-4 shrink-0 text-cyan-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href="/app/portfolio"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-50"
            >
              Buat Portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Upcoming interview */}
          <section>
            <SectionHeader title="Interview Mendatang" />
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-sm font-extrabold leading-none text-cyan-700">
                  <span className="text-center">
                    24
                    <span className="block text-[10px] font-bold">MEI</span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                  <Video className="h-3.5 w-3.5" />
                  Online
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {upcomingInterview.title}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">{upcomingInterview.company}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {upcomingInterview.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" />
                  {upcomingInterview.mode}
                </span>
              </div>
              <Link
                href="/app/assessment"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
              >
                Persiapkan Interview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </section>

          {/* Recent activity */}
          <section>
            <SectionHeader title="Aktivitas Terbaru" />
            <Card className="divide-y divide-line">
              {demoActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    className={
                      "mt-0.5 inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full " +
                      activityTone[a.tone as keyof typeof activityTone]
                    }
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-slate-700">{a.text}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}