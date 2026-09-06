"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Upload as UploadIcon,
} from "lucide-react";
import {
  EDUCATION_LEVELS,
  EDUCATION_STATUSES,
  EXPERIENCE_LEVELS,
  INTEREST_OPTIONS,
  MAX_INTERESTS,
  MAX_SKILLS,
  MIN_INTERESTS,
  MIN_ROLES,
  MIN_SKILLS,
  PREFERRED_JOB_ROLES,
  SKILL_OPTIONS,
  WORK_LOCATIONS,
  WORK_TYPES,
} from "@/lib/onboarding-data";
import StepProgress from "@/components/onboarding/step-progress";
import MultiSelect from "@/components/onboarding/multi-select";
import { ChipGroup, Field, inputCls, textareaCls } from "@/components/onboarding/form-ui";
import {
  completeUserOnboarding,
  saveUserExperiences,
  saveUserStep,
  uploadCv,
} from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Personal" },
  { label: "Education" },
  { label: "Skills" },
  { label: "Interests" },
  { label: "Career Prefs" },
  { label: "Experience" },
  { label: "Links & CV" },
  { label: "Review" },
];

interface ExperienceDraft {
  company_name: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

export interface UserOnboardingState {
  onboarding_step: number;
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  location: string;
  city: string;
  province: string;
  avatar_url: string;
  education_level: string;
  university: string;
  major: string;
  graduation_year: string;
  education_status: string;
  gpa: string;
  skills: string[];
  interests: string[];
  preferred_roles: string[];
  preferred_work_type: string[];
  preferred_work_location: string[];
  preferred_city: string;
  preferred_province: string;
  willing_to_relocate: boolean;
  career_goal: string;
  short_term_goal: string;
  long_term_goal: string;
  experience_level: string;
  has_experience: boolean;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  behance_url: string;
  dribbble_url: string;
  resume_url: string;
}

const SKILL_CATEGORY_MAP: Record<string, { label: string; category: string }[]> = {
  Programming: SKILL_OPTIONS.filter((s) =>
    ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PHP", "Laravel", "Python", "Java", "C++", "SQL", "Git", "GitHub", "Docker"].includes(s)
  ).map((label) => ({ label, category: "Programming" })),
  Design: ["UI/UX Design", "Figma", "Graphic Design", "Adobe Photoshop", "Adobe Illustrator"].map((label) => ({ label, category: "Design" })),
  Data: ["Data Analysis", "Machine Learning", "Artificial Intelligence", "SQL", "MySQL", "PostgreSQL", "Microsoft Excel", "Python"].map((label) => ({ label, category: "Data" })),
  Networking: ["Networking", "Linux", "Cloud Computing", "AWS", "Docker"].map((label) => ({ label, category: "Networking" })),
  Cybersecurity: ["Cybersecurity", "Ethical Hacking"].map((label) => ({ label, category: "Cybersecurity" })),
  Cloud: ["Cloud Computing", "AWS", "Docker", "Linux"].map((label) => ({ label, category: "Cloud" })),
  Marketing: ["SEO", "Copywriting", "Content Writing", "Google Analytics", "Communication"].map((label) => ({ label, category: "Marketing" })),
  Management: ["Project Management", "Agile", "Leadership", "Communication"].map((label) => ({ label, category: "Management" })),
  Communication: ["Communication", "Leadership", "Copywriting", "Content Writing"].map((label) => ({ label, category: "Communication" })),
};

function emptyState(): UserOnboardingState {
  return {
    onboarding_step: 1,
    full_name: "", phone: "", date_of_birth: "", gender: "", location: "", city: "",
    province: "", avatar_url: "", education_level: "", university: "", major: "",
    graduation_year: "", education_status: "", gpa: "", skills: [], interests: [],
    preferred_roles: [], preferred_work_type: [], preferred_work_location: [],
    preferred_city: "", preferred_province: "", willing_to_relocate: false,
    career_goal: "", short_term_goal: "", long_term_goal: "", experience_level: "",
    has_experience: false, github_url: "", linkedin_url: "", portfolio_url: "",
    behance_url: "", dribbble_url: "", resume_url: "",
  };
}

export default function UserOnboarding({
  initialProfile,
  initialExperiences,
}: {
  initialProfile: Partial<UserOnboardingState> | null;
  initialExperiences?: ExperienceDraft[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<UserOnboardingState>({
    ...emptyState(),
    ...(initialProfile || {}),
  });
  const [experiences, setExperiences] = useState<ExperienceDraft[]>(
    initialExperiences && initialExperiences.length > 0
      ? initialExperiences
      : [{ company_name: "", position: "", start_date: "", end_date: "", is_current: false, description: "" }]
  );
  const [step, setStep] = useState(
    Math.min(Math.max(initialProfile?.onboarding_step || 1, 1), STEPS.length)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [cvStatus, setCvStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof UserOnboardingState>(key: K, value: UserOnboardingState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ---------- validation ----------
  function validateStep(stepNum: number): boolean {
    const next: Record<string, string> = {};
    if (stepNum === 1) {
      if (!form.full_name.trim()) next.full_name = "Full name is required.";
      if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number (min 8 digits).";
      if (!form.location.trim()) next.location = "Location is required.";
    }
    if (stepNum === 2) {
      if (!form.education_level) next.education_level = "Education level is required.";
      if (form.graduation_year && !/^\d{4}$/.test(form.graduation_year)) next.graduation_year = "Enter a 4-digit year.";
    }
    if (stepNum === 3) {
      if (form.skills.length < MIN_SKILLS) next.skills = `Select at least ${MIN_SKILLS} skills.`;
    }
    if (stepNum === 4) {
      if (form.interests.length < MIN_INTERESTS) next.interests = `Select at least ${MIN_INTERESTS} interest.`;
    }
    if (stepNum === 5) {
      if (form.preferred_roles.length < MIN_ROLES) next.preferred_roles = "Select at least one preferred role.";
      if (form.preferred_work_type.length < 1) next.preferred_work_type = "Select at least one work type.";
    }
    if (stepNum === 6) {
      if (!form.experience_level) next.experience_level = "Select your experience level.";
      if (form.has_experience) {
        const filled = experiences.filter((e) => e.company_name.trim() && e.position.trim());
        if (filled.length === 0) next.experience = "Add at least one experience or select 'I don't have professional experience yet.'";
      }
    }
    if (stepNum === 7) {
      for (const key of ["github_url", "linkedin_url", "portfolio_url", "behance_url", "dribbble_url"] as const) {
        const v = form[key];
        if (v && !/^https?:\/\/\S+$/i.test(v.trim())) next[key] = "Enter a valid URL starting with http(s)://";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveCurrentStep(nextStep: number) {
    const data: Record<string, unknown> = {
      ...form,
      onboarding_step: nextStep,
      willing_to_relocate: form.willing_to_relocate,
      has_experience: form.has_experience,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year, 10) : null,
    };
    const res = await saveUserStep(step, data);
    return res;
  }

  async function handleContinue() {
    if (saving) return;
    if (!validateStep(step)) return;

    setSaving(true);
    try {
      if (step === 6) {
        await saveUserExperiences(form.has_experience ? experiences : []);
      }
      const res = await saveCurrentStep(step + 1);
      if ((res as any)?.error) {
        setErrors({ form: (res as any).error });
        return;
      }
      if (step + 1 <= STEPS.length) setStep(step + 1);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleComplete() {
    if (saving) return;
    setSaving(true);
    const res = await completeUserOnboarding();
    setSaving(false);
    if ((res as any)?.error) {
      setErrors({ form: (res as any).error });
      return;
    }
    router.push("/onboarding/user/recommendations");
  }

  async function handleCvFile(file: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setCvStatus("Only PDF files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvStatus("CV must be under 5 MB.");
      return;
    }
    setCvStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadCv(fd);
    if (res?.success) {
      set("resume_url", res.url || "");
      setCvStatus("Uploaded successfully.");
    } else {
      setCvStatus(res?.error || "Upload failed.");
    }
  }

  function updateExperience(idx: number, key: keyof ExperienceDraft, value: string | boolean) {
    setExperiences((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [key]: value } : e))
    );
  }

  // ---------- step rendering ----------
  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <Field label="Full Name" required error={errors.full_name}>
              <input className={inputCls} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="e.g. Vega Darmawan" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone Number" required error={errors.phone}>
                <input className={inputCls} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+62 812 3456 7890" />
              </Field>
              <Field label="Date of Birth">
                <input className={inputCls} type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
              </Field>
            </div>
            <Field label="Gender">
              <ChipGroup options={["Male", "Female", "Prefer not to say"]} value={form.gender ? [form.gender] : []} onChange={(v) => set("gender", v[0] || "")} />
            </Field>
            <Field label="Location" required error={errors.location}>
              <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Current location, e.g. Jakarta, Indonesia" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="City">
                <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Jakarta" />
              </Field>
              <Field label="Province">
                <input className={inputCls} value={form.province} onChange={(e) => set("province", e.target.value)} placeholder="e.g. DKI Jakarta" />
              </Field>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <Field label="Education Level" required error={errors.education_level}>
              <ChipGroup options={EDUCATION_LEVELS} value={form.education_level ? [form.education_level] : []} onChange={(v) => set("education_level", v[0] || "")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="School / University">
                <input className={inputCls} value={form.university} onChange={(e) => set("university", e.target.value)} placeholder="e.g. University of Indonesia" />
              </Field>
              <Field label="Major">
                <input className={inputCls} value={form.major} onChange={(e) => set("major", e.target.value)} placeholder="e.g. Computer Science" />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Graduation Year" error={errors.graduation_year}>
                <input className={inputCls} inputMode="numeric" value={form.graduation_year} onChange={(e) => set("graduation_year", e.target.value)} placeholder="e.g. 2026" />
              </Field>
              <Field label="Education Status">
                <ChipGroup options={EDUCATION_STATUSES} value={form.education_status ? [form.education_status] : []} onChange={(v) => set("education_status", v[0] || "")} />
              </Field>
            </div>
            <Field label="GPA (optional)">
              <input className={inputCls} inputMode="decimal" value={form.gpa} onChange={(e) => set("gpa", e.target.value)} placeholder="e.g. 3.7" />
            </Field>
          </div>
        );

      case 3:
        return (
          <MultiSelect
            label="Your Skills"
            options={[...SKILL_OPTIONS]}
            value={form.skills}
            onChange={(v) => set("skills", v)}
            min={MIN_SKILLS}
            max={MAX_SKILLS}
            searchable
            categories={SKILL_CATEGORY_MAP}
            placeholder="Search skills..."
            error={errors.skills}
            helpText={`Select between ${MIN_SKILLS} and ${MAX_SKILLS} skills. You can select more than 3.`}
          />
        );

      case 4:
        return (
          <MultiSelect
            label="Your Interests"
            options={[...INTEREST_OPTIONS]}
            value={form.interests}
            onChange={(v) => set("interests", v)}
            min={MIN_INTERESTS}
            max={MAX_INTERESTS}
            error={errors.interests}
            helpText={`Select between ${MIN_INTERESTS} and ${MAX_INTERESTS} interests.`}
          />
        );

      case 5:
        return (
          <div className="space-y-6">
            <Field label="Preferred Job Roles" required error={errors.preferred_roles}>
              <MultiSelect
                label="Preferred Job Roles"
                options={[...PREFERRED_JOB_ROLES]}
                value={form.preferred_roles}
                onChange={(v) => set("preferred_roles", v)}
                min={MIN_ROLES}
                helpText="Select as many roles as you are interested in."
              />
            </Field>
            <Field label="Preferred Work Type" required error={errors.preferred_work_type}>
              <ChipGroup options={WORK_TYPES} multiple value={form.preferred_work_type} onChange={(v) => set("preferred_work_type", v)} />
            </Field>
            <Field label="Preferred Work Location" error={errors.preferred_work_location}>
              <ChipGroup options={WORK_LOCATIONS} multiple value={form.preferred_work_location} onChange={(v) => set("preferred_work_location", v)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Preferred City">
                <input className={inputCls} value={form.preferred_city} onChange={(e) => set("preferred_city", e.target.value)} placeholder="e.g. Jakarta" />
              </Field>
              <Field label="Preferred Province">
                <input className={inputCls} value={form.preferred_province} onChange={(e) => set("preferred_province", e.target.value)} placeholder="e.g. DKI Jakarta" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.willing_to_relocate}
                onChange={(e) => set("willing_to_relocate", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              Willing to work outside my current city
            </label>
            <Field label="Career Goal">
              <textarea className={textareaCls} rows={3} value={form.career_goal} onChange={(e) => set("career_goal", e.target.value)} placeholder="e.g. I want to become a full-stack developer and work on modern web applications." />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Short-term Goal">
                <textarea className={textareaCls} rows={2} value={form.short_term_goal} onChange={(e) => set("short_term_goal", e.target.value)} placeholder="Within the next year..." />
              </Field>
              <Field label="Long-term Goal">
                <textarea className={textareaCls} rows={2} value={form.long_term_goal} onChange={(e) => set("long_term_goal", e.target.value)} placeholder="In the next 5 years..." />
              </Field>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Field label="Experience Level" required error={errors.experience_level}>
              <ChipGroup options={EXPERIENCE_LEVELS} value={form.experience_level ? [form.experience_level] : []} onChange={(v) => set("experience_level", v[0] || "")} />
            </Field>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.has_experience}
                onChange={(e) => set("has_experience", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              I have professional experience
            </label>

            {form.has_experience ? (
              <>
                {experiences.map((exp, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Experience {i + 1}</p>
                      {experiences.length > 1 && (
                        <button type="button" onClick={() => setExperiences((p) => p.filter((_, x) => x !== i))} className="text-sm text-red-600 hover:underline cursor-pointer">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Company">
                        <input className={inputCls} value={exp.company_name} onChange={(e) => updateExperience(i, "company_name", e.target.value)} placeholder="Company name" />
                      </Field>
                      <Field label="Position">
                        <input className={inputCls} value={exp.position} onChange={(e) => updateExperience(i, "position", e.target.value)} placeholder="e.g. Intern Developer" />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Start Date">
                        <input className={inputCls} value={exp.start_date} onChange={(e) => updateExperience(i, "start_date", e.target.value)} placeholder="YYYY-MM" />
                      </Field>
                      <Field label="End Date">
                        <input className={inputCls} value={exp.end_date} onChange={(e) => updateExperience(i, "end_date", e.target.value)} placeholder="YYYY-MM or now" />
                      </Field>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" checked={exp.is_current} onChange={(e) => updateExperience(i, "is_current", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                          Current
                        </label>
                      </div>
                    </div>
                    <Field label="Description">
                      <textarea className={textareaCls} rows={2} value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder="What did you do?" />
                    </Field>
                  </div>
                ))}
                {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}
                <button
                  type="button"
                  onClick={() => setExperiences((p) => [...p, { company_name: "", position: "", start_date: "", end_date: "", is_current: false, description: "" }])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 cursor-pointer"
                >
                  <Briefcase className="h-4 w-4" /> Add Experience
                </button>
              </>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                I don&apos;t have professional experience yet. — Optional experiences are saved for later.
              </p>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-5">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Your CV</p>
                  <p className="text-xs text-slate-500">PDF only, max 5 MB. Used when applying to jobs.</p>
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleCvFile(e.target.files[0])} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  <UploadIcon className="h-4 w-4" /> Upload CV
                </button>
              </div>
              {form.resume_url && (
                <div className="mb-3 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  <span className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {form.resume_url.split("/").pop() || "CV"}
                  </span>
                  <a href={form.resume_url} target="_blank" rel="noreferrer" className="font-medium underline">View</a>
                </div>
              )}
              {form.resume_url && (
                <button type="button" onClick={() => set("resume_url", "")} className="text-sm text-red-600 hover:underline cursor-pointer">Remove CV</button>
              )}
              {cvStatus && <p className="mt-2 text-sm text-slate-500">{cvStatus}</p>}
            </div>

            <p className="text-xs text-slate-500">Or paste a CV link below (e.g. a shared PDF link):</p>
            <Field label="CV Link">
              <input className={inputCls} value={form.resume_url} onChange={(e) => set("resume_url", e.target.value)} placeholder="https://..." />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="GitHub" error={errors.github_url}>
                <input className={inputCls} value={form.github_url} onChange={(e) => set("github_url", e.target.value)} placeholder="https://github.com/username" />
              </Field>
              <Field label="LinkedIn" error={errors.linkedin_url}>
                <input className={inputCls} value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/username" />
              </Field>
              <Field label="Portfolio Website" error={errors.portfolio_url}>
                <input className={inputCls} value={form.portfolio_url} onChange={(e) => set("portfolio_url", e.target.value)} placeholder="https://your-portfolio.com" />
              </Field>
              <Field label="Behance" error={errors.behance_url}>
                <input className={inputCls} value={form.behance_url} onChange={(e) => set("behance_url", e.target.value)} placeholder="https://behance.net/username" />
              </Field>
              <Field label="Dribbble" error={errors.dribbble_url}>
                <input className={inputCls} value={form.dribbble_url} onChange={(e) => set("dribbble_url", e.target.value)} placeholder="https://dribbble.com/username" />
              </Field>
            </div>
          </div>
        );

      case 8:
        return renderReview();

      default:
        return null;
    }
  }

  function renderReview() {
    const rows: { label: string; value: string; step: number }[] = [
      { label: "Personal", value: [form.full_name, form.phone, form.location].filter(Boolean).join(" · ") || "—", step: 1 },
      { label: "Education", value: [form.education_level, form.university, form.major].filter(Boolean).join(" · ") || "—", step: 2 },
      { label: "Skills", value: form.skills.length ? form.skills.join(", ") : "—", step: 3 },
      { label: "Interests", value: form.interests.length ? form.interests.join(", ") : "—", step: 4 },
      {
        label: "Career Preferences",
        value: [
          form.preferred_roles.join(", ") || "—",
          form.preferred_work_type.join(", ") || "",
          form.preferred_work_location.join(", ") || "",
        ].filter(Boolean).join(" · "),
        step: 5,
      },
      {
        label: "Experience",
        value: form.has_experience
          ? experiences.filter((e) => e.company_name && e.position).map((e) => `${e.position} @ ${e.company_name}`).join(", ") || "Not filled"
          : "No professional experience yet",
        step: 6,
      },
      {
        label: "Links & CV",
        value: [form.github_url, form.linkedin_url, form.portfolio_url, form.resume_url].filter(Boolean).join(" · ") || "—",
        step: 7,
      },
    ];

    return (
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{row.label}</p>
              <p className="mt-0.5 break-words text-sm text-slate-600">{row.value}</p>
            </div>
            <button type="button" onClick={() => { setStep(row.step); }} className="shrink-0 text-sm font-medium text-blue-700 hover:underline cursor-pointer">
              Edit
            </button>
          </div>
        ))}
      </div>
    );
  }

  const titles: Record<number, [string, string]> = {
    1: ["Let's get to know you", "Complete your basic information to build your Jobseek profile."],
    2: ["Tell us about your education", "Share your educational background to improve career matching."],
    3: ["What are your skills?", "Select the skills you have or want to use professionally."],
    4: ["What are you interested in?", "Tell us what kind of work interests you."],
    5: ["What kind of career are you looking for?", "Set your preferred roles, work style, and location."],
    6: ["Your experience", "Share your professional experience or let us know you're just starting out."],
    7: ["Add your CV & links", "Your CV can be used when applying to jobs."],
    8: ["Review your profile", "Check everything is accurate before completing."],
  };

  const isLastFormStep = step === STEPS.length - 1;
  const isFinalReview = step === STEPS.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <StepProgress steps={STEPS} current={step} />

      <div className="mt-6 mb-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{titles[step][0]}</h1>
        <p className="mt-1 text-sm text-slate-500">{titles[step][1]}</p>
      </div>

      {errors.form && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</div>
      )}

      {renderStep()}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <span />
        )}

        {isFinalReview ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving..." : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Complete Profile
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer",
              isLastFormStep ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {saving ? "Saving..." : "Continue"}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}