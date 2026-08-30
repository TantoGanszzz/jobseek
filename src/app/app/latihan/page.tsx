"use client";

import { useState } from "react";
import { ArrowRight, Clock, CirclePlay, RotateCw, Sparkles } from "lucide-react";
import { Badge, Card, PageHeader, ProgressBar, SectionHeader } from "@/components/demo/ui";
import { demoTrainings, type DemoTraining } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

type Tab = "semua" | "berjalan" | "selesai" | "tersimpan";

const tabs: { id: Tab; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "berjalan", label: "Sedang Berjalan" },
  { id: "selesai", label: "Selesai" },
  { id: "tersimpan", label: "Tersimpan" },
];

const difficultyTone: Record<DemoTraining["difficulty"], "cyan" | "violet" | "warning"> = {
  Pemula: "cyan",
  Menengah: "violet",
  Lanjutan: "warning",
};

function TrainingCard({ training }: { training: DemoTraining }) {
  const labels = {
    berjalan: { text: "Lanjutkan", icon: <CirclePlay className="h-4 w-4" /> },
    selesai: { text: "Ulangi", icon: <RotateCw className="h-4 w-4" /> },
    tersimpan: { text: "Mulai", icon: <CirclePlay className="h-4 w-4" /> },
  }[training.status];

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <Badge tone="slate">{training.category}</Badge>
        <Badge tone={difficultyTone[training.difficulty]}>{training.difficulty}</Badge>
      </div>
      <h3 className="mt-3 text-base font-bold text-slate-900">{training.title}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
        <Clock className="h-3.5 w-3.5" />
        {training.duration} · {training.doneLessons}/{training.totalLessons} materi
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Progress</span>
          <span className="font-extrabold text-cyan-600">{training.progress}%</span>
        </div>
        <ProgressBar value={training.progress} />
      </div>

      <button
        type="button"
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
          training.status === "selesai"
            ? "border border-line bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-600"
            : "bg-cyan-500 text-white hover:bg-cyan-600"
        )}
      >
        {labels.icon}
        {labels.text}
      </button>
    </Card>
  );
}

export default function LatihanPage() {
  const [tab, setTab] = useState<Tab>("semua");

  const trainings = demoTrainings.filter((t) => {
    if (tab === "semua") return true;
    return t.status === tab;
  });

  const inProgress = demoTrainings.filter((t) => t.status === "berjalan");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Latihan"
        subtitle="Bangun dan buktikan skill-mu dengan materi terarah untuk karier impianmu."
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "relative -mb-px rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id
                ? "text-cyan-600"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t.label}
            <span
              className={cn(
                "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-cyan-500 transition-opacity",
                tab === t.id ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        ))}
      </div>

      {/* In-progress strip */}
      {tab === "semua" && inProgress.length > 0 && (
        <section>
          <SectionHeader title="Lanjutkan di mana kamu berhenti" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {inProgress.slice(0, 4).map((t) => (
              <TrainingCard key={t.id} training={t} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Semua Materi" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trainings.map((t) => (
            <TrainingCard key={t.id} training={t} />
          ))}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white">
          <Sparkles className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        </span>
        <div className="text-sm leading-relaxed text-slate-600">
          <p className="font-bold text-slate-900">Tips JobSeek</p>
          <p className="mt-0.5">
            Selesaikan materi <span className="font-semibold text-cyan-700">Interview Preparation</span>{" "}
            untuk menaikkan kesiapan interview-mu dari 70% ke 90%.{" "}
            <a href="/app/latihan" className="inline-flex items-center gap-1 font-semibold text-cyan-600 hover:underline">
              Mulai sekarang
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}