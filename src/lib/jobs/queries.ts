import type { SupabaseClient } from "@supabase/supabase-js";
import type { EmploymentType, JobWithCompany } from "@/types/database";

const JOB_SELECT = `
  id, company_id, created_by, title, description, location,
  employment_type, salary_min, salary_max, requirements, status,
  created_at, updated_at,
  companies!inner ( company_name, logo_url )
`;

type RawJobRow = {
  [K in keyof Omit<JobWithCompany, "company_name" | "company_logo_url">]: JobWithCompany[K];
} & {
  companies: { company_name: string | null; logo_url: string | null } | null;
};

function mapJob(row: RawJobRow): JobWithCompany {
  const { companies, ...job } = row;
  return {
    ...job,
    company_name: companies?.company_name ?? null,
    company_logo_url: companies?.logo_url ?? null,
  };
}

export interface JobQueryFilters {
  search?: string;
  location?: string;
  employmentType?: string;
  salaryMin?: number;
  page?: number;
  perPage?: number;
}

export async function queryPublishedJobs(
  supabase: SupabaseClient,
  filters: JobQueryFilters = {}
): Promise<{ jobs: JobWithCompany[]; total: number }> {
  const { search, location, employmentType, salaryMin, page = 1, perPage = 12 } =
    filters;

  let builder = supabase
    .from("jobs")
    .select(JOB_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) {
    builder = builder.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }
  if (location) {
    builder = builder.ilike("location", `%${location}%`);
  }
  if (
    employmentType &&
    ["full_time", "part_time", "internship", "contract", "freelance"].includes(
      employmentType
    )
  ) {
    builder = builder.eq("employment_type", employmentType as EmploymentType);
  }
  if (salaryMin && !Number.isNaN(salaryMin)) {
    builder = builder.gte("salary_max", salaryMin);
  }

  const { data, error, count } = await builder;

  if (error) throw new Error(error.message);

  return {
    jobs: ((data ?? []) as unknown as RawJobRow[]).map(mapJob),
    total: count ?? 0,
  };
}

/** Fetch one published job with its company. Returns null when unavailable. */
export async function getPublishedJob(
  supabase: SupabaseClient,
  jobId: string
): Promise<JobWithCompany | null> {
  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("id", jobId)
    .eq("status", "published")
    .maybeSingle();

  return data ? mapJob(data as unknown as RawJobRow) : null;
}
