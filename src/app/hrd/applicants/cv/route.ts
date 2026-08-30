import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

/**
 * Redirects the owning HRD to a short-lived signed URL for an applicant's CV.
 * Verifies the application belongs to one of this HRD's jobs first.
 * Handles both stored formats: bare object paths ("<uid>/<file>") and
 * full public URLs (".../object/public/cvs/<uid>/<file>").
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("app") ?? "";
  if (!applicationId) {
    return NextResponse.json({ error: "Missing application id" }, { status: 400 });
  }

  const user = await requireRole("hrd");
  const supabase = await createClient();

  // Ownership check: the job behind this application must belong to the caller.
  const { data: rows } = await supabase
    .from("applications")
    .select("cv_url, profiles ( cv_url ), jobs!inner ( created_by )")
    .eq("id", applicationId)
    .eq("jobs.created_by", user.userId)
    .limit(1);

  const row = rows?.[0] as
    | {
        cv_url: string | null;
        profiles: { cv_url: string | null } | null;
      }
    | undefined;

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Prefer the CV attached to the application; fall back to the profile CV.
  const raw = row.cv_url || row.profiles?.cv_url || "";
  const fromUrl = raw.match(/\/object\/(?:public\/)?cvs\/(.+)$/);
  const objectPath = fromUrl
    ? decodeURIComponent(fromUrl[1])
    : raw.replace(/^cvs\//, "");

  // Sanity check: object paths are "<user_id>/<filename>".
  if (!objectPath || !/^[0-9a-f-]{36}\//i.test(objectPath)) {
    return NextResponse.json({ error: "No CV on file" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("cvs")
    .createSignedUrl(objectPath, 120);

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl);
}
