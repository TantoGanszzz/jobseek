"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Award,
  BadgeCheck,
  CircleCheck,
  FileCheck,
  FolderKanban,
  GitBranch,
  MapPin,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Avatar, Badge, Card, ProgressBar, RingProgress, SectionHeader } from "@/components/demo/ui";
import { skillProfile } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

type Tab = "overview" | "skills" | "proof" | "achievement";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "proof", label: "Skill Proof" },
  { id: "achievement", label: "Achievement" },
];

const levelTone = {
  Expert: "success",
  Advanced: "cyan",
  Intermediate: "warning",
} as const;

export default function SkillProfilePage() {
  const [tab, setTab] = useState<Tab>("overview");

  const proof = [
    { label: "Projects", value: String(skillProfile.proof.projects), icon: FolderKanban, href: "/app/portfolio" },
    { label: "Assessments", value: String(skillProfile.proof.assessments), icon: FileCheck, href: "/app/assessment" },
    { label: "GitHub", value: "Terkoneksi", icon: GitBranch, href: "/app/settings" },
    { label: "Sertifikat", value: String(skillProfile.proof.certificates), icon: Award, href: "/app/certificates" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials="AP" color="bg-cyan-500" size="lg" className="h-16 w-16 text-xl" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {skillProfile.name}
            </h1>
            <p className="mt-0.5 text-sm font-semibold text-cyan-600">
              {skillProfile.title}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {skillProfile.location}
            </p>
          </div>
        </div>
        <Card className="flex items-center gap-4 p-4">
          <RingProgress value={skillProfile.readiness} size={76} stroke={8} sublabel="Siap" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Career Readiness
            </p>
            <p className="mt-0.5 text-lg font-extrabold text-slate-900">
              {skillProfile.readiness} <span className="text-sm font-bold text-slate-400">/ 100</span>
            </p>
            <Link
              href="/app/karier"
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
            >
              Lihat jalur karier
              <TrendingUp className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-white p-1 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none sm:px-6",
              tab === t.id
                ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/25"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <SectionHeader title="Tentang Saya" />
            <div className="space-y-3 text-sm leading-relaxed text-slate-600">
              {skillProfile.overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Pengalaman", value: "3+ tahun" },
                { label: "Rekomendasi", value: "8 recruiter" },
                { label: "Profile dilihat", value: "42x" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-slate-50 p-3.5">
                  <p className="text-lg font-extrabold text-slate-900">{m.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="space-y-5">
            <Card className="p-6">
              <SectionHeader title="Kesiapan Karier" />
              <div className="space-y-3.5">
                {[
                  { label: "CV", value: 90 },
                  { label: "Portfolio", value: 85 },
                  { label: "Skills", value: 82 },
                  { label: "Assessment", value: 76 },
                  { label: "Interview", value: 70 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-slate-600">{s.label}</span>
                      <span className="font-bold text-slate-900">{s.value}%</span>
                    </div>
                    <ProgressBar value={s.value} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "skills" && (
        <Card className="p-6">
          <SectionHeader
            title="Profil Skill"
            action={<Badge tone="cyan">{skillProfile.skills.length} skill terverifikasi</Badge>}
          />
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {skillProfile.skills.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-cyan-600">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-cyan-600">{s.score}%</span>
                      <Badge tone={levelTone[s.level as keyof typeof levelTone]}>{s.level}</Badge>
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={s.score} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "proof" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {proof.map((p) => (
              <Link key={p.label} href={p.href} className="group rounded-card border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-card-hover">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-cyan-600">
                  <p.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{p.value}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">{p.label}</p>
              </Link>
            ))}
          </div>
          <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="text-sm leading-relaxed text-slate-600">
                <p className="font-bold text-slate-900">Bukti skill membuat profilmu 3x lebih ditemukan.</p>
                <p className="mt-0.5">Tambahkan project dan selesaikan assessment untuk memperkuat skill proof-mu.</p>
              </div>
            </div>
            <Link href="/app/portfolio" className="shrink-0 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-600">
              Tambah Bukti
            </Link>
          </Card>
        </div>
      )}

      {tab === "achievement" && (
        <Card className="p-6">
          <SectionHeader title="Pencapaian" />
          <div className="grid gap-3 sm:grid-cols-2">
            {skillProfile.achievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4",
                  a.tone === "success"
                    ? "border-green-200 bg-green-50/50"
                    : a.tone === "cyan"
                      ? "border-cyan-200 bg-cyan-50/50"
                      : "border-slate-200 bg-slate-50/50"
                )}
              >
                <CircleCheck
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    a.tone === "success" ? "text-green-500" : a.tone === "cyan" ? "text-cyan-500" : "text-slate-400"
                  )}
                />
                <p className="text-sm font-medium leading-relaxed text-slate-700">{a.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}