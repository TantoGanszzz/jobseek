"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addProject, updateProject, deleteProject } from "@/app/actions/portfolio";
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Github,
  Pencil,
  Trash2,
  X,
  Save,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import type { Profile, PortfolioProject } from "@/types/database.types";

interface DashboardPortfolioClientProps {
  profile: Profile | null;
  initialProjects: PortfolioProject[];
  userEmail: string;
}

export default function DashboardPortfolioClient({
  profile,
  initialProjects,
  userEmail,
}: DashboardPortfolioClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function openAddForm() {
    setEditingProject(null);
    setTechStack([]);
    setTechInput("");
    setShowForm(true);
    setMessage(null);
  }

  function openEditForm(project: PortfolioProject) {
    setEditingProject(project);
    setTechStack(project.tech_stack || []);
    setTechInput("");
    setShowForm(true);
    setMessage(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProject(null);
    setMessage(null);
  }

  function addTech() {
    const trimmed = techInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setTechInput("");
    }
  }

  function removeTech(tech: string) {
    setTechStack(techStack.filter((t) => t !== tech));
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    formData.set("tech_stack", JSON.stringify(techStack));

    try {
      const result = editingProject
        ? await updateProject(editingProject.id, formData)
        : await addProject(formData);

      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: editingProject
            ? "Proyek berhasil diperbarui!"
            : "Proyek berhasil ditambahkan!",
        });
        closeForm();
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi nanti." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm("Hapus proyek ini?")) return;
    try {
      const result = await deleteProject(projectId);
      if (!result?.error) {
        setProjects(projects.filter((p) => p.id !== projectId));
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      {/* Profile Summary */}
      <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-navy/10 border border-brand-border flex items-center justify-center text-xl font-bold text-navy shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() || userEmail[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-navy">
              {profile?.full_name || userEmail}
            </h1>
            {profile?.headline && (
              <p className="text-sm text-muted-foreground">{profile.headline}</p>
            )}
            {profile?.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </p>
            )}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {profile.bio}
              </p>
            )}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.skills.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-xs bg-navy/5 text-navy rounded-md border border-brand-border font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 6 && (
                  <span className="px-2 py-0.5 text-xs text-muted-foreground">
                    +{profile.skills.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-navy">Projects</h2>
        <Button
          onClick={openAddForm}
          size="sm"
          className="bg-navy text-white hover:bg-navy-light cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Proyek
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy">
              {editingProject ? "Edit Proyek" : "Tambah Proyek Baru"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 text-muted-foreground hover:text-navy rounded-lg hover:bg-light-bg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-navy">
                  Nama Proyek *
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editingProject?.name || ""}
                  placeholder="My Portfolio Website"
                  className="h-10 border-brand-border"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="role" className="text-sm font-medium text-navy">
                  Peran
                </label>
                <Input
                  id="role"
                  name="role"
                  defaultValue={editingProject?.role || ""}
                  placeholder="Frontend Developer"
                  className="h-10 border-brand-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-navy">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={editingProject?.description || ""}
                placeholder="Deskripsi singkat proyek Anda..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy transition-colors resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="year" className="text-sm font-medium text-navy">
                  Tahun
                </label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  defaultValue={editingProject?.year || ""}
                  placeholder="2024"
                  className="h-10 border-brand-border"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="live_url" className="text-sm font-medium text-navy">
                  Live URL
                </label>
                <Input
                  id="live_url"
                  name="live_url"
                  type="url"
                  defaultValue={editingProject?.live_url || ""}
                  placeholder="https://..."
                  className="h-10 border-brand-border"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="github_url" className="text-sm font-medium text-navy">
                  GitHub URL
                </label>
                <Input
                  id="github_url"
                  name="github_url"
                  type="url"
                  defaultValue={editingProject?.github_url || ""}
                  placeholder="https://github.com/..."
                  className="h-10 border-brand-border"
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy">Tech Stack</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-navy/5 text-navy rounded-full border border-brand-border"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, Node.js, etc."
                  className="h-9 border-brand-border"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTech}
                  className="h-9 border-brand-border text-navy cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-navy text-white hover:bg-navy-light cursor-pointer"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {loading ? "Menyimpan..." : editingProject ? "Perbarui Proyek" : "Simpan Proyek"}
            </Button>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-brand-border p-5 hover:shadow-lg hover:border-navy/20 transition-all duration-300 group"
            >
              {/* Thumbnail placeholder */}
              <div className="h-32 bg-light-bg rounded-lg mb-4 flex items-center justify-center border border-brand-border">
                <FolderKanban className="h-8 w-8 text-navy/20" />
              </div>

              <h3 className="font-semibold text-navy mb-1 group-hover:text-navy-light transition-colors">
                {project.name}
              </h3>
              {project.role && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <UserIcon className="h-3 w-3" />
                  {project.role}
                </p>
              )}
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}

              {/* Tech Stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tech_stack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] bg-light-bg text-navy rounded border border-brand-border font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{project.tech_stack.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Year */}
              {project.year && (
                <p className="text-xs text-muted-foreground mb-3">
                  {project.year}
                </p>
              )}

              {/* Links & Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-brand-border">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-navy rounded-lg hover:bg-light-bg transition-colors"
                    title="Live Preview"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-navy rounded-lg hover:bg-light-bg transition-colors"
                    title="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => openEditForm(project)}
                  className="p-1.5 text-muted-foreground hover:text-navy rounded-lg hover:bg-light-bg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="bg-white rounded-xl border border-brand-border p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-navy/5 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="h-8 w-8 text-navy/30" />
            </div>
            <h3 className="text-lg font-semibold text-navy mb-2">
              Belum ada proyek
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Tampilkan proyek dan karya terbaik Anda untuk menarik perhatian
              perekrut.
            </p>
            <Button
              onClick={openAddForm}
              className="bg-navy text-white hover:bg-navy-light cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Tambah Proyek Pertama
            </Button>
          </div>
        )
      )}
    </div>
  );
}
