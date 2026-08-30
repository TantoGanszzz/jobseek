"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Code, Eye, Plus, Star, X } from "lucide-react";
import { Card, PageHeader } from "@/components/demo/ui";
import { demoPortfolio, type DemoPortfolio } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

function ProjectCard({ project }: { project: DemoPortfolio }) {
  return (
    <Card className="group overflow-hidden">
      <div
        className={cn(
          "relative flex h-40 items-center justify-center bg-gradient-to-br",
          project.gradient
        )}
      >
        <Code className="h-10 w-10 text-white/90 transition-transform group-hover:scale-110" />
        {project.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-amber-600">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            Featured
          </span>
        )}
        <button
          type="button"
          aria-label="Pratinjau project"
          className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800">
            <Eye className="h-3.5 w-3.5" />
            Pratinjau
          </span>
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-md border border-line bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {project.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Diperbarui {project.updated}</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
          >
            Lihat Detail
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function AddProjectModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (project: DemoPortfolio) => void;
}) {
  const [title, setTitle] = useState("");
  const [tech, setTech] = useState("");
  const [description, setDescription] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: `p-${Date.now()}`,
      title: title.trim(),
      tech: tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      description: description.trim(),
      featured: false,
      updated: "Baru saja",
      gradient: "from-cyan-600/90 via-cyan-700/80 to-slate-800/80",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">Tambah Project</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="p-title" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Judul Project
            </label>
            <input
              id="p-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. E-Commerce UI"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label htmlFor="p-tech" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Teknologi
              <span className="ml-1 font-normal text-slate-400">(pisahkan dengan koma)</span>
            </label>
            <input
              id="p-tech"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              placeholder="React, Tailwind CSS"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label htmlFor="p-desc" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Deskripsi
            </label>
            <textarea
              id="p-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ceritakan singkat tentang project ini..."
              className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-600"
            >
              Tambahkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<DemoPortfolio[]>(demoPortfolio);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Portfolio"
        subtitle="Tunjukkan bukti nyata kemampuanmu lewat project yang berkualitas."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
          >
            <Plus className="h-4 w-4" />
            Tambah Project
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      <Card className="flex flex-col items-center gap-3 border-dashed bg-slate-50/50 p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
          <Plus className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900">Portofolio kuat = peluang lebih besar</p>
          <p className="mt-1 text-sm text-slate-500">
            Tambahkan 3-5 project terbaikmu dan hubungkan akun GitHub untuk
            menaikkan match score hingga +8%.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
        >
          <Plus className="h-4 w-4" />
          Tambah Project
        </button>
      </Card>

      {adding && (
        <AddProjectModal
          onClose={() => setAdding(false)}
          onAdd={(p) => {
            setProjects((prev) => [p, ...prev]);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}