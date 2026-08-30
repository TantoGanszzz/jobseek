"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import type { JobStatus } from "@/types/database";

/** Admin moderation: approve (published) or reject any job. */
export async function moderateJobAction(
  jobId: string,
  status: Extract<JobStatus, "published" | "rejected" | "closed">
): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/dashboard");
  revalidatePath("/jobs");
  return { ok: true };
}
