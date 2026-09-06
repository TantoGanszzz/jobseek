"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck } from "lucide-react";
import {
  COMPANY_SIZES,
  COMPANY_TYPES,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  HRD_CANDIDATE_ROLES,
  HRD_POSITIONS,
  INDUSTRIES,
  MIN_SKILLS,
  WORK_LOCATIONS,
  WORK_TYPES,
} from "@/lib/onboarding-data";
import StepProgress from "@/components/onboarding/step-progress";
import MultiSelect from "@/components/onboarding/multi-select";
import { ChipGroup, Field, inputCls, SelectInput, textareaCls } from "@/components/onboarding/form-ui";
import { completeHrdOnboarding, saveHrdStep } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Your Info" },
  { label: "Company" },
  { label: "Type & Industry" },
  { label: "Roles" },
  { label: "Hiring Prefs" },
  { label: "Review" },
];

export interface HrdOnboardingState {
  onboarding_step: number;
  full_name: string;
  phone: string;
  position: string;
  avatar_url: string;
  name: string;
  logo_url: string;
  industry: string[];
  company_size: string;
  company_type: string;
  location: string;
  city: string;
  province: string;
  website: string;
  description: string;
}

export interface HrdPrefsState {
  preferred_roles: string[];
  hiring_types: string[];
  work_modes: string[];
  candidate_experience: string[];
  preferred_skills: string[];
}

function emptyHrd(): HrdOnboardingState {
  return {
    onboarding_step: 1,
    full_name: "", phone: "", position: "", avatar_url: "", name: "",
    logo_url: "", industry: [], company_size: "", company_type: "",
    location: "", city: "", province: "", website: "", description: "",
  };
}

function emptyPrefs(): HrdPrefsState {
  return {
    preferred_roles: [], hiring_types: [], work_modes: [],
    candidate_experience: [], preferred_skills: [],
  };
}

