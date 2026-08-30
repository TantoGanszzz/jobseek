import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Returns a short-lived signed URL for the caller's own CV.
 * RLS on storage additionally restricts reads; this keeps the flow simple.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "";

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only allow access to files inside the caller's own folder.
  if (!path.startsWith(`${user.userId}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("cvs")
    .createSignedUrl(path, 120);

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ url: data.signedUrl });
}
