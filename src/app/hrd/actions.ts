"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import type { ApplicationStatus, EmploymentType, JobStatus } from "@/types/database";

const EMPLOYMENT_TYPES_SET = new Set([
  "full_time",
  "part_time",
  "internship",
  "contract",
  "freelance",
]);

/** Creates or updates the HRD's own company profile. */
export async function saveCompanyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const companyName = String(formData.get("company_name") ?? "").trim();
  if (!companyName) return { ok: false, error: "Company name is required." };

  // Optional logo upload (path convention: company-logos/<user_id>/<file>).
  const logoFile = formData.get("logo");
  let logoUrl: string | undefined;
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!logoFile.type.startsWith("image/")) {
      return { ok: false, error: "Logo must be an image file." };
    }
    if (logoFile.size > 2 * 1024 * 1024) {
      return { ok: false, error: "Logo must be smaller than 2MB." };
    }
    const ext = logoFile.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${user.userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("company-logos")
      .upload(path, logoFile, { upsert: true });
    if (error) return { ok: false, error: `Logo upload failed: ${error.message}` };
    const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
    logoUrl = data.publicUrl;
  }

  const values: Record<string, string | null> = {
    company_name: companyName,
    description: String(formData.get("description") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    website: String(formData.get("website") ?? "").trim() || null,
    industry: String(formData.get("industry") ?? "").trim() || null,
  };

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.userId)
    .maybeSingle();

  let error;
  if (existing) {
    ({ error } = await supabase.from("companies").update(values).eq("id", existing.id));
  } else {
    ({ error } = await supabase.from("companies").insert({ owner_id: user.userId, ...values }));
  }
  if (error) return { ok: false, error: error.message };

  if (logoUrl && existing) {
    const { error: logoError } = await supabase
      .from("companies")
      .update({ logo_url: logoUrl })
      .eq("id", existing.id);
    if (logoError) return { ok: false, error: logoError.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Company profile saved." };
}

function parseJobForm(formData: FormData): Record<string, unknown> | string {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const employmentType = String(formData.get("employment_type") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const salaryMinRaw = String(formData.get("salary_min") ?? "").replace(/[^\d]/g, "");
  const salaryMaxRaw = String(formData.get("salary_max") ?? "").replace(/[^\d]/g, "");

  if (!title) return "Job title is required.";
  if (!description) return "Description is required.";
  if (!EMPLOYMENT_TYPES_SET.has(employmentType)) return "Choose a valid employment type.";
  if (!["draft", "pending", "published", "closed"].includes(status))
    return "Invalid status.";

  const salaryMin = salaryMinRaw ? Number(salaryMinRaw) : null;
  const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw) : null;
  if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
    return "Minimum salary cannot exceed maximum salary.";
  }

  return {
    title,
    description,
    location: String(formData.get("location") ?? "").trim() || null,
    requirements: String(formData.get("requirements") ?? "").trim() || null,
    employment_type: employmentType as EmploymentType,
    salary_min: salaryMin,
    salary_max: salaryMax,
    status: status as JobStatus,
  };
}

export async function createJobAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const parsed = parseJobForm(formData);
  if (typeof parsed === "string") return { ok: false, error: parsed };

  // Resolve the caller's company (created automatically at signup).
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.userId)
    .maybeSingle();

  let companyId: string;
  if (!company) {
    const { data: created, error } = await supabase
      .from("companies")
      .insert({ owner_id: user.userId, company_name: "My Company" })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    companyId = created.id;
  } else {
    companyId = company.id;
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      ...(parsed as Record<string, unknown>),
      company_id: companyId,
      created_by: user.userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/hrd/jobs");
  revalidatePath("/jobs");
  return { ok: true, message: job.id };
}

export async function updateJobAction(
  jobId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const parsed = parseJobForm(formData);
  if (typeof parsed === "string") return { ok: false, error: parsed };

  const { error } = await supabase
    .from("jobs")
    .update(parsed)
    .eq("id", jobId)
    .eq("created_by", user.userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/hrd/jobs");
  revalidatePath(`/hrd/jobs/${jobId}`);
  revalidatePath("/jobs");
  return { ok: true, message: "Job updated." };
}

export async function setJobStatusAction(
  jobId: string,
  status: JobStatus
): Promise<ActionState> {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const allowed: JobStatus[] = ["draft", "pending", "published", "closed"];
  if (!allowed.includes(status)) return { ok: false, error: "Invalid status." };

  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId)
    .eq("created_by", user.userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/hrd/jobs");
  revalidatePath(`/hrd/jobs/${jobId}`);
  revalidatePath("/jobs");
  return { ok: true };
}

export async function deleteJobAction(jobId: string): Promise<ActionState> {
  const user = await requireRole("hrd");
  const supabase = await createClient();

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("created_by", user.userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/hrd/jobs");
  revalidatePath("/jobs");
  return { ok: true };
}

/** HRD updates an applicant's status on one of their own jobs. */
export async function setApplicationStatusAction(
  applicationId: string,
  status: ApplicationStatus
): Promise<ActionState> {
  const user = await requireRole("hrd");
  const valid: ApplicationStatus[] = [
    "applied",
    "reviewing",
    "shortlisted",
    "interview",
    "accepted",
    "rejected",
  ];
  if (!valid.includes(status)) return { ok: false, error: "Invalid status." };

  const supabase = await createClient();

  // Verify the application belongs to one of this HRD's own jobs.
  const { data: owned } = await supabase
    .from("applications")
    .select("id, jobs!inner(created_by)")
    .eq("id", applicationId)
    .eq("jobs.created_by", user.userId)
    .maybeSingle();

  if (!owned) {
    return {
      ok: false,
      error: "You can only manage applications for your own jobs.",
    };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/hrd/applicants");
  revalidatePath("/hrd/dashboard");
  revalidatePath("/jobseeker/applications");
  return { ok: true };
}
