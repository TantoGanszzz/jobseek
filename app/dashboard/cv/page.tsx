import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FileText, Upload } from "lucide-react";
import { getDashboardUser } from "@/lib/dashboard-helpers";

export default async function UserCvPage() {
  const supabase = await createClient();
  const dashUser = await getDashboardUser();

  let profile: any = null;
  try {
    const { data } = await supabase.from("profiles").select("full_name, resume_url").eq("id", dashUser.id).single();
    profile = data;
  } catch {}

  const cvs = profile?.resume_url
    ? [{ name: profile.full_name ? `${profile.full_name}'s CV` : "My CV", url: profile.resume_url, updated: "-" }]
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My CV</h1>
        <p className="mt-1 text-sm text-slate-500">Upload and manage the CV used for job applications.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">CV Management</h2>
          <Link
            href="/dashboard/profile/edit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" /> Upload CV
          </Link>
        </div>

        {cvs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No CV uploaded yet. Add a resume URL in your profile.
          </div>
        ) : (
          <div className="space-y-3">
            {cvs.map((cv) => (
              <div key={cv.name} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{cv.name}</div>
                    <div className="text-sm text-slate-500">{cv.updated}</div>
                  </div>
                </div>
                <a
                  href={cv.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  View CV
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}