export default function HrdOnboarding({
  initial,
  initialPrefs,
}: {
  initial: Partial<HrdOnboardingState> | null;
  initialPrefs: Partial<HrdPrefsState> | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<HrdOnboardingState>({
    ...emptyHrd(),
    ...(initial || {}),
  });
  const [prefs, setPrefs] = useState<HrdPrefsState>({ ...emptyPrefs(), ...(initialPrefs || {}) });
  const [step, setStep] = useState(
    Math.min(Math.max(initial?.onboarding_step || 1, 1), STEPS.length)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof HrdOnboardingState>(key: K, value: HrdOnboardingState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setPref<K extends keyof HrdPrefsState>(key: K, value: HrdPrefsState[K]) {
    setPrefs((f) => ({ ...f, [key]: value }));
  }

  function validateStep(stepNum: number): boolean {
    const next: Record<string, string> = {};
    if (stepNum === 1) {
      if (!form.full_name.trim()) next.full_name = "Full name is required.";
      if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number (min 8 digits).";
      if (!form.position.trim()) next.position = "Position / job title is required.";
    }
    if (stepNum === 2) {
      if (!form.name.trim()) next.name = "Company name is required.";
      if (!form.company_size) next.company_size = "Select your company size.";
    }
    if (stepNum === 3) {
      if (!form.company_type) next.company_type = "Select a company type.";
      if (form.industry.length === 0) next.industry = "Select at least one industry.";
    }
    if (stepNum === 4) {
      if (prefs.preferred_roles.length === 0) next.preferred_roles = "Select at least one candidate role.";
    }
    if (stepNum === 5) {
      if (prefs.hiring_types.length === 0) next.hiring_types = "Select at least one hiring type.";
      if (prefs.work_modes.length === 0) next.work_modes = "Select at least one work mode.";
      if (prefs.candidate_experience.length === 0) next.candidate_experience = "Select candidate experience level(s).";
      if (prefs.preferred_skills.length < MIN_SKILLS) next.preferred_skills = `Select at least ${MIN_SKILLS} skills.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveCurrentStep(nextStep: number) {
    const data: Record<string, unknown> = {
      ...form,
      onboarding_step: nextStep,
      industry: form.industry.length ? form.industry.join(", ") : null,
    };
    const res = await saveHrdStep(step, data, { ...prefs });
    return res;
  }

  async function handleContinue() {
    if (saving) return;
    if (!validateStep(step)) return;
    setSaving(true);
    try {
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

  const isFinalReview = step === STEPS.length;

  async function handleComplete() {
    if (saving) return;
    setSaving(true);
    const res = await completeHrdOnboarding();
    setSaving(false);
    if ((res as any)?.error) {
      setErrors({ form: (res as any).error });
      return;
    }
    router.push("/onboarding/hrd/complete");
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <Field label="Full Name" required error={errors.full_name}>
              <input className={inputCls} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="e.g. Rina Kusuma" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" required error={errors.phone}>
                <input className={inputCls} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+62 811 0000 0000" />
              </Field>
              <Field label="Position / Job Title" required error={errors.position}>
                <SelectInput options={HRD_POSITIONS} value={form.position} onChange={(v) => set("position", v)} placeholder="Select your position" />
              </Field>
            </div>
            <p className="text-xs text-slate-500">Your work email is taken from your account email.</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <Field label="Company Name" required error={errors.name}>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. PT Teknologi Indonesia" />
            </Field>
            <Field label="Company Logo URL">
              <input className={inputCls} value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Company Size" required error={errors.company_size}>
              <ChipGroup options={COMPANY_SIZES} value={form.company_size ? [form.company_size] : []} onChange={(v) => set("company_size", v[0] || "")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Location">
                <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Jakarta, Indonesia" />
              </Field>
              <Field label="Website">
                <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://company.com" />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="City">
                <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Jakarta" />
              </Field>
              <Field label="Province">
                <input className={inputCls} value={form.province} onChange={(e) => set("province", e.target.value)} placeholder="e.g. DKI Jakarta" />
              </Field>
            </div>
            <Field label="Company Description">
              <textarea className={textareaCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell candidates what your company does..." />
            </Field>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Field label="Company Type" required error={errors.company_type}>
              <ChipGroup options={COMPANY_TYPES} value={form.company_type ? [form.company_type] : []} onChange={(v) => set("company_type", v[0] || "")} />
            </Field>
            <MultiSelect
              label="Industry"
              options={[...INDUSTRIES]}
              value={form.industry}
              onChange={(v) => set("industry", v)}
              error={errors.industry}
              helpText="Select one or more industries your company operates in."
            />
          </div>
        );

      case 4:
        return (
          <div>
            <Field label="Preferred Candidate Roles" required error={errors.preferred_roles}>
              <MultiSelect
                label="Tools"
                options={[...HRD_CANDIDATE_ROLES]}
                value={prefs.preferred_roles}
                onChange={(v) => setPref("preferred_roles", v)}
                min={1}
                helpText="Select all roles your company hires for."
              />
            </Field>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Field label="Hiring Types" required error={errors.hiring_types}>
              <ChipGroup options={WORK_TYPES} multiple value={prefs.hiring_types} onChange={(v) => setPref("hiring_types", v)} />
            </Field>
            <Field label="Work Mode" required error={errors.work_modes}>
              <ChipGroup options={WORK_LOCATIONS} multiple value={prefs.work_modes} onChange={(v) => setPref("work_modes", v)} />
            </Field>
            <Field label="Preferred Candidate Experience" required error={errors.candidate_experience}>
              <ChipGroup options={[...EXPERIENCE_LEVELS]} multiple value={prefs.candidate_experience} onChange={(v) => setPref("candidate_experience", v)} />
            </Field>
            <MultiSelect
              label="Preferred Skills"
              options={["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PHP", "Laravel", "Python", "Java", "C++", "SQL", "UI/UX Design", "Figma", "Graphic Design", "Networking", "Linux", "Cloud Computing", "AWS", "Docker", "Cybersecurity", "Database", "MySQL", "PostgreSQL", "Git", "GitHub", "Project Management", "Agile", "Communication", "Leadership", "Data Analysis", "Machine Learning", "SEO", "Copywriting", "Content Writing", ...EDUCATION_LEVELS]}
              value={prefs.preferred_skills}
              onChange={(v) => setPref("preferred_skills", v)}
              min={MIN_SKILLS}
              searchable
              error={errors.preferred_skills}
              helpText={`Select at least ${MIN_SKILLS} skills your candidates should have.`}
            />
          </div>
        );

      case 6:
        return renderReview();

      default:
        return null;
    }
  }

  function renderReview() {
    const profile: [string, string][] = [
      ["HRD Information", [form.full_name, form.phone, form.position].filter(Boolean).join(" · ") || "—"],
      ["Company", [form.name, form.company_size, form.location].filter(Boolean).join(" · ") || "—"],
      ["Industry", form.industry.join(", ") || "—"],
      ["Company Type", form.company_type || "—"],
    ];
    const hiring: [string, string][] = [
      ["Preferred Roles", prefs.preferred_roles.join(", ") || "—"],
      ["Hiring Types", prefs.hiring_types.join(", ") || "—"],
      ["Work Mode", prefs.work_modes.join(", ") || "—"],
      ["Candidate Experience", prefs.candidate_experience.join(", ") || "—"],
      ["Preferred Skills", prefs.preferred_skills.join(", ") || "—"],
    ];

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Recruiter & Company</p>
          {profile.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="mt-0.5 break-words text-sm text-slate-600">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Recruitment Preferences</p>
          {hiring.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="mt-0.5 break-words text-sm text-slate-600">{value}</p>
              </div>
              <button type="button" onClick={() => setStep(label === "Preferred Roles" ? 4 : 5)} className="shrink-0 text-sm font-medium text-blue-700 hover:underline cursor-pointer">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const titles: Record<number, [string, string]> = {
    1: ["Tell us about yourself", "Share the recruiter information candidates will see."],
    2: ["Tell us about your company", "Help candidates understand who you are."],
    3: ["Company type & industry", "Define where your company operates."],
    4: ["What kind of talent are you looking for?", "Select the roles your company typically hires."],
    5: ["Hiring preferences", "Define how and who your company likes to hire."],
    6: ["Review", "Confirm your company profile before submitting."],
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <StepProgress steps={STEPS} current={step} />

      <div className="mb-6 mt-6">
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
                <BadgeCheck className="h-4 w-4" /> Complete Company Profile
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
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