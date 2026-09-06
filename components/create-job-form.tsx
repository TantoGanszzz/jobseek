"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createJobAction } from "@/app/actions/hrd";
import { DEFAULT_JOB_STAGES } from "@/lib/hrd/types";
import { X, Plus, Save } from "lucide-react";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const WORK_MODES = ["On-site", "Hybrid", "Remote"];
const EXPERIENCE_LEVELS = ["Entry-level", "Junior", "Mid-level", "Senior"];
const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "Human Resources", "Operations", "Finance", "Customer Support", "Other"];
const EDUCATIONS = ["High School", "Diploma (D3)", "Bachelor's (S1)", "Master's (S2)", "Doctorate (S3)", "Any"];

export default function CreateJobForm() {
  const router = useRouter();
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [reqSkillInput, setReqSkillInput] = useState("");
  const [prefSkillInput, setPrefSkillInput] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [minScore, setMinScore] = useState(70);
  const [deadline, setDeadline] = useState("");
  const [department, setDepartment] = useState("");
  const [education, setEducation] = useState("");
  const [stages, setStages] = useState<string[]>(DEFAULT_JOB_STAGES);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function addSkill(list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput("");
    }
  }

  function removeSkill(list: string[], setList: (v: string[]) => void, skill: string) {
    setList(list.filter((s) => s !== skill));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createJobAction({
      title,
      description,
      location,
      jobType,
      workMode,
      salaryRange,
      experienceLevel,
      skills: requiredSkills,
      preferredSkills,
      requirements,
      responsibilities,
      minQualificationScore: minScore,
      deadline,
      department,
      education,
      stages,
    });
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Job created successfully!" });
      router.push("/company/jobs");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Create Job</h1>
        <p className="mt-1 text-sm text-slate-500">Post a new opportunity and define its qualification standard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`rounded-lg border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            <p>{message.text}</p>
            {message.type === "error" && message.text.startsWith("Profil perusahaan belum tersedia") && (
              <Link href="/company/profile" className="mt-3 inline-flex rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                Lengkapi Profil Perusahaan
              </Link>
            )}
          </div>
        )}

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Job Details</h2>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">Job Title *</label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Frontend Developer" className="h-11 border-slate-200" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe the role..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="location" className="text-sm font-medium text-slate-700">Location</label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Jakarta, Indonesia" className="h-11 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="salary_range" className="text-sm font-medium text-slate-700">Salary Range</label>
              <Input id="salary_range" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="Rp 8 - 15 Juta" className="h-11 border-slate-200" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Job Type</label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setJobType(jobType === type ? "" : type)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    jobType === type
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Work Mode</label>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkMode(workMode === mode ? "" : mode)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    workMode === mode
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Experience Level</label>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperienceLevel(experienceLevel === level ? "" : level)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    experienceLevel === level
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepartment(department === d ? "" : d)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                      department === d
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Minimum Education</label>
              <div className="flex flex-wrap gap-2">
                {EDUCATIONS.map((ed) => (
                  <button
                    key={ed}
                    type="button"
                    onClick={() => setEducation(education === ed ? "" : ed)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                      education === ed
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {ed}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Recruitment Process <span className="font-normal text-slate-400">(order shown to candidates)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_JOB_STAGES.map((stage) => {
                const active = stages.includes(stage);
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setStages(active ? stages.filter((s) => s !== stage) : [...stages, stage])}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="responsibilities" className="text-sm font-medium text-slate-700">Responsibilities</label>
            <textarea
              id="responsibilities"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="requirements" className="text-sm font-medium text-slate-700">Requirements</label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="job-deadline" className="text-sm font-medium text-slate-700">Application Deadline</label>
              <Input id="job-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="min_qualification_score" className="text-sm font-medium text-slate-700">Minimum Qualification Score</label>
              <div className="flex items-center gap-2">
                <Input
                  id="min_qualification_score"
                  type="number"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="h-11 border-slate-200"
                />
                <span className="text-slate-500">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Skills</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Required Skills</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
                  {skill}
                  <button type="button" onClick={() => removeSkill(requiredSkills, setRequiredSkills, skill)} className="cursor-pointer hover:text-red-500"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(requiredSkills, setRequiredSkills, reqSkillInput, setReqSkillInput);
                  }
                }}
                placeholder="Add required skill"
                className="h-10 border-slate-200"
              />
              <Button type="button" variant="outline" onClick={() => addSkill(requiredSkills, setRequiredSkills, reqSkillInput, setReqSkillInput)} className="h-10 cursor-pointer border-slate-200 text-slate-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Preferred Skills</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {preferredSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-sm text-blue-700">
                  {skill}
                  <button type="button" onClick={() => removeSkill(preferredSkills, setPreferredSkills, skill)} className="cursor-pointer hover:text-red-500"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={prefSkillInput}
                onChange={(e) => setPrefSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(preferredSkills, setPreferredSkills, prefSkillInput, setPrefSkillInput);
                  }
                }}
                placeholder="Add preferred skill"
                className="h-10 border-slate-200"
              />
              <Button type="button" variant="outline" onClick={() => addSkill(preferredSkills, setPreferredSkills, prefSkillInput, setPrefSkillInput)} className="h-10 cursor-pointer border-slate-200 text-slate-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="h-11 cursor-pointer bg-blue-600 px-6 text-white hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Creating..." : "Create Job"}
        </Button>
      </form>
    </div>
  );
}
