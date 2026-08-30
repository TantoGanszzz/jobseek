"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { JobCard } from "./JobCard";
import { Badge, EmptyState, PageHeader } from "./ui";
import { demoJobs } from "@/lib/demo/data";

const LOCATIONS = ["Semua", "Jakarta", "Surabaya", "Bandung", "Yogyakarta", "Tangerang"];
const WORK_MODES = ["Semua", "Remote", "Hybrid", "Onsite"];
const EXPERIENCE = ["Semua", "Entry Level", "Mid Level", "Senior Level"];
const SALARIES = ["Semua", "< Rp 7 jt", "Rp 7 - 10 jt", "> Rp 10 jt"];

function parseMinSalary(salary: string): number {
  const match = salary.match(/Rp\s*([\d.]+)/);
  if (!match) return 0;
  return Number(match[1].replace(/\./g, ""));
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-cyan-300">
      <span className="hidden text-slate-400 sm:inline">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-slate-700 outline-none [&>option]:text-slate-700"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function JobsExplorer({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [location, setLocation] = useState("Semua");
  const [mode, setMode] = useState("Semua");
  const [exp, setExp] = useState("Semua");
  const [salary, setSalary] = useState("Semua");
  const [skill, setSkill] = useState("Semua");

  const allSkills = useMemo(
    () => Array.from(new Set(demoJobs.flatMap((j) => j.skills))).sort(),
    []
  );

  const jobs = useMemo(() => {
    return demoJobs.filter((job) => {
      const text = `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase();
      if (q.trim() && !text.includes(q.trim().toLowerCase())) return false;
      if (location !== "Semua" && job.location !== location) return false;
      if (mode !== "Semua" && job.workMode !== mode) return false;
      if (salary !== "Semua") {
        const min = parseMinSalary(job.salary);
        if (salary.includes("10")) {
          if (min <= 10_000_000) return false;
        } else if (salary.includes("7 - 10")) {
          if (min < 7_000_000 || min > 10_000_000) return false;
        } else if (salary.startsWith("<")) {
          if (min >= 7_000_000) return false;
        }
      }
      if (skill !== "Semua" && !job.skills.includes(skill)) return false;
      if (exp !== "Semua") {
        if (exp === "Senior Level" && job.match < 90) return false;
        if (exp === "Mid Level" && (job.match < 75 || job.match >= 90)) return false;
        if (exp === "Entry Level" && job.match >= 75) return false;
      }
      return true;
    });
  }, [q, location, mode, salary, skill, exp]);

  const hasFilter =
    location !== "Semua" || mode !== "Semua" || salary !== "Semua" || skill !== "Semua" || exp !== "Semua";

  function clearAll() {
    setQ("");
    setLocation("Semua");
    setMode("Semua");
    setExp("Semua");
    setSalary("Semua");
    setSkill("Semua");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        subtitle="Temukan pekerjaan yang paling mencocoki profil dan skill kamu."
      />

      {/* Search */}
      <form
        onSubmit={(e: FormEvent) => e.preventDefault()}
        className="relative mx-auto max-w-2xl"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari pekerjaan, skill, atau perusahaan..."
          className="h-12 w-full rounded-2xl border border-line bg-white pl-12 pr-4 text-sm text-slate-700 shadow-card placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
        />
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </span>
        <SelectFilter label="Lokasi" value={location} options={LOCATIONS} onChange={setLocation} />
        <SelectFilter label="Tipe" value={mode} options={WORK_MODES} onChange={setMode} />
        <SelectFilter label="Pengalaman" value={exp} options={EXPERIENCE} onChange={setExp} />
        <SelectFilter label="Gaji" value={salary} options={SALARIES} onChange={setSalary} />
        <SelectFilter label="Skill" value={skill} options={["Semua", ...allSkills]} onChange={setSkill} />
        {hasFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-transparent px-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
            Hapus
          </button>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Rekomendasi Untukmu
          </h2>
          <Badge tone={jobs.length ? "cyan" : "slate"}>{jobs.length} pekerjaan</Badge>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} variant="list" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Tidak ada pekerjaan yang cocok"
            description="Coba ubah kata kunci atau filter kamu untuk melihat hasil lainnya."
          />
        )}
      </section>
    </div>
  );
}