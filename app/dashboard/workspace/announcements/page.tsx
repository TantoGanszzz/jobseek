import type { Metadata } from "next";
import { getEmployeeAnnouncements } from "@/lib/hrd/services";
import { getDashboardUser } from "@/lib/dashboard-helpers";
import { Megaphone, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Announcements — Jobseek",
  description: "Company announcements for your team.",
};

export default async function EmployeeAnnouncementsPage() {
  const dashUser = await getDashboardUser();
  const announcements = getEmployeeAnnouncements(dashUser.id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="mt-1 text-sm text-slate-500">Updates from your company&apos;s HRD.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(({ announcement, companyName }) => (
            <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{announcement.title}</h2>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <Building2 className="h-3 w-3" /> {companyName || "Company"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(announcement.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{announcement.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}