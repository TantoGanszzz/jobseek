import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  Flag,
  Lightbulb,
  Target,
  TriangleAlert,
} from "lucide-react";
import { Badge, Card, PageHeader, ProgressBar, RingProgress, SectionHeader } from "@/components/demo/ui";
import { careerPlan } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

const stageStyle = {
  done: { dot: "bg-cyan-500 ring-cyan-100", text: "text-slate-700 font-medium", label: null },
  current: { dot: "bg-cyan-600 ring-cyan-200", text: "font-bold text-cyan-700", label: "Saat Ini" },
  next: { dot: "bg-amber-500 ring-amber-100", text: "text-slate-600 font-medium", label: "Berikutnya" },
  later: { dot: "bg-slate-200 ring-slate-50", text: "text-slate-400", label: null },
} as const;

export default function CareerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Karier"
        subtitle="Rencanakan langkah kariermu dengan jelas dan tahu persis apa yang perlu dipelajari."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Current goal */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Tujuan Kariermu
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
              <Flag className="h-3.5 w-3.5" />
              Aktif
            </span>
          </div>
          <div className="mt-4 flex items-center gap-5">
            <RingProgress value={careerPlan.match} size={108} stroke={10} sublabel="Match" />
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                {careerPlan.goal}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Career Match dengan target-mu</p>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Career Readiness</span>
              <span className="font-extrabold text-slate-900">{careerPlan.readiness}%</span>
            </div>
            <ProgressBar value={careerPlan.readiness} />
            <Link
              href="/app/skill-profile"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
            >
              Tinjau Skill Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        {/* Roadmap */}
        <Card className="p-6 lg:col-span-2">
          <SectionHeader
            title="Career Roadmap"
            action={<Badge tone="violet">4 tahap</Badge>}
          />
          <div className="flex flex-col gap-0">
            {careerPlan.roadmap.map((step, i) => {
              const style = stageStyle[step.status as keyof typeof stageStyle];
              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn("mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4", style.dot)} />
                    {i < careerPlan.roadmap.length - 1 && (
                      <span
                        className={cn(
                          "w-px flex-1",
                          step.status === "done" || step.status === "current"
                            ? "bg-cyan-300"
                            : "bg-slate-200"
                        )}
                      />
                    )}
                  </div>
                  <div className="pb-7">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm leading-snug", style.text)}>{step.title}</p>
                      {style.label && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            step.status === "current"
                              ? "bg-cyan-50 text-cyan-700"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {style.label}
                        </span>
                      )}
                    </div>
                    {step.status === "current" && (
                      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
                        Kamu sedang berada di tahap ini. Fokus memperkuat React,
                        TypeScript, dan testing untuk naik ke level berikutnya.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Skill gap */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <CircleCheck className="h-5 w-5 text-green-500" />
            Skill yang sudah kamu punya
          </h3>
          <ul className="mt-3 space-y-2">
            {careerPlan.haveSkills.map((s) => (
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
            Perlu dipelajari
          </h3>
          <ul className="mt-3 space-y-2">
            {careerPlan.recommendSkills.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" />
                {s}
              </li>
            ))}
          </ul>
          <Link
            href="/app/latihan"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-600"
          >
            Cari Materi Skill Ini
          </Link>
        </Card>
        <Card className="flex flex-col justify-between bg-gradient-to-br from-slate-900 to-cyan-900 p-6 text-white">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">
                Aksi yang disarankan
              </p>
              <h3 className="mt-1.5 text-lg font-extrabold tracking-tight">
                Pelajari React
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-cyan-100">
                React adalah skill yang paling banyak diminta untuk posisi
                target-mu. Mulai dari React untuk Pemula hari ini.
              </p>
            </div>
          </div>
          <Link
            href="/app/latihan"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-600"
          >
            <Target className="h-4 w-4" />
            Mulai Sekarang
          </Link>
        </Card>
      </div>
    </div>
  );
}